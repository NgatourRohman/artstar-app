import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_PROFILE } from '../lib/demoData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(isDemoMode ? { user: DEMO_PROFILE } : null);
  const [user, setUser] = useState(isDemoMode ? DEMO_PROFILE : null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email, password, displayName) => {
    if (isDemoMode) return { error: null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (isDemoMode) return { error: null };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    if (isDemoMode) return;
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
