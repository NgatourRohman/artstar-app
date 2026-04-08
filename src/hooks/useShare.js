import { useState, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function useShare() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
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
      showError('Failed to create a share link. Please try again.');
      return null;
    }
  }, [user, showError]);

  const copyToClipboard = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showSuccess('Link copied to clipboard! 📋');
      return true;
    } catch {
      showError('Failed to copy to clipboard.');
      return false;
    }
  }, [showSuccess, showError]);

  return { shareUrl, createShareLink, copyToClipboard };
}
