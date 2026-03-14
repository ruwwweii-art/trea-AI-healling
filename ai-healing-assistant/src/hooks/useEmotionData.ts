import { useState, useEffect, useCallback } from 'react';
import { createEmotionRecord, getEmotionRecords, getEmotionStats, getRecentEmotionRecords } from '../services/supabaseService';
import type { EmotionRecord } from '../types/supabase';

export function useEmotionRecords() {
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEmotionRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('Error fetching emotion records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRecord = useCallback(async (record: Omit<EmotionRecord, 'id'>) => {
    try {
      const newRecord = await createEmotionRecord(record);
      setRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存数据失败');
      console.error('Error creating emotion record:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    refetch: fetchRecords,
    createRecord,
  };
}

export function useEmotionStats() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    averageScore: 4,
    consecutiveDays: 0,
    mostCommonEmotion: 'calm',
    trendDirection: 'stable' as 'up' | 'down' | 'stable',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getEmotionStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching emotion stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

export function useRecentEmotionRecords(days: number = 7) {
  const [recentRecords, setRecentRecords] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecent = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getRecentEmotionRecords(days);
      setRecentRecords(data);
    } catch (err) {
      console.error('Error fetching recent emotion records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { recentRecords, isLoading, refetch: fetchRecent };
}