// components/common/Sidebar.jsx
import React from 'react';
import { LogOut } from 'lucide-react';

const Sidebar = ({
  logoTitle = "AppTitle",
  logoHighlight = "",
  navItems = [],
  activeItem,
  setActiveItem,
  onLogout,
}) => {
  return (
    <div className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">

      {/* Logo */}
      <div className="p-6 text-3xl font-extrabold text-center border-b border-gray-200">
        <span className="text-green-600">{logoHighlight}</span>{logoTitle}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.name;
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                ${isActive ? "bg-green-100 font-semibold text-green-700 shadow-inner" : "hover:bg-green-50"}
              `}
              onClick={() => setActiveItem(item.name)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <div
          className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
          hover:bg-red-100 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
