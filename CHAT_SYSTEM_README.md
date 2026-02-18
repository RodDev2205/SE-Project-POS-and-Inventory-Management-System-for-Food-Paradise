# Chat Room System - Real-time Socket.IO Implementation

## Overview

This is a real-time chat system built with **Socket.IO** that automatically creates chat rooms for each branch and adds all admins + superadmins to their respective branch rooms.

### Key Features

✅ **Auto Room Creation** — Chat rooms are automatically created when a branch exists  
✅ **Auto User Assignment** — All admins/superadmins are automatically added to their branch chat  
✅ **Real-time Messaging** — Socket.IO for instant message delivery  
✅ **Message History** — Last 50 messages fetched on room join  
✅ **Sender Info** — Messages include sender name and timestamp  
✅ **JWT Authentication** — Socket connections secured with JWT tokens  

---

## Database Setup

### 1. Create Chat Tables

Run this SQL script in your MySQL database:

```bash
mysql -u root -p your_database_name < backend/init-chat-db.sql
```

Or copy-paste the queries from `backend/init-chat-db.sql` directly into MySQL Workbench/CLI.

**Tables created:**
- `chat_rooms` — One room per branch
- `chat_room_members` — User membership in rooms
- `messages` — All messages sent

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Frontend JWT Decoder

The frontend needs `jwt-decode` to read the token and get the current user ID. Install it:

```bash
cd web-app/frontend
npm install jwt-decode
```

### 3. Environment Variables

Create `backend/.env` if not already present:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret_key
PORT=5200
```

### 4. Current Backend Structure

```
backend/
├── server.js                    # Socket.IO server setup
├── src/
│   ├── app.js                   # Express app with chat routes
│   ├── config/db.js             # MySQL connection
│   ├── controllers/
│   │   └── chatController.js    # Chat logic (ensureChatRoomExists, etc)
│   ├── routes/
│   │   └── chatRoutes.js        # REST endpoints for chat
│   ├── socket/
│   │   └── chatSocket.js        # Socket.IO connection handlers
│   └── middlewares/
│       └── verifyToken.js       # JWT verification
└── init-chat-db.sql             # Database initialization
```

---

## API Endpoints

### Get All Branches with Last Message

**GET** `/api/chat/branches-with-messages`

Headers: `Authorization: Bearer {token}`

**Role Required:** Admin (1) or Superadmin (2, 3)

**Response:**
```json
[
  {
    "branch_id": 1,
    "branch_name": "Main Branch",
    "lastMessage": "Hey, how are you?",
    "lastTime": "2:30 PM",
    "sender_name": "John Doe"
  }
]
```

### Get Branch Messages

**GET** `/api/chat/branch/{branch_id}`

Headers: `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "message_id": 1,
    "sender_id": 5,
    "full_name": "John Doe",
    "username": "john_doe",
    "message": "Hello everyone!",
    "created_at": "2026-02-18T14:30:00.000Z"
  }
]
```

---

## Socket.IO Events

### Client → Server

**Connect with Auth Token:**
```javascript
const socket = io("http://localhost:5200", {
  auth: { token: localStorage.getItem("token") }
});
```

**Join Branch Room:**
```javascript
socket.emit("joinBranchRoom", { branch_id: 1 });
```

**Send Message:**
```javascript
socket.emit("sendMessage", {
  branch_id: 1,
  message: "Hello team!"
});
```

### Server → Client

**Receive Message:**
```javascript
socket.on("receiveMessage", (msg) => {
  // msg = { message_id, sender_id, full_name, username, message, created_at }
});
```

**User Joined:**
```javascript
socket.on("userJoined", (data) => {
  // { user_id, message: "User joined the chat" }
});
```

**User Left:**
```javascript
socket.on("userLeft", (data) => {
  // { user_id, message: "User left the chat" }
});
```

**Connection Error:**
```javascript
socket.on("connect_error", (err) => {
  console.error(err);
});
```

---

## Frontend Component

The new `ChatRoomPage.jsx` includes:

✅ **Automatic User Detection** — Decodes JWT to get current user ID  
✅ **Branch Sidebar** — Lists all branches with last message preview  
✅ **Real-time Chat** — Messages update instantly via Socket.IO  
✅ **Auto-scroll** — Scrolls to latest message  
✅ **Loading States** — Shows "Loading..." while fetching  
✅ **Proper Message Bubbles** — Colors differ for current user vs others  

### Key Features:

```javascript
// Decode JWT and get current user
const decoded = jwtDecode(token);
setCurrentUser(decoded); // { user_id, role_id, branch_id, ... }

// Compare sender to highlight own messages
const isCurrentUser = msg.sender_id === currentUser.user_id;

// Display sender name for other users
{!isCurrentUser && <p>{msg.full_name || msg.username}</p>}
```

---

## Running the Application

### Terminal 1 — Backend Server

```bash
cd backend
npm run dev
# Backend will start on http://localhost:5200
```

### Terminal 2 — Frontend Dev Server

```bash
cd web-app/frontend
npm run dev
# Frontend will start on http://localhost:5173 (or similar)
```

### Access the Chat

1. Login with admin/superadmin credentials
2. Navigate to **Chat Room** in the dashboard
3. Select a branch from the sidebar
4. Start chatting!

---

## How It Works

### Automatic Room Creation Flow:

```
1. User logs in as admin/superadmin
2. User opens ChatRoomPage
3. Frontend calls: GET /api/chat/branches-with-messages
4. Backend's ensureChatRoomExists() runs:
   - Checks if chat_rooms entry exists for branch
   - If not, creates it
   - Fetches all admins/superadmins for that branch
   - Adds them to chat_room_members
5. Frontend displays branches with last message
6. User clicks a branch
7. Frontend emits: socket.emit("joinBranchRoom", { branch_id })
8. Backend joins socket to room: socket.join("branch_{branch_id}")
9. User can now send/receive messages in real-time
```

### Message Flow:

```
User A sends message
  ↓
Frontend: socket.emit("sendMessage", { branch_id, message })
  ↓
Backend: Insert into messages table
  ↓
Backend: io.to("branch_1").emit("receiveMessage", {...})
  ↓
All users in room receive message instantly
  ↓
User B's frontend updates state and re-renders
```

---

## Troubleshooting

### **"Authentication error: No token"**
- Ensure token is in localStorage
- Check `localStorage.getItem("token")` in browser console

### **"Access denied: insufficient permissions"**
- Only admin (role_id: 1) and superadmin (role_id: 2, 3) can chat
- Check user role in database

### **Messages not appearing**
- Check browser console for Socket.IO errors
- Verify backend is running on port 5200
- Check that `chat_rooms` table exists

### **"Cannot find module 'jwt-decode'"**
```bash
cd web-app/frontend
npm install jwt-decode
```

### **Database connection fails**
- Verify `.env` has correct DB credentials
- Ensure MySQL is running
- Run `init-chat-db.sql` to create tables

---

## Important Notes

⚠️ **Role IDs:**
- 1 = Admin (branch-specific)
- 2 = Superadmin
- 3 = Superadmin (global)

⚠️ **User Status:**
- Only users with `status = 'Activate'` can be added to chat rooms

⚠️ **Auto-save:**
- Messages are saved to database immediately
- History persists across sessions

⚠️ **CORS:**
- Backend CORS is set to `origin: '*'`  
- For production, change to specific frontend URL:
```javascript
// server.js
const io = new Server(httpServer, {
  cors: {
    origin: "https://yourdomain.com",
  },
});
```

---

## Next Steps (Optional Enhancements)

- [ ] Add typing indicators ("User is typing...")
- [ ] Add online/offline status
- [ ] Add message reactions/emoji
- [ ] Add file/image uploads
- [ ] Add message search
- [ ] Add message edit/delete
- [ ] Add user profiles with avatars
- [ ] Add message notifications
- [ ] Implement seen/unseen status

---

## Files Modified/Created

| File | Status | Changes |
|------|--------|---------|
| `backend/init-chat-db.sql` | **NEW** | Database schema |
| `backend/src/controllers/chatController.js` | **UPDATED** | Added `ensureChatRoomExists()`, improved message fetching |
| `backend/src/routes/chatRoutes.js` | **UPDATED** | Added `/branches-with-messages` endpoint |
| `backend/src/socket/chatSocket.js` | **UPDATED** | Enhanced Socket.IO handlers, auto-room-creation |
| `web-app/frontend/src/pages/ChatRoomPage.jsx` | **UPDATED** | Complete rewrite with proper user context |

---

## Support

If issues persist:
1. Check backend console for error logs
2. Check browser console (F12) for frontend errors
3. Verify database tables exist: `SHOW TABLES;`
4. Test socket connection: `socket.on("connect", () => console.log("Connected"))`
