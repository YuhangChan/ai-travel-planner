import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  Tabs,
  Timeline,
  Tag,
  Descriptions,
  Empty,
  message,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store';
import { planService } from '@/services/plan';
import { TravelPlan } from '@/types';
import MapView from '@/components/MapView';
import ExpenseTracker from '@/components/ExpenseTracker';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentPlan, setCurrentPlan } = useStore();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(currentPlan);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    if (!id || !user) return;

    setLoading(true);
    try {
      const data = await planService.getPlan(id);
      if (data) {
        setPlan(data);
        setCurrentPlan(data);
      }
    } catch (error: any) {
      message.error(error.message || '加载计划详情失败');
    } finally {
      setLoading(false);
    }
  };

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

  if (!plan) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Empty description="计划不存在" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <h1 style={{ margin: 0, fontSize: 24 }}>{plan.title}</h1>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card style={{ marginBottom: 16 }}>
          <Descriptions column={4}>
            <Descriptions.Item label="目的地">
              <Tag color="blue" icon={<EnvironmentOutlined />}>
                {plan.destination}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="日期">
              {dayjs(plan.start_date).format('YYYY-MM-DD')} -{' '}
              {dayjs(plan.end_date).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="预算">
              <Tag color="green" icon={<DollarOutlined />}>
                ¥{plan.budget.toLocaleString()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="人数">
              {plan.people_count} 人
            </Descriptions.Item>
          </Descriptions>
          {plan.preferences && (
            <div style={{ marginTop: 16 }}>
              <strong>偏好：</strong>
              <span style={{ marginLeft: 8 }}>{plan.preferences}</span>
            </div>
          )}
        </Card>

        <Tabs defaultActiveKey="itinerary">
          <TabPane tab="行程安排" key="itinerary">
            {plan.itinerary ? (
              <Card>
                <Timeline>
                  {plan.itinerary.days.map((day) => (
                    <Timeline.Item
                      key={day.day}
                      color="blue"
                      dot={<ClockCircleOutlined />}
                    >
                      <h3>
                        第 {day.day} 天 - {dayjs(day.date).format('MM月DD日')}
                      </h3>
                      <div style={{ marginBottom: 16 }}>
                        <Tag color="orange">预算: ¥{day.budget}</Tag>
                      </div>

                      {day.activities.map((activity) => (
                        <Card
                          key={activity.id}
                          size="small"
                          style={{ marginBottom: 12 }}
                        >
                          <h4>
                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                            {activity.name}
                          </h4>
                          <p>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            {activity.start_time} - {activity.end_time}
                          </p>
                          <p>
                            <DollarOutlined style={{ marginRight: 8 }} />
                            ¥{activity.cost}
                          </p>
                          {activity.description && <p>{activity.description}</p>}
                          {activity.tips && (
                            <Tag color="gold">提示: {activity.tips}</Tag>
                          )}
                        </Card>
                      ))}

                      {day.meals.map((meal) => (
                        <Card
                          key={meal.id}
                          size="small"
                          style={{ marginBottom: 12, background: '#fffbe6' }}
                        >
                          <h4>🍽️ {meal.name}</h4>
                          <p>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            {meal.time} - {meal.type}
                          </p>
                          <p>
                            <DollarOutlined style={{ marginRight: 8 }} />
                            ¥{meal.cost}
                          </p>
                          {meal.cuisine && <Tag>{meal.cuisine}</Tag>}
                          {meal.description && <p>{meal.description}</p>}
                        </Card>
                      ))}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            ) : (
              <Empty description="暂无行程安排" />
            )}
          </TabPane>

          <TabPane tab="地图导航" key="map">
            <MapView plan={plan} />
          </TabPane>

          <TabPane tab="费用管理" key="expenses">
            <ExpenseTracker planId={plan.id} budget={plan.budget} />
          </TabPane>

          <TabPane tab="住宿信息" key="accommodation">
            {plan.itinerary?.accommodation && plan.itinerary.accommodation.length > 0 ? (
              <div>
                {plan.itinerary.accommodation.map((hotel) => (
                  <Card key={hotel.id} style={{ marginBottom: 16 }}>
                    <h3>{hotel.name}</h3>
                    <Descriptions column={2}>
                      <Descriptions.Item label="类型">{hotel.type}</Descriptions.Item>
                      <Descriptions.Item label="地址">
                        {hotel.location.address}
                      </Descriptions.Item>
                      <Descriptions.Item label="入住">
                        {dayjs(hotel.check_in).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="退房">
                        {dayjs(hotel.check_out).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                      <Descriptions.Item label="晚数">
                        {hotel.nights} 晚
                      </Descriptions.Item>
                      <Descriptions.Item label="费用">
                        ¥{hotel.cost}
                      </Descriptions.Item>
                      {hotel.rating && (
                        <Descriptions.Item label="评分">
                          ⭐ {hotel.rating}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                    {hotel.amenities && (
                      <div style={{ marginTop: 8 }}>
                        <strong>设施：</strong>
                        {hotel.amenities.map((amenity, idx) => (
                          <Tag key={idx} style={{ margin: '4px' }}>
                            {amenity}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="暂无住宿信息" />
            )}
          </TabPane>

          <TabPane tab="交通信息" key="transportation">
            {plan.itinerary?.transportation && plan.itinerary.transportation.length > 0 ? (
              <div>
                {plan.itinerary.transportation.map((trans) => (
                  <Card key={trans.id} style={{ marginBottom: 16 }}>
                    <h3>🚗 {trans.type}</h3>
                    <Descriptions column={2}>
                      <Descriptions.Item label="出发">
                        {trans.from.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="到达">
                        {trans.to.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="出发时间">
                        {dayjs(trans.departure_time).format('YYYY-MM-DD HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="到达时间">
                        {dayjs(trans.arrival_time).format('YYYY-MM-DD HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="费用">
                        ¥{trans.cost}
                      </Descriptions.Item>
                    </Descriptions>
                    {trans.description && <p>{trans.description}</p>}
                  </Card>
                ))}
              </div>
            ) : (
              <Empty description="暂无交通信息" />
            )}
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}
