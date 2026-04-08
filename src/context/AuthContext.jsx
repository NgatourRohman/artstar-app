import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_PROFILE } from '../lib/demoData';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { showSuccess, showError } = useNotifications();
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      showSuccess(`Welcome, ${displayName}! Please check your email to verify.`);
      return { data, error };
    } catch (err) {
      showError(`Sign up failed: ${err.message}`);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    if (isDemoMode) return { error: null };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      showSuccess('Log in successful! 🎨');
      return { data, error };
    } catch (err) {
      showError(`Log in failed: ${err.message}`);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    if (isDemoMode) return;
    try {
      await supabase.auth.signOut();
      showSuccess('Logged out safely. See you soon!');
    } catch (err) {
      showError('Error during sign out.');
    }
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
