import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  Warehouse, 
  Users, 
  History, 
  Settings, 
  MessageCircleMore
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import DashboardContent from '../components/DashboardContent';
import MenuManagement from '../components/menu/MenuManagement';
import InventoryManagement from '../components/inventory/InventoryManagement';
import CashierManagement from '../components/cashiers/CashierManagement';
import LogManagement from '../components/LogManagement';
import POS from '../components/POSadminContent';
import ChatRoomPage from './ChatRoomPage';  // Example additional page

import Modal from "../components/POScomponent/Modal/Modal";   // ✅ Reusable Modal Component
import { useNavigate } from 'react-router-dom';

// Placeholder Component
const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-3xl font-bold mb-6 text-gray-800">{title}</h2>
    <p className="text-gray-600">
      Content for the <b>{title}</b> page will be implemented here.
    </p>
  </div>
);

function AdminDashboardPage() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  
  // ✅ GLOBAL MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const navigate = useNavigate();

  // Function passed to children to open modal
  const openModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  // Navigation items
  const adminNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'POS', icon: ShoppingCart },
    { name: 'Menu', icon: BookOpen },
    { name: 'Inventory', icon: Warehouse },
    { name: 'Chat Room', icon: MessageCircleMore },  // Example additional item
    { name: 'Cashiers', icon: Users },
    { name: 'Logs', icon: History },
    { name: 'Settings', icon: Settings },
  ];

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  // Render selected page
  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent openModal={openModal} />;

      case 'Menu':
        return <MenuManagement openModal={openModal} />;

      case 'POS':
        return <POS openModal={openModal} isAdmin={true} />;   // ⭐ Modal support

      case 'Inventory':
        return <InventoryManagement openModal={openModal} />;
      case 'Chat Room':
        return <ChatRoomPage openModal={openModal} />;
      case 'Cashiers':
        return <CashierManagement openModal={openModal} />;

      case 'Logs':
        return <LogManagement openModal={openModal} />;

      case 'Settings':
        return <PlaceholderPage title="Settings" />;

      case 'Logout':
        handleLogout();
        return null;

      default:
        return <PlaceholderPage title="404 - Page Not Found" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        logoHighlight="Food"
        logoTitle="Paradise"
        navItems={adminNavItems}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        onLogout={handleLogout}
      />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <Header
          title="Food Paradise: Admin Dashboard"
          username="Admin Username"
          initials="AU"
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>

      </div>

      {/* 🌟 GLOBAL MODAL (Reusable Everywhere) */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>

    </div>
  );
}

export default AdminDashboardPage;
