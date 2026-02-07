import React from 'react';
import { Menu, Bell, Settings } from 'lucide-react';

export default function Header({ onMenuClick, sidebarOpen = false }) {
  return (
    <div className="w-full bg-emerald-700 px-6 py-3 flex items-center justify-between shadow">

      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button onClick={onMenuClick} className="bg-emerald-700 text-white p-2 rounded hover:bg-emerald-600">
            <Menu size={20} />
          </button>
        )}

        <div className="px-4 py-2 rounded shadow-sm">
          <span className="text-white font-medium">Employee Name</span>
        </div>
      </div>

      <div className="text-white text-sm">
        Jan 20, 2026 | 12:15 PM
      </div>

      <div className="flex gap-2">
        <button className="p-2 bg-white rounded shadow-sm">
          <Bell size={18} />
        </button>

        <button className="p-2 bg-white rounded shadow-sm">
          <Settings size={18} />
        </button>

        <button className="p-2 bg-white rounded-full shadow-sm">
          <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
        </button>
      </div>
    </div>
  );
}