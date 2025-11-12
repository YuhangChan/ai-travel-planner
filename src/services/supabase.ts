import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCurrentConfig } from '@/services/configManager';

// 延迟初始化 Supabase 客户端
let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  // 如果已经初始化，直接返回
  if (supabaseClient) {
    return supabaseClient;
  }

  // 获取当前配置
  const config = getCurrentConfig();

  // 如果配置不完整，返回一个假客户端（用于配置页面）
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('Supabase configuration is incomplete');
    // 返回一个占位符，避免崩溃
    return null as any;
  }

  // 初始化并缓存客户端
  supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      callback(session?.user || null);
    });
    return subscription;
  },
};
