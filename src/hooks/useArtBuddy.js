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

  useEffect(() => {
    const hasGreeted = localStorage.getItem('artstar_buddy_greeted');
    if (!hasGreeted && user) {
      setIsOpen(true);
      localStorage.setItem('artstar_buddy_greeted', 'true');
    }
  }, [user]);

  const sendMessage = useCallback(async (text) => {
    if (loading || !text.trim()) return;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const context = {
        userName: profile?.display_name || 'Artis Cilik',
        artworkCount: artworks.length,
        badgeCount: badgeCount,
        currentPath: window.location.pathname
      };

      const { data, error: funcError } = await supabase.functions.invoke('artbuddy-chat', {
        body: { message: text, context },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (funcError) {
        let errorCode = 'UNKNOWN_ERROR';
        
        try {
          const resText = await funcError.context.context.text();
          const resData = JSON.parse(resText);
          errorCode = resData.error || errorCode;
        } catch (e) {
          if (funcError.status === 429) errorCode = 'QUOTA_EXCEEDED';
          if (funcError.status === 504) errorCode = 'TIMEOUT';
        }

        let friendlyMessage = 'Aduh, ArtBuddy lagi pusing sedikit. Coba lagi nanti ya! 🌈';
        
        switch (errorCode) {
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

      if (data?.error) {
        let msg = 'Aduh, ArtBuddy lagi pusing sedikit.';
        if (data.error === 'SAFETY_BLOCK') msg = 'ArtBuddy rasa itu bukan ide yang bagus buat digambar. Cari ide seru lainnya yuk! ✨🌟';
        setMessages(prev => [...prev, { role: 'ai', text: msg, isError: true }]);
        return;
      }

      const aiResponse = { role: 'ai', text: data.text };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('ArtBuddy Fatal Error:', err);
      const errorMessage = 'Wah, sepertinya sinyal kreatifku lagi terganggu. Coba klik tombol "Coba Lagi" ya! 🌈';
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [profile, artworks.length, badgeCount]);

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
