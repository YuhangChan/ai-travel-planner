import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import AmapDebugTool from '@/components/AmapDebugTool';

export default function AmapDebug() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 顶部导航栏 */}
      <div style={{
        background: '#fff',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 20
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>🛠️ 高德地图调试工具</h2>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <AmapDebugTool />
      </div>
    </div>
  );
}
