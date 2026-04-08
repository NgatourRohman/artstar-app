import { useState, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useShare() {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState(null);

  const createShareLink = useCallback(async (itemType, itemId) => {
    if (isDemoMode) {
      const fakeId = `share-${Date.now()}`;
      const url = `${window.location.origin}/shared/${fakeId}`;
      setShareUrl(url);
      return url;
    }

    try {
      const { data, error } = await supabase
        .from('shares')
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
        })
        .select()
        .single();

      if (error) throw error;
      const url = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(url);
      return url;
    } catch (err) {
      console.error('Error creating share:', err);
      return null;
    }
  }, [user]);

  const copyToClipboard = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { shareUrl, createShareLink, copyToClipboard };
}
