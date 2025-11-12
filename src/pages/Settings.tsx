import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Alert,
  Descriptions,
  Tag,
  Space,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import config, { validateConfig } from '@/config/api';

const { Header, Content } = Layout;
const { Paragraph, Text } = Typography;

export default function Settings() {
  const navigate = useNavigate();
  const [configStatus, setConfigStatus] = useState<{
    valid: boolean;
    missing: string[];
  }>({ valid: true, missing: [] });

  useEffect(() => {
    const status = validateConfig();
    setConfigStatus(status);
  }, []);

  const getStatusIcon = (key: string) => {
    const isMissing = configStatus.missing.includes(key);
    return isMissing ? (
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    ) : (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    );
  };

  const getStatusTag = (key: string) => {
    const isMissing = configStatus.missing.includes(key);
    return isMissing ? (
      <Tag color="error">未配置</Tag>
    ) : (
      <Tag color="success">已配置</Tag>
    );
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
        <h1 style={{ margin: 0, fontSize: 24 }}>系统配置</h1>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card style={{ maxWidth: 900, margin: '0 auto' }}>
          {!configStatus.valid && (
            <Alert
              message="配置不完整"
              description={
                <div>
                  <p>以下环境变量未配置，请在 .env.local 文件中添加：</p>
                  <ul>
                    {configStatus.missing.map((key) => (
                      <li key={key}>
                        <code>{key}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              }
              type="error"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 24 }}
            />
          )}

          {configStatus.valid && (
            <Alert
              message="配置完整"
              description="所有必需的 API 配置都已正确设置。"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Descriptions
            title="API 配置状态"
            bordered
            column={1}
            labelStyle={{ width: 200 }}
          >
            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_LLM_BASE_URL')} LLM Base URL
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_LLM_BASE_URL')}
                {config.llm.baseURL && (
                  <Text type="secondary">{config.llm.baseURL}</Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_LLM_API_KEY')} LLM API Key
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_LLM_API_KEY')}
                {config.llm.apiKey && (
                  <Text type="secondary">
                    {config.llm.apiKey.substring(0, 8)}...
                  </Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_LLM_MODEL')} LLM Model
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_LLM_MODEL')}
                {config.llm.model && (
                  <Text type="secondary">{config.llm.model}</Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_SUPABASE_URL')} Supabase URL
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_SUPABASE_URL')}
                {config.supabase.url && (
                  <Text type="secondary">{config.supabase.url}</Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_SUPABASE_ANON_KEY')} Supabase Anon Key
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_SUPABASE_ANON_KEY')}
                {config.supabase.anonKey && (
                  <Text type="secondary">
                    {config.supabase.anonKey.substring(0, 12)}...
                  </Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_AMAP_API_KEY')} 高德地图 API Key
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_AMAP_API_KEY')}
                {config.amap.apiKey && (
                  <Text type="secondary">
                    {config.amap.apiKey.substring(0, 8)}...
                  </Text>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span>
                  {getStatusIcon('VITE_AMAP_SECURITY_CODE')} 高德地图安全密钥
                </span>
              }
            >
              <Space>
                {getStatusTag('VITE_AMAP_SECURITY_CODE')}
                {config.amap.securityCode && (
                  <Text type="secondary">
                    {config.amap.securityCode.substring(0, 8)}...
                  </Text>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Card
            title="📝 配置说明"
            style={{ marginTop: 24 }}
            type="inner"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <h4>如何配置 API Keys：</h4>
                <ol>
                  <li>
                    在项目根目录创建 <code>.env.local</code> 文件（可以复制{' '}
                    <code>.env.local.example</code>）
                  </li>
                  <li>填入以下环境变量：</li>
                </ol>
                <pre
                  style={{
                    background: '#f5f5f5',
                    padding: 16,
                    borderRadius: 4,
                    overflow: 'auto',
                  }}
                >
                  {`VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_API_KEY=sk-your-api-key
VITE_LLM_MODEL=gpt-4
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_AMAP_API_KEY=your-amap-key
VITE_AMAP_SECURITY_CODE=your-amap-security-code`}
                </pre>
                <p>3. 重启开发服务器使配置生效</p>
              </div>

              <Alert
                message="安全提示"
                description=".env.local 文件已添加到 .gitignore，不会被提交到 Git 仓库。请妥善保管您的 API Keys。"
                type="info"
                showIcon
              />

              <div>
                <h4>获取 API Keys：</h4>
                <ul>
                  <li>
                    <strong>LLM API (OpenAI)：</strong>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://platform.openai.com/api-keys
                    </a>
                  </li>
                  <li>
                    <strong>Supabase：</strong>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://supabase.com
                    </a>{' '}
                    → Project Settings → API
                  </li>
                  <li>
                    <strong>高德地图：</strong>
                    <a
                      href="https://console.amap.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://console.amap.com
                    </a>{' '}
                    → 应用管理 → 我的应用 → 获取 Key 和安全密钥（securityJsCode）
                  </li>
                </ul>
              </div>
            </Space>
          </Card>
        </Card>
      </Content>
    </Layout>
  );
}
