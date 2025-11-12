import { useEffect, useState } from 'react';
import { Layout, Card, Button, List, Tag, Empty, message, Modal } from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  LogoutOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { authService } from '@/services/supabase';
import { planService } from '@/services/plan';
import { TravelPlan } from '@/types';
import dayjs from 'dayjs';

const { Header, Content } = Layout;

export default function Home() {
  const navigate = useNavigate();
  const { user, setUser, plans, setPlans, deletePlan } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await planService.getPlans(user.id);
      setPlans(data);
    } catch (error: any) {
      message.error(error.message || '加载计划列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      message.error('退出登录失败');
    }
  };

  const handleDelete = (plan: TravelPlan) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除旅行计划"${plan.title}"吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await planService.deletePlan(plan.id);
          deletePlan(plan.id);
          message.success('删除成功');
        } catch (error: any) {
          message.error('删除失败');
        }
      },
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>🌍 AI 旅行规划师</h1>
        <div>
          <Button
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
            style={{ marginRight: 8 }}
          >
            设置
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出
          </Button>
        </div>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card
          title="我的旅行计划"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/create')}
              size="large"
            >
              创建新计划
            </Button>
          }
        >
          {plans.length === 0 ? (
            <Empty
              description="还没有旅行计划，快来创建一个吧！"
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/create')}
              >
                创建第一个计划
              </Button>
            </Empty>
          ) : (
            <List
              loading={loading}
              dataSource={plans}
              renderItem={(plan) => (
                <List.Item
                  key={plan.id}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => navigate(`/plan/${plan.id}`)}
                    >
                      查看详情
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(plan)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                          {plan.title}
                        </span>
                        <Tag color="blue">{plan.destination}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 4 }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          {dayjs(plan.start_date).format('YYYY-MM-DD')} -{' '}
                          {dayjs(plan.end_date).format('YYYY-MM-DD')}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <DollarOutlined style={{ marginRight: 8 }} />
                          预算: ¥{plan.budget.toLocaleString()}
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <TeamOutlined style={{ marginRight: 8 }} />
                          {plan.people_count} 人
                        </div>
                        {plan.preferences && (
                          <div>
                            <Tag>{plan.preferences}</Tag>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
}
