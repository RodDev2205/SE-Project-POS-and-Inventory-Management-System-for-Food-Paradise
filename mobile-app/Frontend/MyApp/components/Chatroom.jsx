import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function Chatroom({ branchName, branchId, onClose, isOnline = true }) {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How are you?', sender: 'other', time: '2:50 pm' },
    { id: '2', text: 'I\'m good, thanks! How about you?', sender: 'me', time: '2:51 pm' },
    { id: '3', text: 'Doing great! Any updates on the inventory?', sender: 'other', time: '2:55 pm' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <View style={[styles.branchAvatar, { backgroundColor: branchId === '1' ? '#a78bfa' : '#60a5fa' }]}>
              <Text style={styles.branchAvatarText}>{branchId}</Text>
            </View>
            <View style={[styles.headerStatusIndicator, { backgroundColor: isOnline ? '#10b981' : '#9ca3af' }]} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{branchName}</Text>
            <Text style={styles.headerStatusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showMenu && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setShowMenu(false);
              setShowAboutUs(true);
            }}
          >
            <Text style={styles.dropdownItemText}>About Us</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About Us Modal */}
      <Modal
        visible={showAboutUs}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutUs(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Food Paradise</Text>
              <TouchableOpacity onPress={() => setShowAboutUs(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                Food Paradise is your ultimate destination for delicious food and exceptional service.
              </Text>
              <Text style={styles.modalText}>
                We deliver premium quality food with fast, reliable service across multiple branch locations.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'me' ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
            ]}>
              {msg.text}
            </Text>
            <Text style={[
              styles.messageTime,
              msg.sender === 'me' ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachBtn}
          onPress={() => setShowAttachment(!showAttachment)}
        >
          <Ionicons name="attach" size={24} color="#666" />
        </TouchableOpacity>
        {showAttachment && (
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.attachmentItem}
              onPress={() => {
                setShowAttachment(false);
                // Handle image selection
              }}
            >
              <Ionicons name="image-outline" size={18} color="#10b981" />
              <Text style={styles.attachmentItemText}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentItem}
              onPress={() => {
                setShowAttachment(false);
                // Handle document selection
              }}
            >
              <Ionicons name="document-outline" size={18} color="#3b82f6" />
              <Text style={styles.attachmentItemText}>Documents</Text>
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
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
  moreBtn: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
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
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
});
