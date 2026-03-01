import React, { createContext, useState } from 'react';
import { io as ioclient } from 'socket.io-client';

export const NotificationContext = createContext();

// start with an empty list; notifications will be generated dynamically from inventory/socket events
const NOTIFICATIONS = [];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  // auth state tracks JWT and basic user info for downstream requests
  const [auth, setAuth] = useState({ token: null, user: null });

  // clear any retained notifications when provider mounts (handles hot reloads)
  React.useEffect(() => {
    setNotifications([]);
  }, []);

  // utility to generate simple unique ID for notifications
  const generateId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  // add new notification to the top of the list (unread by default)
  // ignore if an unread notification with same data.inventory_id already exists
  const addNotification = (notif) => {
    if (
      notif.data &&
      notif.data.inventory_id &&
      notifications.some(
        (n) =>
          n.type === notif.type &&
          n.data?.inventory_id === notif.data.inventory_id &&
          !n.read
      )
    ) {
      return; // duplicate
    }

    const entry = {
      id: generateId(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [entry, ...prev]);
  };

  // mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // universal click handler that also supports navigation targets
  const handleNotificationClick = (notif, router) => {
    markAsRead(notif.id);

    if (notif.target === 'inventory' && router) {
      router.push('/(tabs)/inventory');
    }
    // additional targets can be handled here
  };

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

  // --------------------------------------------------
  // real-time updates via socket (dashboard events)
  // --------------------------------------------------
  React.useEffect(() => {
    if (!auth?.token) return;
    const socket = ioclient('http://10.181.206.201:5200', {
      auth: { token: auth.token },
      transports: ['websocket'],
    });
    socket.on('dashboardUpdate', async (payload) => {
      // payload tells us an update occurred, but we fetch ALL low-stock items regardless
      try {
        let items = [];
        // fetch all inventory (supersadmin sees all, admin sees their branch only)
        if (auth.user?.role_id === 3) {
          const res = await fetch('http://10.181.206.201:5200/api/inventory/all-inventory', {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            items = await res.json();
          }
        } else {
          const res = await fetch('http://10.181.206.201:5200/api/inventory/get-ingredients', {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            items = await res.json();
          }
        }
        // generate notifications for ALL low-stock items (not filtered by branch)
        const low = items.filter(
          (it) => Number(it.quantity || 0) <= Number(it.low_stock_threshold || 0)
        );
        low.forEach((item) => {
          const title = item.quantity <= 0 ? 'No stock' : 'Low stock';
          addNotification({
            title: `${title}: ${item.item_name}`,
            message: `Qty: ${item.quantity}`,
            time: new Date().toLocaleTimeString(),
            icon: 'warning',
            type: 'inventory',
            target: 'inventory',
            data: { inventory_id: item.inventory_id },
          });
        });
      } catch (err) {
        console.error('Error handling dashboardUpdate:', err);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [auth]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toggleNotificationRead,
        clearAllNotifications,
        unreadCount,
        // notification helpers
        addNotification,
        handleNotificationClick,
        // authentication helpers
        auth,
        setAuth,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
