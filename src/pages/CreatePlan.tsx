import { useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
  Steps,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  AudioOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { createLLMService } from '@/services/llm';
import { planService } from '@/services/plan';
import VoiceInput from '@/components/VoiceInput';
import dayjs, { Dayjs } from 'dayjs';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function CreatePlan() {
  const navigate = useNavigate();
  const { user, apiConfig, addPlan } = useStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleVoiceResult = (transcript: string) => {
    // 解析语音输入，填充表单
    // 示例："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
    form.setFieldsValue({
      preferences: transcript,
    });
    message.success('语音识别成功！');
    setShowVoiceInput(false);
  };

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    if (!apiConfig.llm_api_key || !apiConfig.llm_base_url) {
      message.error('请先在设置页面配置 LLM API');
      navigate('/settings');
      return;
    }

    setLoading(true);
    try {
      // 调用 LLM 生成行程
      const llmService = createLLMService(
        apiConfig.llm_base_url,
        apiConfig.llm_api_key
      );

      const result = await llmService.generateTravelPlan({
        destination: values.destination,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        budget: values.budget,
        peopleCount: values.peopleCount,
        preferences: values.preferences || '',
      });

      // 保存到数据库
      const plan = await planService.createPlan({
        user_id: user.id,
        title: `${values.destination}之旅`,
        destination: values.destination,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        budget: values.budget,
        people_count: values.peopleCount,
        preferences: values.preferences || '',
        itinerary: result.itinerary,
      });

      addPlan(plan);
      message.success('旅行计划生成成功！');
      navigate(`/plan/${plan.id}`);
    } catch (error: any) {
      message.error(error.message || '生成旅行计划失败');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 style={{ margin: 0, fontSize: 24 }}>创建旅行计划</h1>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            <Steps.Step title="基本信息" />
            <Steps.Step title="偏好设置" />
            <Steps.Step title="生成计划" />
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              peopleCount: 1,
              budget: 10000,
            }}
          >
            <Form.Item
              label="目的地"
              name="destination"
              rules={[{ required: true, message: '请输入目的地' }]}
            >
              <Input size="large" placeholder="例如：日本、北京、巴黎" />
            </Form.Item>

            <Form.Item
              label="出行日期"
              name="dateRange"
              rules={[{ required: true, message: '请选择出行日期' }]}
            >
              <RangePicker
                size="large"
                style={{ width: '100%' }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
              <Form.Item
                label="预算（元）"
                name="budget"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  style={{ width: 200 }}
                  formatter={(value) =>
                    `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                />
              </Form.Item>

              <Form.Item
                label="同行人数"
                name="peopleCount"
                rules={[{ required: true, message: '请输入同行人数' }]}
              >
                <InputNumber size="large" min={1} style={{ width: 150 }} />
              </Form.Item>
            </Space>

            <Form.Item
              label={
                <span>
                  旅行偏好
                  <Button
                    type="link"
                    icon={<AudioOutlined />}
                    onClick={() => setShowVoiceInput(true)}
                  >
                    语音输入
                  </Button>
                </span>
              }
              name="preferences"
            >
              <TextArea
                rows={4}
                placeholder="描述您的旅行偏好，例如：喜欢美食、购物、文化体验、户外活动等..."
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<RocketOutlined />}
              >
                {loading ? '正在生成计划...' : '生成 AI 旅行计划'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {showVoiceInput && (
          <VoiceInput
            onResult={handleVoiceResult}
            onClose={() => setShowVoiceInput(false)}
          />
        )}
      </Content>
    </Layout>
  );
}
