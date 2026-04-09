import { motion } from 'framer-motion';
import { Bot, MessageCircle, X } from 'lucide-react';

export default function ChatFAB({ isOpen, onClick }) {
  return (
    <motion.button
      className={`art-buddy-fab ${isOpen ? 'active' : ''}`}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      {isOpen ? <X size={30} /> : <Bot size={30} />}
    </motion.button>
  );
}
