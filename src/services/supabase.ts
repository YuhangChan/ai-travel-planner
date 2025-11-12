import { createClient } from '@supabase/supabase-js';
import config from '@/config/api';

// 从配置文件初始化 Supabase 客户端
const supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);

export const getSupabase = () => {
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
