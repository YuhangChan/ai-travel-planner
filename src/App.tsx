import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import Login from './pages/Login';
import Home from './pages/Home';
import CreatePlan from './pages/CreatePlan';
import PlanDetail from './pages/PlanDetail';
import Settings from './pages/Settings';
import { useStore } from './store';
import { authService } from './services/supabase';

function App() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户登录状态
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
    </Routes>
  );
}

export default App;
