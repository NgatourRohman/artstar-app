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
      const { data, error } = await supabase.functions.invoke('artbuddy-chat', {
        body: { message: text, context },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      const aiResponse = { role: 'ai', text: data.text };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('ArtBuddy Error:', err);
      const errorMessage = err.status === 401 
        ? 'Akses ditolak. Silakan masuk akun terlebih dahulu untuk mengobrol dengan ArtBuddy! 🔐'
        : 'Wah, sepertinya sinyal kreatifku lagi terganggu. Coba lagi sebentar lagi ya! 🌈';
      
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  }, [profile, artworks.length, badgeCount, isDemoMode]);

  const toggleChat = () => setIsOpen(prev => !prev);

  return {
    messages,
    sendMessage,
    loading,
    isOpen,
    toggleChat
  };
}
