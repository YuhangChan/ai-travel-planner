import { getCurrentConfig } from './configManager';

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

/**
 * 动态加载高德地图 SDK
 */
export async function loadAmapScript(): Promise<void> {
  // 如果已经加载，直接返回
  if (window.AMap) {
    console.log('高德地图 SDK 已加载');
    return;
  }

  const config = getCurrentConfig();

  // 检查配置是否存在
  if (!config.amap.apiKey || !config.amap.securityCode) {
    console.warn('高德地图配置不完整，跳过 SDK 加载');
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: config.amap.securityCode,
      };

      // 创建 script 标签
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${config.amap.apiKey}&plugin=AMap.ToolBar,AMap.Driving,AMap.Walking,AMap.Transfer,AMap.PlaceSearch,AMap.AutoComplete,AMap.Geocoder`;

      script.onload = () => {
        console.log('高德地图 SDK 加载成功');
        resolve();
      };

      script.onerror = (error) => {
        console.error('高德地图 SDK 加载失败:', error);
        reject(new Error('高德地图 SDK 加载失败'));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('高德地图 SDK 加载异常:', error);
      reject(error);
    }
  });
}
