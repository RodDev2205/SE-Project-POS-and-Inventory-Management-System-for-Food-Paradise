import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Colors } from '@/constants/theme';
import { NotificationContext } from '@/context/NotificationContext';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const SOCKET_URL = 'https://deployment-backend-repo-production.up.railway.app';

export default function Chatroom({ branchName, branchId, onClose, isOnline = true, onNewMessage }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [modalImage, setModalImage] = useState(null); // { url, name }
  const { auth } = useContext(NotificationContext);
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);
  const currentUserRef = useRef(null);

  // Log when messages change and notify parent of latest message
  useEffect(() => {
    console.log('✅ Messages state updated. Current count:', messages.length);
    setLoading(false);
    if (onNewMessage && messages.length > 0) {
      const last = messages[messages.length - 1];
      onNewMessage(branchId, last.text, last.senderName, last.time);
    }
  }, [messages]);

  // Log when component mounts
  useEffect(() => {
    console.log('🎯 Chatroom component mounted. Branch:', branchName, 'ID:', branchId);
  }, [branchName, branchId]);

  // Initialize socket and fetch messages
  useEffect(() => {
    if (!auth?.token || !branchId) return;

    const initializeChat = async () => {
      try {
        // Decode token to get current user info
        const decoded = jwtDecode(auth.token);
        currentUserRef.current = decoded;

        // Fetch messages from API
        const messageResponse = await fetch(
          `https://deployment-backend-repo-production.up.railway.app/api/chat/branch/${branchId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${auth.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!messageResponse.ok) throw new Error('Failed to fetch messages');
        const messagesData = await messageResponse.json();
        
        console.log('📡 Raw API response:', messagesData);
        console.log('📡 Messages fetched:', Array.isArray(messagesData) ? messagesData.length : 'NOT AN ARRAY', 'messages');
        
        // Handle if response is wrapped in a data property
        const messageArray = Array.isArray(messagesData) ? messagesData : (messagesData.data || []);
        console.log('📡 Actual message array length:', messageArray.length);
        
        // Format messages for display
        const formattedMessages = messageArray.map((msg) => {
          console.log('📝 Formatting message:', msg);
          return {
            id: msg.id || msg.message_id,
            text: msg.message,
            sender: msg.sender_id === decoded.user_id ? 'me' : 'other',
            senderName: msg.full_name || msg.username || 'Unknown',
            time: new Date(msg.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            messageType: msg.message_type,
            attachmentUrl: msg.attachment_url,
            attachmentName: msg.attachment_name,
          };
        });
        
        console.log('✅ Formatted messages:', formattedMessages.length);
        console.log('✅ Setting messages to state:', formattedMessages);
        setMessages(formattedMessages);
        // parent will be notified via messages effect below

        // Initialize Socket.IO connection
        socketRef.current = io(SOCKET_URL, {
          auth: {
            token: auth.token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        // Socket connection events
        socketRef.current.on('connect', () => {
          console.log('🔌 Socket connected. ID:', socketRef.current.id);
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected. Reason:', reason);
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('🔌 Socket connection error:', error);
        });

        // Join branch room
        socketRef.current.emit('joinBranchRoom', { branch_id: parseInt(branchId) });
        console.log('🚪 Emitted joinBranchRoom event for branch:', branchId);

        // Listen for new messages
        socketRef.current.on('receiveMessage', (data) => {
          console.log('📨 New message received via socket:', data.message_id, data.message);
          const newMessage = {
            id: data.message_id,
            text: data.message,
            sender: data.sender_id === decoded.user_id ? 'me' : 'other',
            senderName: data.full_name || data.username || 'Unknown',
            time: new Date(data.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            messageType: data.message_type,
            attachmentUrl: data.attachment_url,
            attachmentName: data.attachment_name,
          };
          setMessages((prev) => {
            const updated = [...prev, newMessage];
            console.log('💬 Messages count after socket update:', updated.length);
            return updated;
          });
        });

        // Listen for user events
        socketRef.current.on('userJoined', (data) => {
          console.log('👥 User joined:', data.user_id);
        });

        socketRef.current.on('userLeft', (data) => {
          console.log('👥 User left:', data.user_id);
        });

        socketRef.current.on('error', (error) => {
          console.error('🔌 Socket error:', error);
        });

        setLoading(false);
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        console.log('❌ Current messages loaded:', messages.length);
        setLoading(false);
        Alert.alert('Error', `Failed to load chat: ${error.message}`);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [auth?.token, branchId]);

  const handleSend = () => {
    if (!message.trim() || !socketRef.current) {
      console.log('❌ Send blocked - Empty message or no socket:', {
        messageEmpty: !message.trim(),
        socketExists: !!socketRef.current,
      });
      return;
    }

    console.log('📤 Sending message:', message.trim());
    setSending(true);
    
    // Emit message through socket
    socketRef.current.emit('sendMessage', {
      branch_id: parseInt(branchId),
      message: message.trim(),
      message_type: 'text',
    });

    console.log('✉️ sendMessage event emitted');

    // Clear input
    setMessage('');
    setSending(false);
  };

  const uploadFile = async (fileUri, fileName, messageType) => {
    try {
      setUploadingFile(true);
      
      const formData = new FormData();
      
      // Create a proper file blob for FormData
      const fileBlob = {
        uri: fileUri,
        type: messageType === 'image' ? 'image/jpeg' : 'application/octet-stream',
        name: fileName,
      };

      formData.append('file', fileBlob);

      console.log('Uploading file:', fileName, 'Type:', messageType);

      const uploadResponse = await fetch('https://deployment-backend-repo-production.up.railway.app/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', uploadResponse.status);
      const responseText = await uploadResponse.text();
      console.log('Upload response:', responseText);
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed (${uploadResponse.status}): ${responseText}`);
      }
      
      const uploadData = JSON.parse(responseText);
      console.log('Upload data received:', uploadData);

      // Send attachment message through socket
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending message via socket with attachment');
        socketRef.current.emit('sendMessage', {
          branch_id: parseInt(branchId),
          message: '',
          message_type: uploadData.message_type,
          attachment_url: uploadData.url,
          attachment_name: uploadData.attachment_name,
        });
      } else {
        throw new Error('Socket not connected. Please wait and try again.');
      }

      setShowAttachment(false);
      setUploadingFile(false);
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', `Failed to upload file: ${error.message}`);
      setUploadingFile(false);
    }
  };

  const downloadAndOpenFile = async (fileUrl, fileName) => {
    try {
      const fileExtension = fileName.split('.').pop();
      const mimeType = getMimeType(fileExtension);
      
      // Get the Documents directory path
      let dirPath = FileSystem.documentDirectory || FileSystem.DocumentDirectoryPath;
      
      if (!dirPath) {
        Alert.alert('Error', 'Unable to access device storage');
        return;
      }

      // Ensure dirPath ends with a slash
      if (!dirPath.endsWith('/')) {
        dirPath = dirPath + '/';
      }

      // Create a sanitized filename
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const downloadPath = `${dirPath}${sanitizedFileName}`;
      
      console.log('Documents directory:', dirPath);
      console.log('Downloading file to:', downloadPath);
      console.log('File URL:', `https://deployment-backend-repo-production.up.railway.app${fileUrl}`);

      const { uri } = await FileSystem.downloadAsync(
        `https://deployment-backend-repo-production.up.railway.app${fileUrl}`,
        downloadPath
      );
      
      console.log('File downloaded to:', uri);
      
      // Try to open file with appropriate app
      if (Platform.OS === 'android') {
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: uri,
            flags: 1,
          });
        } catch (e) {
          // Fallback: just alert the user where file was saved
          console.log('Could not open file, showing alert instead');
          Alert.alert('File Downloaded', `File saved to: ${sanitizedFileName}`, [
            { text: 'OK', onPress: () => {} }
          ]);
        }
      } else {
        // iOS: just save the file (user can access via Files app)
        Alert.alert('File Downloaded', `File saved as: ${sanitizedFileName}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      console.error('Error message:', error.message);
      Alert.alert('Download Error', `Failed to download file: ${error.message}`);
    }
  };

  // show image preview and allow saving
  const handleImagePress = (relativeUrl, name) => {
    setModalImage({
      url: `https://deployment-backend-repo-production.up.railway.app${relativeUrl}`,
      name: name || `image_${Date.now()}.jpg`,
    });
  };


  const getMimeType = (extension) => {
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
    };
    return mimeTypes[extension?.toLowerCase()] || 'application/octet-stream';
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'image.jpg';
        await uploadFile(asset.uri, fileName, 'image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name || asset.uri.split('/').pop() || 'document.pdf';
        console.log('Selected document:', fileName, 'URI:', asset.uri);
        await uploadFile(asset.uri, fileName, 'file');
      } else if (result.canceled) {
        console.log('Document picker cancelled by user');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', `Failed to pick document: ${error.message}`);
    }
  };


  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{branchName}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {modalImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: modalImage.url }} style={styles.modalImage} />
              <TouchableOpacity 
                onPress={() => setModalImage(null)} 
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.branchAvatar, { backgroundColor: '#60a5fa' }]}>
              <Text style={styles.branchAvatarText}>{branchName.charAt(0)}</Text>
            </View>
            <View
              style={[
                styles.headerStatusIndicator,
                { backgroundColor: isOnline ? '#10b981' : '#9ca3af' },
              ]}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{branchName}</Text>
            <Text style={styles.headerStatusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {console.log('🎬 Rendering messages. Count:', messages.length, 'Loading:', loading)}
        {messages.length === 0 ? (
          <View style={styles.emptyMessagesContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
            <Text style={[styles.emptyMessagesText, { fontSize: 12, marginTop: 8 }]}>Start the conversation!</Text>
          </View>
        ) : (
          messages.map((msg) => {
            console.log('🎬 Rendering individual message:', msg.id, msg.text);
            return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'me' ? styles.myMessage : styles.otherMessage,
              ]}
            >
              {msg.sender === 'other' && (
                <Text style={styles.senderName}>{msg.senderName}</Text>
              )}
              
              {/* Render attachment if present */}
              {msg.messageType === 'image' && msg.attachmentUrl ? (
                <TouchableOpacity onPress={() => handleImagePress(msg.attachmentUrl, msg.attachmentName)}>
                  <Image
                    source={{ uri: `https://deployment-backend-repo-production.up.railway.app${msg.attachmentUrl}` }}
                    style={styles.attachmentImage}
                  />
                </TouchableOpacity>
              ) : msg.messageType === 'file' && msg.attachmentUrl ? (
                <TouchableOpacity 
                  style={styles.fileAttachment}
                  onPress={() => downloadAndOpenFile(msg.attachmentUrl, msg.attachmentName)}
                >
                  <Ionicons name="download-outline" size={24} color={msg.sender === 'me' ? '#fff' : '#0066cc'} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text
                      style={[
                        styles.fileName,
                        msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
                      ]}
                      numberOfLines={2}
                    >
                      {msg.attachmentName || 'File'}
                    </Text>
                    <Text style={{ fontSize: 10, color: msg.sender === 'me' ? 'rgba(255,255,255,0.7)' : '#0066cc', marginTop: 2 }}>
                      Tap to download
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : msg.text ? (
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              ) : null}
              
              <Text
                style={[
                  styles.messageTime,
                  msg.sender === 'me' ? styles.myMessageTime : styles.otherMessageTime,
                ]}
              >
                {msg.time}
              </Text>
            </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[styles.attachBtn, uploadingFile && { opacity: 0.5 }]}
          onPress={() => setShowAttachment(!showAttachment)}
          disabled={uploadingFile}
        >
          <Ionicons name="attach" size={24} color="#666" />
        </TouchableOpacity>
        
        {showAttachment && !uploadingFile && (
          <View style={styles.attachmentMenu}>
            <TouchableOpacity style={styles.attachmentItem} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={18} color="#10b981" />
              <Text style={styles.attachmentItemText}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentItem} onPress={handlePickDocument}>
              <Ionicons name="document-outline" size={18} color="#3b82f6" />
              <Text style={styles.attachmentItemText}>Document</Text>
            </TouchableOpacity>
          </View>
        )}

        {uploadingFile && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color={Colors.primaryGreen} />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!sending && !uploadingFile}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (sending || uploadingFile) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending || uploadingFile || (!message.trim() && !uploadingFile)}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.primaryGreenDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 2,
    minHeight: 72,
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  branchAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerStatusIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.primaryGreenDark,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerStatusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryGreen,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  senderName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#111',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 6,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  attachBtn: {
    padding: 4,
  },
  attachmentMenu: {
    position: 'absolute',
    bottom: 50,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 1000,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attachmentItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
  },
  uploadingIndicator: {
    position: 'absolute',
    bottom: 50,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
  },
  uploadingText: {
    fontSize: 12,
    color: '#666',
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 4,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.3)',
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: Colors.primaryGreen,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
