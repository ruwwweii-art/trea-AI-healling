import EmotionCard from '../components/EmotionCard';
import { useEmotionRecords, useEmotionStats } from '../hooks/useEmotionData';

export default function EmotionRecordsPage() {
  const { records, isLoading: recordsLoading, refetch: refetchRecords } = useEmotionRecords();
  const { stats, isLoading: statsLoading } = useEmotionStats();

  const emotionLabels = {
    anxiety: '焦虑',
    calm: '平静',
    low: '低落',
    tired: '疲惫',
    happy: '开心',
    empty: '空虚',
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-warm-gray-50 p-6">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-gray-700 font-medium mb-2">情绪记录</h1>
            <p className="text-gray-500">查看你的情绪变化历程</p>
          </div>
          <button
            onClick={refetchRecords}
            className="px-4 py-2 rounded-lg bg-haze-blue-100 text-gray-700 hover:bg-haze-blue-200 transition-all"
            disabled={recordsLoading}
          >
            刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">
            {statsLoading ? '加载中...' : '总记录数'}
          </div>
          <div className="text-3xl text-gray-700 font-medium">
            {statsLoading ? '...' : stats.totalRecords}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">
            {statsLoading ? '加载中...' : '平均情绪分值'}
          </div>
          <div className="text-3xl text-haze-blue-400 font-medium">
            {statsLoading ? '...' : stats.averageScore.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">
            {statsLoading ? '加载中...' : '连续记录天数'}
          </div>
          <div className="text-3xl text-mood-high font-medium">
            {statsLoading ? '...' : stats.consecutiveDays}天
          </div>
        </div>
      </div>

      {/* 趋势信息 */}
      <div className="bg-white rounded-xl p-5 shadow-soft mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-400">最常见情绪：</span>
            <span className="text-lg text-gray-700 font-medium ml-2">
              {statsLoading ? '...' : emotionLabels[stats.mostCommonEmotion] || stats.mostCommonEmotion}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-400">本月趋势：</span>
            <span className="text-lg text-gray-700 font-medium ml-2">
              {statsLoading ? '...' : trendIcons[stats.trendDirection]}
            </span>
          </div>
        </div>
      </div>

      {/* 情绪记录列表 */}
      {recordsLoading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-haze-blue-200 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">加载中...</span>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">还没有情绪记录，开始第一次情绪签到吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <EmotionCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}