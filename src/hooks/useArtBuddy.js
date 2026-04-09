import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useArtworks } from '../hooks/useArtworks';
import { useBadges } from '../hooks/useBadges';

export function useArtBuddy() {
  const { user, isDemoMode } = useAuth();
  const { profile } = useProfile();
  const { artworks } = useArtworks();
  const { badgeCount } = useBadges();
  
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Aku ArtBuddy, teman kreatifmu. Ada yang bisa aku bantu hari ini? ✨🎨' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-greeting logic
  useEffect(() => {
    const hasGreeted = localStorage.getItem('artstar_buddy_greeted');
    if (!hasGreeted && user) {
      setIsOpen(true);
      localStorage.setItem('artstar_buddy_greeted', 'true');
    }
  }, [user]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message to UI immediately
    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    if (isDemoMode) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Maaf ya, ArtBuddy hanya bisa mengobrol setelah kamu masuk/daftar akun resmi. Coba buat akun sekarang yuk! ✨🚀' 
      }]);
      setLoading(false);
      return;
    }

    try {
      // Get session for explicit JWT passing
      const { data: { session } } = await supabase.auth.getSession();

      // Prepare context for the AI
      const context = {
        userName: profile?.display_name || 'Artis Cilik',
        artworkCount: artworks.length,
        badgeCount: badgeCount,
        currentPath: window.location.pathname
      };

      // Explicitly pass token for internal verification on the Edge Function
      const { data, error: funcError } = await supabase.functions.invoke('artbuddy-chat', {
        body: { message: text, context },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (funcError) throw funcError;

      if (data.error) {
        let friendlyMessage = 'Aduh, ArtBuddy lagi pusing sedikit. Coba lagi nanti ya! 🌈';
        
        switch (data.error) {
          case 'QUOTA_EXCEEDED':
            friendlyMessage = 'Wah, tangki ideku lagi kosong nih. Tunggu sebentar ya, aku lagi isi bensin kreatif dulu! 🎨🚀';
            break;
          case 'SAFETY_BLOCK':
            friendlyMessage = 'ArtBuddy rasa itu bukan ide yang bagus buat digambar. Cari ide seru lainnya yuk! ✨🌟';
            break;
          case 'TIMEOUT':
            friendlyMessage = 'Sinyal kreatifku lagi pelan banget... Coba kirim pesan lagi ya! 📡💫';
            break;
          case 'UNAUTHORIZED':
            friendlyMessage = 'ArtBuddy cuma bisa ngobrol sama yang sudah login. Masuk dulu yuk! 🔐';
            break;
        }

        setMessages(prev => [...prev, { role: 'ai', text: friendlyMessage, isError: true }]);
        return;
      }

      const aiResponse = { role: 'ai', text: data.text };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('ArtBuddy Error:', err);
      const errorMessage = 'Wah, sepertinya sinyal kreatifku lagi terganggu. Coba klik tombol "Coba Lagi" ya! 🌈';
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [profile, artworks.length, badgeCount, isDemoMode]);

  const toggleChat = () => setIsOpen(prev => !prev);

  const retry = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.text);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    sendMessage,
    retry,
    loading,
    isOpen,
    toggleChat
  };
}
