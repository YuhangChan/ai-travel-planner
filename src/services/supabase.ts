import { createClient } from '@supabase/supabase-js';

// 这些值将在设置页面配置
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const initSupabase = (url: string, anonKey: string) => {
  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
};

export const getSupabase = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Please configure in settings.');
  }
  return supabaseClient;
};

// 认证相关
export const authService = {
  signUp: async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getUser: async () => {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return subscription;
  },
};
