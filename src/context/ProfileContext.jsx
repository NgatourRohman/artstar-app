import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_PROFILE } from '../lib/demoData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [profile, setProfile] = useState(isDemoMode ? DEMO_PROFILE : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    if (isDemoMode) {
      setProfile(DEMO_PROFILE);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          display_name: user.user_metadata?.display_name || 'Little Artist',
          avatar_url: '🦄',
          xp: 0,
          level: 1,
        };
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        
        if (insertError) throw insertError;
        setProfile(created);
      } else if (fetchError) {
        throw fetchError;
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      showError('Could not load your profile details.');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  const updateProfile = useCallback(async (updates) => {
    if (isDemoMode) {
      setProfile(prev => ({ ...prev, ...updates }));
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      showSuccess('Profile updated! ✨');
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      showError(`Failed to update profile: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, showSuccess, showError]);

  const addXP = useCallback(async (amount) => {
    if (!profile) return;

    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const oldLevel = profile.level || 1;

    const updates = { xp: newXP, level: newLevel };
    
    if (newLevel > oldLevel) {
      showSuccess(`WADIDAW! Kamu naik ke Level ${newLevel}! 🎉🚀`);
    }

    await updateProfile(updates);
  }, [profile, updateProfile, showSuccess]);

  // Initial fetch when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = useMemo(() => ({
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    addXP
  }), [profile, loading, error, fetchProfile, updateProfile, addXP]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}
