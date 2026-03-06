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
import Settings from "./SettingsPage";
import ParadisePOS from "../components/POSadminContent";

export default function POSLayout({ switchToAdmin }) {
  const [activePage, setActivePage] = useState("POS");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verify authentication on mount
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("role_id");
    
    if (!token || !roleId || Number(roleId) !== 1) {
      navigate("/login", { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);
  
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
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="border-4 border-emerald-700 border-t-transparent rounded-full w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

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

        {/* Header */}
        <Header
          title="Food Paradise: Cashier"
          username="Cashier Username"
          initials="CU"
        />

        {/* Content - No extra padding */}
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>

      </div>
    </div>
  );
}
