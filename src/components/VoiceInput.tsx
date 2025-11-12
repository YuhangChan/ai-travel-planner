import { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Progress } from 'antd';
import { AudioOutlined, CloseOutlined } from '@ant-design/icons';
import { createSpeechRecognition } from '@/services/speech';
import { SpeechRecognitionResult } from '@/types';

const { Text } = Typography;

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onClose: () => void;
}

export default function VoiceInput({ onResult, onClose }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState(''); // 临时识别文本
  const [finalTranscript, setFinalTranscript] = useState(''); // 最终识别文本
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState<ReturnType<typeof createSpeechRecognition> | null>(null);

  useEffect(() => {
    try {
      const rec = createSpeechRecognition();
      setRecognition(rec);
    } catch (err: any) {
      setError(err.message);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognition) {
      setError('语音识别未初始化');
      return;
    }

    setInterimTranscript('');
    setFinalTranscript('');
    setError('');
    setIsListening(true);

    recognition.start(
      // 最终结果回调
      (result: SpeechRecognitionResult) => {
        setFinalTranscript(prev => prev + result.transcript);
        setInterimTranscript(''); // 清空临时文本
      },
      // 错误回调
      (err: string) => {
        setError(err);
        setIsListening(false);
      },
      // 实时结果回调（新增）
      (interim: string) => {
        setInterimTranscript(interim);
      }
    );
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);

      // 将最终结果传递给父组件
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    }
  };

  return (
    <Modal
      title="语音输入"
      open={true}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {error ? (
          <div>
            <Text type="danger">{error}</Text>
            <div style={{ marginTop: 16 }}>
              <Button onClick={onClose}>关闭</Button>
            </div>
          </div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              {isListening ? (
                <div>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: '#1890ff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '0 auto',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  >
                    <AudioOutlined style={{ fontSize: 48, color: '#fff' }} />
                  </div>
                  <Text strong style={{ display: 'block', marginTop: 16, fontSize: 16 }}>
                    正在聆听...
                  </Text>
                  <Text type="secondary">请说出您的旅行需求</Text>
                </div>
              ) : (
                <div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<AudioOutlined />}
                    onClick={startListening}
                    shape="circle"
                    style={{ width: 80, height: 80, fontSize: 32 }}
                  />
                  <Text strong style={{ display: 'block', marginTop: 16, fontSize: 16 }}>
                    点击开始录音
                  </Text>
                  <Text type="secondary">
                    例如："我想去日本，5天，预算1万元，喜欢美食和动漫"
                  </Text>
                </div>
              )}
            </div>

            {/* 实时显示识别文本 */}
            {(finalTranscript || interimTranscript) && (
              <div
                style={{
                  background: '#f0f2f5',
                  padding: 16,
                  borderRadius: 8,
                  textAlign: 'left',
                  minHeight: 80,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  识别结果：
                </Text>
                <div>
                  {/* 已确认的文本（黑色） */}
                  {finalTranscript && (
                    <Text style={{ fontSize: 16 }}>{finalTranscript}</Text>
                  )}
                  {/* 临时文本（灰色斜体） */}
                  {interimTranscript && (
                    <Text
                      type="secondary"
                      italic
                      style={{ fontSize: 16, marginLeft: finalTranscript ? 4 : 0 }}
                    >
                      {interimTranscript}
                    </Text>
                  )}
                </div>
              </div>
            )}

            {isListening && (
              <Button onClick={stopListening} danger size="large">
                完成录音
              </Button>
            )}
          </Space>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </Modal>
  );
}
