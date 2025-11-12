import { useEffect, useRef } from 'react';
import { Modal, Typography, Progress, Spin } from 'antd';
import { LoadingOutlined, RocketOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface StreamingDisplayProps {
  visible: boolean;
  content: string;
  title?: string;
  isComplete?: boolean;
}

export default function StreamingDisplay({
  visible,
  content,
  title = '正在生成您的旅行计划',
  isComplete = false,
}: StreamingDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  // 简单的进度估算（基于内容长度）
  const estimateProgress = () => {
    if (isComplete) return 100;
    // 假设完整内容约为2000字符
    const estimated = Math.min(95, Math.floor((content.length / 2000) * 100));
    return estimated;
  };

  return (
    <Modal
      open={visible}
      title={null}
      footer={null}
      closable={false}
      centered
      width={700}
      bodyStyle={{ padding: 0 }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          {isComplete ? (
            <RocketOutlined style={{ fontSize: 32, color: '#fff', marginRight: 12 }} />
          ) : (
            <LoadingOutlined
              spin
              style={{ fontSize: 32, color: '#fff', marginRight: 12 }}
            />
          )}
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            {isComplete ? '旅行计划生成完成！' : title}
          </Title>
        </div>

        {/* 进度条 */}
        <Progress
          percent={estimateProgress()}
          status={isComplete ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          showInfo={true}
        />

        {!isComplete && (
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
            AI正在为您精心规划行程，请稍候...
          </Text>
        )}
      </div>

      {/* 内容显示区域 */}
      <div
        ref={contentRef}
        style={{
          padding: '24px',
          maxHeight: '500px',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content ? (
          <div>
            <Text
              style={{
                color: '#333',
                display: 'block',
              }}
            >
              {content}
            </Text>
            {/* 打字机光标效果 */}
            {!isComplete && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '20px',
                  backgroundColor: '#667eea',
                  marginLeft: '2px',
                  animation: 'blink 1s infinite',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>
              初始化AI助手...
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div
        style={{
          padding: '16px 24px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          {isComplete
            ? '✨ 计划生成完成，即将为您展示详细内容'
            : '💡 提示：AI正在根据您的需求生成个性化旅行方案'}
        </Text>
      </div>

      {/* CSS动画 */}
      <style>
        {`
          @keyframes blink {
            0%, 50% {
              opacity: 1;
            }
            51%, 100% {
              opacity: 0;
            }
          }

          /* 自定义滚动条样式 */
          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          div::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          div::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </Modal>
  );
}
