import axios from 'axios';
import { TravelPlan, Itinerary } from '@/types';

interface GeneratePlanParams {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  peopleCount: number;
  preferences: string;
}

interface LLMResponse {
  itinerary: Itinerary;
  suggestions: string[];
}

export class LLMService {
  private baseURL: string;
  private apiKey: string;
  private model: string;

  constructor(baseURL: string, apiKey: string, model: string = 'gpt-4') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateTravelPlan(params: GeneratePlanParams): Promise<LLMResponse> {
    const prompt = this.buildPrompt(params);

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的旅行规划助手，擅长根据用户需求制定详细的旅行计划。你的回复必须是有效的JSON格式。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('LLM API Error:', error);
      throw new Error('生成旅行计划失败，请检查API配置');
    }
  }

  // 流式生成旅行计划（支持实时显示）
  async generateTravelPlanStream(
    params: GeneratePlanParams,
    onChunk: (text: string) => void,
    onComplete: (result: LLMResponse) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const prompt = this.buildPrompt(params);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的旅行规划助手，擅长根据用户需求制定详细的旅行计划。你的回复必须是有效的JSON格式。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          stream: true, // 启用流式输出
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // 流式输出完成，解析完整的JSON
              try {
                const parsed = JSON.parse(fullText);
                onComplete(parsed);
              } catch (parseError) {
                console.error('JSON解析失败:', fullText);
                onError('生成的内容格式错误');
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';

              if (content) {
                fullText += content;
                onChunk(content); // 实时回调每个chunk
              }
            } catch (e) {
              // 忽略无法解析的行
              console.warn('无法解析的数据行:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream LLM API Error:', error);
      onError('生成旅行计划失败，请检查API配置');
    }
  }

  async analyzeBudget(plan: TravelPlan): Promise<{
    breakdown: Record<string, number>;
    suggestions: string[];
  }> {
    const prompt = `请分析以下旅行计划的预算分配，给出详细的预算分解和优化建议：

目的地：${plan.destination}
日期：${plan.start_date} 至 ${plan.end_date}
总预算：¥${plan.budget}
人数：${plan.people_count}人
偏好：${plan.preferences}

请以JSON格式返回：
{
  "breakdown": {
    "accommodation": 住宿费用,
    "transportation": 交通费用,
    "food": 餐饮费用,
    "activities": 活动费用,
    "shopping": 购物费用,
    "other": 其他费用
  },
  "suggestions": ["建议1", "建议2", ...]
}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的旅行预算分析师。你的回复必须是有效的JSON格式。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Budget Analysis Error:', error);
      throw new Error('预算分析失败，请检查API配置');
    }
  }

  private buildPrompt(params: GeneratePlanParams): string {
    const days = Math.ceil(
      (new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return `请为以下旅行需求生成详细的旅行计划：

目的地：${params.destination}
开始日期：${params.startDate}
结束日期：${params.endDate}
行程天数：${days}天
总预算：¥${params.budget}
同行人数：${params.peopleCount}人
旅行偏好：${params.preferences}

请以JSON格式返回完整的旅行计划，包含：
1. 每日详细行程（景点、活动、餐饮安排）
2. 住宿推荐（包含具体酒店名称、位置、价格）
3. 交通安排（包含具体交通方式、时间、价格）
4. 总预算分配
5. 旅行建议

JSON格式示例：
{
  "itinerary": {
    "days": [
      {
        "day": 1,
        "date": "2024-01-01",
        "activities": [
          {
            "id": "act1",
            "name": "活动名称",
            "type": "attraction",
            "location": {"name": "地点名称", "address": "详细地址", "latitude": 纬度, "longitude": 经度},
            "start_time": "09:00",
            "end_time": "11:00",
            "duration": 120,
            "cost": 100,
            "description": "活动描述",
            "tips": "游玩建议"
          }
        ],
        "meals": [
          {
            "id": "meal1",
            "name": "餐厅名称",
            "type": "lunch",
            "location": {"name": "地点名称", "address": "详细地址"},
            "time": "12:00",
            "cost": 80,
            "cuisine": "菜系",
            "description": "推荐理由"
          }
        ],
        "budget": 500
      }
    ],
    "accommodation": [
      {
        "id": "hotel1",
        "name": "酒店名称",
        "type": "hotel",
        "location": {"name": "地点", "address": "地址", "latitude": 纬度, "longitude": 经度},
        "check_in": "2024-01-01",
        "check_out": "2024-01-02",
        "nights": 1,
        "cost": 500,
        "rating": 4.5,
        "amenities": ["WiFi", "早餐"]
      }
    ],
    "transportation": [
      {
        "id": "trans1",
        "type": "flight",
        "from": {"name": "出发地"},
        "to": {"name": "目的地"},
        "departure_time": "2024-01-01 08:00",
        "arrival_time": "2024-01-01 10:00",
        "cost": 1000,
        "description": "航班信息"
      }
    ],
    "total_budget": ${params.budget}
  },
  "suggestions": ["建议1", "建议2", "建议3"]
}`;
  }
}

import config from '@/config/api';

// 默认导出配置好的 LLM 服务实例
export const llmService = new LLMService(
  config.llm.baseURL,
  config.llm.apiKey,
  config.llm.model
);

export const createLLMService = (baseURL: string, apiKey: string, model: string = 'gpt-4') => {
  return new LLMService(baseURL, apiKey, model);
};
