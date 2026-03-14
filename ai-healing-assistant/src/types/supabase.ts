// 情绪记录数据模型
export interface EmotionRecord {
  id: string;
  user_id: string;
  date: Date;
  score: number; // 1-7分制
  type: string; // 'anxiety' | 'calm' | 'low' | 'tired' | 'happy' | 'empty'
  keywords: string[]; // 数组类型
  intensity: number; // 1-5分制
  trigger?: string; // 触发因素
  duration?: string; // 持续时间
  action?: string; // 采取的行动
  created_at: Date;
}

// 情绪统计
export interface EmotionStats {
  totalRecords: number;
  averageScore: number;
  consecutiveDays: number;
  mostCommonEmotion: string;
  trendDirection: 'up' | 'down' | 'stable';
}