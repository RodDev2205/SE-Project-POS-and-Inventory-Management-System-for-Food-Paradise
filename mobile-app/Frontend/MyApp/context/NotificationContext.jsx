import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Order',
    message: 'Order #12345 has been received',
    time: '5 min ago',
    icon: 'cart',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    message: 'Tomatoes stock is running low',
    time: '1 hour ago',
    icon: 'warning',
    type: 'inventory',
    read: false,
  },
  {
    id: '3',
    title: 'New Message',
    message: 'Branch 1 manager sent a message',
    time: '2 hours ago',
    icon: 'chatbubble',
    type: 'message',
    read: true,
  },
  {
    id: '4',
    title: 'System Update',
    message: 'New version available',
    time: '4 hours ago',
    icon: 'settings',
    type: 'system',
    read: true,
  },
  {
    id: '5',
    title: 'Payment Confirmed',
    message: 'Payment of $5,000 received',
    time: '1 day ago',
    icon: 'checkmark-circle',
    type: 'payment',
    read: true,
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const toggleNotificationRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toggleNotificationRead,
        clearAllNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
