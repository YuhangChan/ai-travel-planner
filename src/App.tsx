import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import Login from './pages/Login';
import Home from './pages/Home';
import CreatePlan from './pages/CreatePlan';
import PlanDetail from './pages/PlanDetail';
import Settings from './pages/Settings';
import AmapDebug from './pages/AmapDebug';
import ConfigSetup from './pages/ConfigSetup';
import { useStore } from './store';
import { authService } from './services/supabase';
import { isConfigComplete } from './services/configManager';

function App() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [configComplete, setConfigComplete] = useState(false);

  useEffect(() => {
    // 步骤1: 首先检查配置是否完整
    const checkConfig = () => {
      const complete = isConfigComplete();
      console.log('配置完整性检查:', complete);
      setConfigComplete(complete);
      return complete;
    };

    // 步骤2: 检查用户登录状态
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            created_at: currentUser.created_at || '',
          });
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    // 先检查配置，只有配置完整才检查认证
    const complete = checkConfig();
    if (!complete) {
      setLoading(false);
      return;
    }

    try {
      checkAuth();

      // 监听认证状态变化
      const subscription = authService.onAuthStateChange((currentUser) => {
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            created_at: currentUser.created_at || '',
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      setLoading(false);
    }
  }, [setUser]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果配置不完整，重定向到配置页面
  if (!configComplete) {
    return (
      <Routes>
        <Route
          path="/config"
          element={
            <ConfigSetup
              onComplete={() => {
                // 配置完成后重新检查并刷新页面
                setConfigComplete(isConfigComplete());
                window.location.href = '/';
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/config" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/create"
        element={user ? <CreatePlan /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/plan/:id"
        element={user ? <PlanDetail /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/settings"
        element={user ? <Settings /> : <Navigate to="/login" replace />}
      />
      {/* 调试工具页面 - 无需登录 */}
      <Route
        path="/debug"
        element={<AmapDebug />}
      />
      {/* 配置页面 - 配置完整后也可以访问以修改配置 */}
      <Route
        path="/config"
        element={
          <ConfigSetup
            onComplete={() => {
              setConfigComplete(isConfigComplete());
              window.location.href = '/';
            }}
          />
        }
      />
    </Routes>
  );
}

export default App;
