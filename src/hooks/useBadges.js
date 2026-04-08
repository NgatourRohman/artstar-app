import { useState, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { BADGE_DEFINITIONS, checkBadgeEligibility } from '../lib/badges';
import { DEMO_USER_BADGES } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function useBadges() {
  const { user } = useAuth();
  const { showError } = useNotifications();
  const [userBadges, setUserBadges] = useState(isDemoMode ? DEMO_USER_BADGES : []);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  const fetchUserBadges = useCallback(async () => {
    if (isDemoMode) {
      setUserBadges(DEMO_USER_BADGES);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserBadges(data || []);
    } catch (err) {
      console.error('Error fetching badges:', err);
      showError('Failed to load your badges! 🏅');
    }
  }, [user, showError]);

  const checkAndUnlockBadges = useCallback(async (stats) => {
    const currentBadgeIds = userBadges.map(b => b.badge_id);
    const newBadges = [];

    for (const badgeDef of BADGE_DEFINITIONS) {
      if (currentBadgeIds.includes(badgeDef.id)) continue;
      if (checkBadgeEligibility(badgeDef, stats)) {
        newBadges.push(badgeDef);
      }
    }

    if (newBadges.length === 0) return [];

    if (isDemoMode) {
      const newUserBadges = newBadges.map(b => ({
        badge_id: b.id,
        unlocked_at: new Date().toISOString(),
      }));
      setUserBadges(prev => [...prev, ...newUserBadges]);
      setNewlyUnlocked(newBadges);
      return newBadges;
    }

    try {
      const inserts = newBadges.map(b => ({
        user_id: user.id,
        badge_id: b.id,
      }));

      const { data, error } = await supabase
        .from('user_badges')
        .insert(inserts)
        .select();

      if (error) throw error;
      setUserBadges(prev => [...prev, ...data]);
      setNewlyUnlocked(newBadges);
      return newBadges;
    } catch (err) {
      console.error('Error unlocking badges:', err);
      showError(`Oops! Error unlocking badge: ${err.message}`);
      return [];
    }
  }, [user, userBadges, showError]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const getBadgesWithStatus = useCallback(() => {
    return BADGE_DEFINITIONS.map(badge => {
      const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
      return {
        ...badge,
        unlocked: !!userBadge,
        unlocked_at: userBadge?.unlocked_at || null,
      };
    });
  }, [userBadges]);

  const getLatestBadge = useCallback(() => {
    if (userBadges.length === 0) return null;
    const sorted = [...userBadges].sort((a, b) => 
      new Date(b.unlocked_at) - new Date(a.unlocked_at)
    );
    const latestId = sorted[0].badge_id;
    return BADGE_DEFINITIONS.find(b => b.id === latestId) || null;
  }, [userBadges]);

  return {
    userBadges,
    newlyUnlocked,
    fetchUserBadges,
    checkAndUnlockBadges,
    clearNewlyUnlocked,
    getBadgesWithStatus,
    getLatestBadge,
    badgeCount: userBadges.length,
  };
}
