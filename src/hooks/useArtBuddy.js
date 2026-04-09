import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useArtworks } from '../hooks/useArtworks';
import { useBadges } from '../hooks/useBadges';

export function useArtBuddy() {
  const { user } = useAuth();
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

    try {
      // Prepare context for the AI
      const context = {
        userName: profile?.display_name || 'Artis Cilik',
        artworkCount: artworks.length,
        badgeCount: badgeCount,
        currentPath: window.location.pathname
      };

      const { data, error } = await supabase.functions.invoke('artbuddy-chat', {
        body: { message: text, context }
      });

      if (error) throw error;

      const aiResponse = { role: 'ai', text: data.text };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('ArtBuddy Error:', err);
      
      let errorMessage = 'Wah, sepertinya sinyal kreatifku lagi terganggu. Coba lagi sebentar lagi ya! 🌈';
      if (err.status === 401) {
        errorMessage = 'ArtBuddy butuh izin akses nih. Pastikan Edge Function dideploy dengan --no-verify-jwt ya! 🔑';
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  }, [profile, artworks.length, badgeCount]);

  const toggleChat = () => setIsOpen(prev => !prev);

  return {
    messages,
    sendMessage,
    loading,
    isOpen,
    toggleChat
  };
}
