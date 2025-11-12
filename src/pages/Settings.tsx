import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  message,
  Divider,
  Alert,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { initSupabase } from '@/services/supabase';

const { Header, Content } = Layout;

export default function Settings() {
  const navigate = useNavigate();
  const { apiConfig, setApiConfig } = useStore();
  const [form] = Form.useForm();
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    form.setFieldsValue(apiConfig);
  }, [apiConfig, form]);

  const handleSave = (values: any) => {
    try {
      // 保存 API 配置
      setApiConfig(values);

      // 初始化 Supabase（如果配置了）
      if (values.supabase_url && values.supabase_anon_key) {
        try {
          initSupabase(values.supabase_url, values.supabase_anon_key);
          setSupabaseConfigured(true);
          message.success('Supabase 配置成功！');
        } catch (error) {
          message.error('Supabase 配置失败，请检查 URL 和 Key 是否正确');
        }
      }

      message.success('设置已保存！');
    } catch (error: any) {
      message.error('保存失败');
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
        <h1 style={{ margin: 0, fontSize: 24 }}>API 设置</h1>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <Alert
            message="安全提示"
            description="所有 API Key 仅保存在浏览器本地存储中，不会上传到服务器。请妥善保管您的 API Key。"
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={apiConfig}
          >
            <Divider orientation="left">
              <KeyOutlined /> LLM API 配置
            </Divider>

            <Form.Item
              label="LLM Base URL"
              name="llm_base_url"
              rules={[
                { required: true, message: '请输入 LLM Base URL' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
              extra="例如：https://api.openai.com/v1 或您的自定义 API 地址"
            >
              <Input
                size="large"
                placeholder="https://api.openai.com/v1"
              />
            </Form.Item>

            <Form.Item
              label="LLM API Key"
              name="llm_api_key"
              rules={[{ required: true, message: '请输入 LLM API Key' }]}
              extra="您的 OpenAI 或兼容 OpenAI 格式的 API Key"
            >
              <Input.Password
                size="large"
                placeholder="sk-..."
              />
            </Form.Item>

            <Divider orientation="left">
              <KeyOutlined /> Supabase 配置
            </Divider>

            <Form.Item
              label="Supabase URL"
              name="supabase_url"
              rules={[
                { required: true, message: '请输入 Supabase URL' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
              extra="您的 Supabase 项目 URL（例如：https://xxxxx.supabase.co）"
            >
              <Input
                size="large"
                placeholder="https://xxxxx.supabase.co"
              />
            </Form.Item>

            <Form.Item
              label="Supabase Anon Key"
              name="supabase_anon_key"
              rules={[{ required: true, message: '请输入 Supabase Anon Key' }]}
              extra="您的 Supabase 匿名公钥（anon/public key）"
            >
              <Input.Password
                size="large"
                placeholder="eyJ..."
              />
            </Form.Item>

            <Divider orientation="left">
              <KeyOutlined /> 高德地图 API
            </Divider>

            <Form.Item
              label="高德地图 API Key"
              name="amap_api_key"
              rules={[{ required: true, message: '请输入高德地图 API Key' }]}
              extra="您的高德地图 Web 服务 API Key（在 index.html 中也需要配置）"
            >
              <Input
                size="large"
                placeholder="请输入高德地图 API Key"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div style={{ marginTop: 24 }}>
            <h3>如何获取 API Keys：</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Card size="small">
                <h4>1. LLM API（OpenAI 或兼容服务）</h4>
                <p>
                  - OpenAI 官方：访问{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    https://platform.openai.com/api-keys
                  </a>
                </p>
                <p>- 其他兼容服务：联系您的服务提供商获取</p>
              </Card>

              <Card size="small">
                <h4>2. Supabase</h4>
                <p>
                  - 访问{' '}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                    https://supabase.com
                  </a>{' '}
                  创建项目
                </p>
                <p>- 在 Project Settings → API 中找到 URL 和 anon key</p>
              </Card>

              <Card size="small">
                <h4>3. 高德地图 API</h4>
                <p>
                  - 访问{' '}
                  <a href="https://console.amap.com" target="_blank" rel="noopener noreferrer">
                    https://console.amap.com
                  </a>{' '}
                  申请 Web 服务 API Key
                </p>
                <p>- 创建应用并获取 Key</p>
              </Card>
            </Space>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
