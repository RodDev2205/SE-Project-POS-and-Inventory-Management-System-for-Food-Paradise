// src/POSLayout.js
import React, { useState } from "react";
import Header from "../components/POScomponent/Header";

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
    switchToAdmin();
  };

  const renderPage = () => {
    switch (activePage) {
      case "POS":
        return (
          <ParadisePOS
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isAdmin={true}
          />
        );
      case "Records":
        return <Records />;
      case "Settings":
        return <Settings />;
      default:
        return <div className="p-6">Page not found.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-white">

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
        <div className="fixed w-full z-40">
          <Header {...headerProps} />
        </div>

        {/* Content */}
        <main className="pt-20 p-6 overflow-y-auto">
          {renderPage()}
        </main>

      </div>
    </div>
  );
}
