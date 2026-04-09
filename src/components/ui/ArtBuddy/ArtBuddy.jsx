import { useArtBuddy } from '../../../hooks/useArtBuddy';
import ChatFAB from './ChatFAB';
import ChatWindow from './ChatWindow';

export default function ArtBuddy() {
  const { messages, sendMessage, retry, loading, isOpen, toggleChat } = useArtBuddy();

  return (
    <>
      <ChatWindow 
        messages={messages} 
        onSendMessage={sendMessage} 
        onRetry={retry}
        loading={loading} 
        isOpen={isOpen} 
      />
      <ChatFAB 
        isOpen={isOpen} 
        onClick={toggleChat} 
      />
    </>
  );
}
