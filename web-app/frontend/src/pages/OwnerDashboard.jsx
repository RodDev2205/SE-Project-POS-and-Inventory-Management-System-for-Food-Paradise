import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  LayoutDashboard, 
  Split, 
  BookOpen, 
  Warehouse, 
  Users, 
  History, 
  Settings 
} from "lucide-react";

// Import your page components
import DashboardPage from "./OwnerDashboardPage";
import ManagementPage from "./ManagementPage";
import ReportPage from "./ReportPage";
import LogsPage from "./LogsPage";
import SettingsPage from "./SettingsPage";

export default function OwnerDashboard() {
  // --- Dashboard Data (can be passed to components as props) ---
  const dashboardData = {
    salesData: { today: 20000, weekly: 30000, monthly: 40000, yearly: 95000 },
    branchPerformance: [
      { rank: 1, name: "Main Branch", sales: 45000, change: 12 },
      { rank: 2, name: "Downtown Branch", sales: 38000, change: -5 },
      { rank: 3, name: "Mall Branch", sales: 32000, change: 8 },
    ],
    topItems: [
      { name: "Spagetti", sold: 150, unit: "plates" },
      { name: "Burger", sold: 120, unit: "orders" },
      { name: "Halo-Halo", sold: 95, unit: "servings" },
    ],
    lowStockItems: [
      { item: "Beef Patty", branch: "Main", remaining: 5, threshold: 10, status: "Critical" },
      { item: "Lettuce", branch: "Downtown", remaining: 8, threshold: 15, status: "Low" },
    ],
  };

  // --- Sidebar active state ---
  const [activeItem, setActiveItem] = useState("Dashboard");

  // --- Sidebar navigation items ---
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Management", icon: Split },
    { name: "Reports", icon: BookOpen },
    { name: "Logs", icon: History },
    { name: "Settings", icon: Settings },
  ];

  // --- Logout handler ---
  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  // --- Render content based on active sidebar item ---
  const renderContent = () => {
    switch (activeItem) {
      case "Dashboard":
        return <DashboardPage data={dashboardData} />;
      case "Management":
        return <ManagementPage data={dashboardData} />;
      case "Reports":
        return <ReportPage data={dashboardData} />;
      case "Logs":
        return <LogsPage data={dashboardData} />;
      case "Settings":
        return <SettingsPage data={dashboardData} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        logoTitle="Paradise"
        logoHighlight="Food"
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
            title="Food Paradise: Owner Dashboard"
            username="Owner Username"
            initials="OU"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
