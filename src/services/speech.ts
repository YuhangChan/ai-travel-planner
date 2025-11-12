import { SpeechRecognitionResult } from '@/types';

// Web Speech API 类型定义
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('浏览器不支持语音识别，请使用Chrome或Edge浏览器');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const alternative = result[0];

      onResult({
        transcript: alternative.transcript,
        confidence: alternative.confidence,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      const errorMessage = this.getErrorMessage(event.error);
      if (onError) {
        onError(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      if (onError) {
        onError('启动语音识别失败');
      }
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive(): boolean {
    return this.isListening;
  }

  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': '未检测到语音，请重试',
      'audio-capture': '无法访问麦克风',
      'not-allowed': '未授予麦克风权限',
      'network': '网络错误',
      'aborted': '语音识别已中止',
    };

    return errorMessages[error] || `语音识别错误: ${error}`;
  }
}

export const createSpeechRecognition = () => {
  return new SpeechRecognitionService();
};
