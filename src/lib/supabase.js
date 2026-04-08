import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow the app to run in demo mode without Supabase
const isDemoMode = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl === 'your-supabase-project-url';

let supabase = null;

if (!isDemoMode) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, isDemoMode };
