import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ messages, onSendMessage, onRetry, loading, isOpen }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const lastMessage = messages[messages.length - 1];
  const hasError = lastMessage?.isError;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
  };

  const quickActions = [
    { label: t('buddy.action_idea'), prompt: t('buddy.prompt_idea') },
    { label: t('buddy.action_tips'), prompt: t('buddy.prompt_tips') },
    { label: t('buddy.action_challenge'), prompt: t('buddy.prompt_challenge') }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="art-buddy-window"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="art-buddy-header">
            <div style={{ fontSize: '1.5rem' }}>🤖</div>
            <div className="art-buddy-title">ArtBuddy</div>
          </div>

          <div className="art-buddy-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role === 'ai' ? 'ai' : 'user'} ${msg.isError ? 'error-bubble' : ''}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble ai">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {t('buddy.thinking')}
                </motion.span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="art-buddy-quick-actions">
            {hasError ? (
              <button
                className="quick-action-btn retry-btn"
                onClick={onRetry}
                disabled={loading}
              >
                {t('buddy.retry')}
              </button>
            ) : (
              quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => onSendMessage(action.prompt)}
                  disabled={loading}
                >
                  {action.label}
                </button>
              ))
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input"
              placeholder={t('buddy.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
