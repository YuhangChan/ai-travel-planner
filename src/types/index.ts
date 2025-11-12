// 用户相关类型
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// 旅行计划类型
export interface TravelPlan {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  people_count: number;
  preferences: string;
  itinerary?: Itinerary;
  expenses?: Expense[];
  created_at: string;
  updated_at: string;
}

// 行程详情类型
export interface Itinerary {
  days: DayPlan[];
  total_budget: number;
  accommodation: Accommodation[];
  transportation: Transportation[];
}

// 每日行程
export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  meals: Meal[];
  budget: number;
}

// 活动
export interface Activity {
  id: string;
  name: string;
  type: 'attraction' | 'shopping' | 'entertainment' | 'other';
  location: Location;
  start_time: string;
  end_time: string;
  duration: number;
  cost: number;
  description?: string;
  tips?: string;
}

// 餐饮
export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  location: Location;
  time: string;
  cost: number;
  cuisine?: string;
  description?: string;
}

// 住宿
export interface Accommodation {
  id: string;
  name: string;
  type: string;
  location: Location;
  check_in: string;
  check_out: string;
  nights: number;
  cost: number;
  rating?: number;
  amenities?: string[];
}

// 交通
export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'subway' | 'taxi' | 'other';
  from: Location;
  to: Location;
  departure_time: string;
  arrival_time: string;
  cost: number;
  description?: string;
}

// 位置
export interface Location {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// 费用记录
export interface Expense {
  id: string;
  plan_id: string;
  category: 'accommodation' | 'transportation' | 'food' | 'activities' | 'shopping' | 'other';
  amount: number;
  currency: string;
  description: string;
  date: string;
  created_at: string;
}

// API 配置
export interface ApiConfig {
  llm_base_url?: string;
  llm_api_key?: string;
  amap_api_key?: string;
}

// 语音识别结果
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}
