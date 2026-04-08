import { useState, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_PROFILE } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(isDemoMode ? DEMO_PROFILE : null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (isDemoMode) {
      setProfile(DEMO_PROFILE);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet — create it
        const newProfile = {
          id: user.id,
          display_name: user.user_metadata?.display_name || 'Little Artist',
          avatar_url: '🦄',
        };
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        setProfile(created);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates) => {
    if (isDemoMode) {
      setProfile(prev => ({ ...prev, ...updates }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }, [user]);

  return { profile, loading, fetchProfile, updateProfile };
}
