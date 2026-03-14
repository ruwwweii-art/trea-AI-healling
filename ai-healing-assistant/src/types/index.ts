// 情绪类型
export type EmotionType = 'anxiety' | 'calm' | 'low' | 'tired' | 'happy' | 'empty';

// 情绪记录
export interface EmotionRecord {
  id: string;
  date: Date;
  score: number; // 1-7分制
  type: EmotionType;
  keywords: string[];
  intensity: number; // 1-5分制
  trigger?: string; // 触发因素
  duration?: string; // 持续时间
  action?: string; // 采取的行动
}

// 对话消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 微行动
export interface MicroAction {
  id: string;
  type: 'emotional' | 'mindset' | 'action';
  title: string;
  description: string;
  duration: number; // 分钟
  emoji: string;
}

// 用户状态
export interface UserState {
  isLoggedIn: boolean;
  userName?: string;
}