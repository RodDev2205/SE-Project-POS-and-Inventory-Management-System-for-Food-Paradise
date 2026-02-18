import React, { useState } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Users,
  LogOut,
} from "lucide-react";

const branches = [
  { id: "branch1", name: "Ern Branch", lastMessage: "Magpainom kana bos", lastTime: "09:20 AM", unread: 0 },
  { id: "branch2", name: "Mar Branch", lastMessage: "Can we also get more rice sacks?", lastTime: "09:20 AM", unread: 2 },
  { id: "branch3", name: "Mommy Oni Branch", lastMessage: "Sales report ready", lastTime: "Yesterday", unread: 0 },
  { id: "branch4", name: "Ash Branch", lastMessage: "Delivery arrived", lastTime: "2h ago", unread: 1 },
];

const fakeMessages = [
  { id: 1, sender: "Admin", text: "HOY KEN YA PONE HALO BLOCK NA MIO BAG!!!!", time: "09:12 AM", isOwn: true },
  { id: 2, sender: "Rods", text: "Pala yalang palta pede ya ase kasa", time: "09:15 AM", isOwn: false },
  { id: 3, sender: "Admin", text: "peste gad kel ba ken ya pone!", time: "09:17 AM", isOwn: true },
  { id: 4, sender: "Claire", text: "boss rodolfo, mga bata mo kami!", time: "09:20 AM", isOwn: false },
  { id: 5, sender: "Maria", text: "6,7 😁", time: "09:20 AM", isOwn: false },
  { id: 6, sender: "Ern", text: "Miss na kita boss 🥲", time: "09:20 AM", isOwn: false },
  { id: 7, sender: "Jobert", text: "Magpainom kana boss", time: "09:20 AM", isOwn: false },
];

export default function ChatRoom() {
  const [activeBranchId, setActiveBranchId] = useState("branch1");
  const [message, setMessage] = useState("");

  const activeBranch =
    branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      {/* Content Wrapper */}
      <div className="flex flex-1 gap-2 p-2 min-h-0 overflow-hidden">

        {/* ================= CHAT AREA ================= */}
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm min-h-0 overflow-hidden">

          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {activeBranch.name}
                </h1>
                <p className="text-xs text-emerald-100">
                  Superadmin • Online
                </p>
              </div>
            </div>
            <button className="p-2 text-white hover:bg-white/20 rounded-lg transition">
              <LogOut className="w-5 h-5" />
            </button>
          </header>

          {/* Messages (ONLY this scrolls) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {fakeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2.5 ${
                    msg.isOwn
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {!msg.isOwn && (
                    <p className="text-xs font-medium mb-1 text-emerald-700">
                      {msg.sender}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <div className="text-xs mt-1 opacity-70 text-right">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <footer className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button type="button" className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                <Paperclip className="w-5 h-5" />
              </button>

              <button type="button" className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </footer>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="w-80 flex flex-col bg-white rounded-xl shadow-sm min-h-0 overflow-hidden">

          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white">
              Branch Chats
            </h2>
            <p className="text-xs text-emerald-100">
              Select a branch to chat
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {branches.map((branch) => {
              const isActive = branch.id === activeBranchId;

              return (
                <button
                  key={branch.id}
                  onClick={() => setActiveBranchId(branch.id)}
                  className={`w-full px-4 py-3 border-b text-left hover:bg-emerald-50 ${
                    isActive
                      ? "bg-emerald-50 border-l-4 border-l-emerald-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-semibold text-sm">
                      {branch.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm truncate">
                          {branch.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {branch.lastTime}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {branch.lastMessage}
                      </p>
                    </div>

                    {branch.unread > 0 && (
                      <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {branch.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
