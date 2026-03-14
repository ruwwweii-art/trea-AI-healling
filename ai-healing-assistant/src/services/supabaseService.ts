import { createClient } from '@supabase/supabase-js';
import type { EmotionRecord } from '../types/supabase';

// Supabase 客户端
let supabaseClient: ReturnType<typeof createClient> | null = null;

// 获取 Supabase 客户端
export function getSupabaseClient() {
  // 检查是否配置了 Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, using local storage fallback');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

// 创建情绪记录
export async function createEmotionRecord(record: Omit<EmotionRecord, 'id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // 回退到本地存储
    const localRecords = getLocalEmotionRecords();
    const newRecord = {
      id: Date.now().toString(),
      user_id: 'local',
      ...record,
      created_at: new Date(),
    };
    localRecords.push(newRecord);
    setLocalEmotionRecords(localRecords);
    return newRecord;
  }

  const { data, error } = await supabase
    .from('emotion_records')
    .insert([
      {
        ...record,
        user_id: 'demo-user', // 在真实应用中应该从认证中获取
      },
    ])
    .select();

  if (error) {
    console.error('Error creating emotion record:', error);
    throw error;
  }

  return data[0];
}

// 获取情绪记录
export async function getEmotionRecords(userId: string = 'demo-user') {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // 回退到本地存储
    return getLocalEmotionRecords();
  }

  const { data, error } = await supabase
    .from('emotion_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching emotion records:', error);
    throw error;
  }

  return data || [];
}

// 获取情绪统计
export async function getEmotionStats(userId: string = 'demo-user') {
  const records = await getEmotionRecords(userId);

  if (records.length === 0) {
    return {
      totalRecords: 0,
      averageScore: 4,
      consecutiveDays: 0,
      mostCommonEmotion: 'calm',
      trendDirection: 'stable',
    };
  }

  const totalRecords = records.length;
  const averageScore = records.reduce((sum, r) => sum + r.score, 0) / totalRecords;

  // 计算连续记录天数
  const uniqueDates = [...new Set(records.map(r => new Date(r.date).toDateString()))];
  const consecutiveDays = uniqueDates.length;

  // 计算最常见情绪
  const emotionCounts = records.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];

  // 计算趋势
  const recentRecords = records.slice(0, 7);
  const averageRecent = recentRecords.reduce((sum, r) => sum + r.score, 0) / recentRecords.length;
  const olderRecords = records.slice(7, 14);
  const averageOlder = olderRecords.length > 0
    ? olderRecords.reduce((sum, r) => sum + r.score, 0) / olderRecords.length
    : averageRecent;

  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (averageRecent > averageOlder + 0.3) {
    trendDirection = 'up';
  } else if (averageRecent < averageOlder - 0.3) {
    trendDirection = 'down';
  }

  return {
    totalRecords,
    averageScore,
    consecutiveDays,
    mostCommonEmotion,
    trendDirection,
  };
}

// 获取最近N天的数据
export async function getRecentEmotionRecords(days: number = 7) {
  const records = await getEmotionRecords();
  return records.slice(0, days);
}

// ===== 本地存储辅助函数 =====

const LOCAL_STORAGE_KEY = 'emotion_records';

function getLocalEmotionRecords(): EmotionRecord[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading local storage:', error);
    return [];
  }
}

function setLocalEmotionRecords(records: EmotionRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error writing to local storage:', error);
  }
}