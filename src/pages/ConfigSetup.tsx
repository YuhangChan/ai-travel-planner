import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, message, Divider } from 'antd';
import { SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getCurrentConfig, saveConfig, validateConfig, AppConfig } from '@/services/configManager';

const { Title, Text, Paragraph } = Typography;

interface ConfigSetupProps {
  onComplete?: () => void;
}

export default function ConfigSetup({ onComplete }: ConfigSetupProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    // 加载当前配置（包括环境变量的默认值）
    const currentConfig = getCurrentConfig();

    // 设置表单初始值
    form.setFieldsValue({
      llm_base_url: currentConfig.llm.baseURL,
      llm_api_key: currentConfig.llm.apiKey,
      llm_model: currentConfig.llm.model,
      supabase_url: currentConfig.supabase.url,
      supabase_anon_key: currentConfig.supabase.anonKey,
      amap_api_key: currentConfig.amap.apiKey,
      amap_security_code: currentConfig.amap.securityCode,
    });

    // 检查缺失的配置项
    const validation = validateConfig(currentConfig);
    setMissingKeys(validation.missing);
  }, [form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      // 构建配置对象
      const config: AppConfig = {
        llm: {
          baseURL: values.llm_base_url,
          apiKey: values.llm_api_key,
          model: values.llm_model,
        },
        supabase: {
          url: values.supabase_url,
          anonKey: values.supabase_anon_key,
        },
        amap: {
          apiKey: values.amap_api_key,
          securityCode: values.amap_security_code,
        },
      };

      // 验证配置
      const validation = validateConfig(config);
      if (!validation.valid) {
        message.error(`以下配置项缺失: ${validation.missing.join(', ')}`);
        setLoading(false);
        return;
      }

      // 保存配置到 localStorage
      saveConfig(config);
      message.success('配置已保存！');

      // 稍作延迟后通知完成
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
    } catch (error: any) {
      console.error('保存配置失败:', error);
      message.error(error.message || '保存配置失败');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: 800,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SettingOutlined style={{ fontSize: 48, color: '#667eea' }} />
          <Title level={2} style={{ marginTop: 16 }}>
            应用配置设置
          </Title>
          <Text type="secondary">
            请配置应用所需的 API 密钥和服务地址
          </Text>
        </div>

        {missingKeys.length > 0 && (
          <Alert
            message="配置不完整"
            description={`以下配置项缺失或为空: ${missingKeys.join(', ')}`}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Alert
          message="配置说明"
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                1. 已在 .env.local 中配置的值将自动填充为默认值
              </Paragraph>
              <Paragraph style={{ marginBottom: 8 }}>
                2. 所有配置将保存在浏览器本地存储中（localStorage）
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                3. 本地存储的配置优先级高于环境变量
              </Paragraph>
            </div>
          }
          type="info"
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* LLM 配置 */}
          <Divider orientation="left">
            <Space>
              <CheckCircleOutlined />
              大语言模型 (LLM) 配置
            </Space>
          </Divider>

          <Form.Item
            label="LLM Base URL"
            name="llm_base_url"
            rules={[{ required: true, message: '请输入 LLM Base URL' }]}
            tooltip="OpenAI 兼容的 API 地址，例如: https://api.openai.com/v1"
          >
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>

          <Form.Item
            label="LLM API Key"
            name="llm_api_key"
            rules={[{ required: true, message: '请输入 LLM API Key' }]}
            tooltip="用于调用 LLM API 的密钥"
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>

          <Form.Item
            label="LLM Model"
            name="llm_model"
            rules={[{ required: true, message: '请输入模型名称' }]}
            tooltip="使用的模型名称，例如: gpt-4, gpt-3.5-turbo"
          >
            <Input placeholder="gpt-4" />
          </Form.Item>

          {/* Supabase 配置 */}
          <Divider orientation="left">
            <Space>
              <CheckCircleOutlined />
              Supabase 配置
            </Space>
          </Divider>

          <Form.Item
            label="Supabase URL"
            name="supabase_url"
            rules={[{ required: true, message: '请输入 Supabase URL' }]}
            tooltip="Supabase 项目的 URL"
          >
            <Input placeholder="https://xxxxx.supabase.co" />
          </Form.Item>

          <Form.Item
            label="Supabase Anon Key"
            name="supabase_anon_key"
            rules={[{ required: true, message: '请输入 Supabase Anon Key' }]}
            tooltip="Supabase 项目的匿名密钥"
          >
            <Input.Password placeholder="eyJhbGc..." />
          </Form.Item>

          {/* 高德地图配置 */}
          <Divider orientation="left">
            <Space>
              <CheckCircleOutlined />
              高德地图配置
            </Space>
          </Divider>

          <Form.Item
            label="高德地图 API Key"
            name="amap_api_key"
            rules={[{ required: true, message: '请输入高德地图 API Key' }]}
            tooltip="高德地图 Web 服务 API Key"
          >
            <Input placeholder="your-amap-api-key" />
          </Form.Item>

          <Form.Item
            label="高德地图安全密钥 (Security Code)"
            name="amap_security_code"
            rules={[{ required: true, message: '请输入高德地图安全密钥' }]}
            tooltip="高德地图 Web 端安全密钥 (securityJsCode)"
          >
            <Input placeholder="your-security-code" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              保存配置并继续
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            所有密钥仅存储在您的浏览器本地，不会上传到任何服务器
          </Text>
        </div>
      </Card>
    </div>
  );
}
