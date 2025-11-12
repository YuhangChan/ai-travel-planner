// API 配置文件
// 所有 API Keys 优先从 localStorage 读取，其次从环境变量读取

import { getCurrentConfig } from '@/services/configManager';

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
    securityCode: string;
  };
}

// 获取当前有效配置
const config: ApiConfig = getCurrentConfig();

export default config;
