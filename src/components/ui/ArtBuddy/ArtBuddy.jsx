import { useArtBuddy } from '../../../hooks/useArtBuddy';
import ChatFAB from './ChatFAB';
import ChatWindow from './ChatWindow';

export default function ArtBuddy() {
  const { messages, sendMessage, loading, isOpen, toggleChat } = useArtBuddy();

  return (
    <>
      <ChatWindow 
        messages={messages} 
        onSendMessage={sendMessage} 
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
