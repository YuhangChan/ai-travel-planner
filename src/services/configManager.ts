/**
 * 配置管理服务
 * 负责读取、验证和保存应用配置（API Keys等）
 * 配置优先级：localStorage > 环境变量
 */

export interface AppConfig {
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

const CONFIG_STORAGE_KEY = 'ai-travel-planner-config';

/**
 * 从环境变量读取初始配置
 */
function getEnvConfig(): Partial<AppConfig> {
  return {
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
      securityCode: import.meta.env.VITE_AMAP_SECURITY_CODE || '',
    },
  };
}

/**
 * 从localStorage读取用户配置
 */
function getStoredConfig(): Partial<AppConfig> | null {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取本地配置失败:', error);
  }
  return null;
}

/**
 * 合并配置（localStorage优先）
 */
function mergeConfig(envConfig: Partial<AppConfig>, storedConfig: Partial<AppConfig> | null): AppConfig {
  const merged: AppConfig = {
    llm: {
      baseURL: storedConfig?.llm?.baseURL || envConfig.llm?.baseURL || '',
      apiKey: storedConfig?.llm?.apiKey || envConfig.llm?.apiKey || '',
      model: storedConfig?.llm?.model || envConfig.llm?.model || 'gpt-4',
    },
    supabase: {
      url: storedConfig?.supabase?.url || envConfig.supabase?.url || '',
      anonKey: storedConfig?.supabase?.anonKey || envConfig.supabase?.anonKey || '',
    },
    amap: {
      apiKey: storedConfig?.amap?.apiKey || envConfig.amap?.apiKey || '',
      securityCode: storedConfig?.amap?.securityCode || envConfig.amap?.securityCode || '',
    },
  };

  return merged;
}

/**
 * 验证配置是否完整
 */
export function validateConfig(config: AppConfig): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!config.llm.baseURL) missing.push('LLM Base URL');
  if (!config.llm.apiKey) missing.push('LLM API Key');
  if (!config.llm.model) missing.push('LLM Model');
  if (!config.supabase.url) missing.push('Supabase URL');
  if (!config.supabase.anonKey) missing.push('Supabase Anon Key');
  if (!config.amap.apiKey) missing.push('高德地图 API Key');
  if (!config.amap.securityCode) missing.push('高德地图安全密钥');

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 获取当前有效配置
 */
export function getCurrentConfig(): AppConfig {
  const envConfig = getEnvConfig();
  const storedConfig = getStoredConfig();
  return mergeConfig(envConfig, storedConfig);
}

/**
 * 保存配置到localStorage
 */
export function saveConfig(config: AppConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    console.log('配置已保存到localStorage');
  } catch (error) {
    console.error('保存配置失败:', error);
    throw new Error('保存配置失败，请检查浏览器存储权限');
  }
}

/**
 * 清除保存的配置
 */
export function clearConfig(): void {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    console.log('已清除保存的配置');
  } catch (error) {
    console.error('清除配置失败:', error);
  }
}

/**
 * 检查配置是否完整
 */
export function isConfigComplete(): boolean {
  const config = getCurrentConfig();
  const validation = validateConfig(config);
  return validation.valid;
}

/**
 * 获取缺失的配置项
 */
export function getMissingConfig(): string[] {
  const config = getCurrentConfig();
  const validation = validateConfig(config);
  return validation.missing;
}
