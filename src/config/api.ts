// API 配置文件
// 所有 API Keys 从环境变量中读取

export interface ApiConfig {
  llm: {
    baseURL: string;
    apiKey: string;
    model: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  amap: {
    apiKey: string;
  };
}

// 从环境变量读取配置
const config: ApiConfig = {
  llm: {
    baseURL: import.meta.env.VITE_LLM_BASE_URL || '',
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || 'gpt-4',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  amap: {
    apiKey: import.meta.env.VITE_AMAP_API_KEY || '',
  },
};

// 验证配置是否完整
export const validateConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!config.llm.baseURL) missing.push('VITE_LLM_BASE_URL');
  if (!config.llm.apiKey) missing.push('VITE_LLM_API_KEY');
  if (!config.llm.model) missing.push('VITE_LLM_MODEL');
  if (!config.supabase.url) missing.push('VITE_SUPABASE_URL');
  if (!config.supabase.anonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!config.amap.apiKey) missing.push('VITE_AMAP_API_KEY');

  return {
    valid: missing.length === 0,
    missing,
  };
};

export default config;
