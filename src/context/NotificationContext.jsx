import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addNotification(msg, 'success'), [addNotification]);
  const showError = useCallback((msg) => addNotification(msg, 'error', 5000), [addNotification]);
  const showWarning = useCallback((msg) => addNotification(msg, 'warning', 4000), [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, showSuccess, showError, showWarning }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
