import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.tsx'
import './index.css'
import config from './config/api'

// 配置高德地图安全密钥
declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

window._AMapSecurityConfig = {
  securityJsCode: config.amap.securityCode,
};

// 动态加载高德地图 SDK
const loadAmapScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${config.amap.apiKey}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Amap SDK'));
    document.head.appendChild(script);
  });
};

// 加载地图后再渲染应用
loadAmapScript()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <ConfigProvider locale={zhCN} theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 8,
            },
          }}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
  })
  .catch((error) => {
    console.error('Failed to load Amap SDK:', error);
    // 即使地图加载失败，也渲染应用（只是地图功能不可用）
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <ConfigProvider locale={zhCN} theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 8,
            },
          }}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
  });
