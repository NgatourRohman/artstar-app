import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { createPortal } from 'react-dom';

const toastVariants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 5, transition: { duration: 0.2 } }
};

const iconMap = {
  success: <CheckCircle className="toast-icon" color="#10B981" />,
  error: <AlertCircle className="toast-icon" color="#EF4444" />,
  warning: <AlertTriangle className="toast-icon" color="#F59E0B" />,
  info: <Info className="toast-icon" color="#3B82F6" />
};

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  return createPortal(
    <div className="toast-container">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`toast toast-${n.type}`}
            layout
          >
            <div className="toast-content">
              {iconMap[n.type] || iconMap.info}
              <span className="toast-message">{n.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeNotification(n.id)}>
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
