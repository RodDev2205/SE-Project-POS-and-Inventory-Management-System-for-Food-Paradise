// src/POSLayout.js
import React, { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Receipt,
  Settings as SettingsIcon,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Records from "../components/POScomponent/Records";
import Settings from "../components/POScomponent/Settings";
import ParadisePOS from "../components/POSadminContent";

export default function POSLayout({ switchToAdmin }) {
  const [activePage, setActivePage] = useState("POS");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  // Example: Data to pass to Header (customizable)
  const headerProps = {
    title: activePage,
    user: {
      name: "Cashier 01",
      role: "POS Staff",
    },
  };

  const posNavItems = [
    { name: "POS", icon: ShoppingCart },
    { name: "Records", icon: Receipt },
    { name: "Settings", icon: SettingsIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "POS":
        return (
          <ParadisePOS
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isCashier={true}
          />
        );
      case "Records":
        return <Records />;
      case "Settings":
        return <Settings />;
      case "Logout":
        handleLogout();
        return null; // Handled in Sidebar
      default:
        return <div className="p-6">Page not found.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        logoHighlight="Food"
        logoTitle="Paradise"
        navItems={posNavItems}
        activeItem={activePage}
        setActiveItem={setActivePage}
        onLogout={handleLogout}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header (now receives headerProps) */}
          <Header
            title="Food Paradise: Cashier"
            username="Cashier Username"
            initials="CU"
          />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>

      </div>
    </div>
  );
}
