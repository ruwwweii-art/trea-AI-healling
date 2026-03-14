import { useRecentEmotionRecords, useEmotionStats } from '../hooks/useEmotionData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function EmotionTrendsPage() {
  const { recentRecords, isLoading: recentLoading } = useRecentEmotionRecords(7);
  const { stats, isLoading: statsLoading } = useEmotionStats();

  const emotionColors = {
    anxiety: '#D4C6B5',
    calm: '#C8DEE8',
    low: '#D4C6B5',
    tired: '#DAD2C6',
    happy: '#A8D5BA',
    empty: '#DED4C8',
  };

  const emotionLabels = {
    anxiety: '焦虑',
    calm: '平静',
    low: '低落',
    tired: '疲惫',
    happy: '开心',
    empty: '空虚',
  };

  // 准备图表数据
  const chartData = recentLoading
    ? []
    : recentRecords.reverse().map((record) => ({
        date: new Date(record.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        score: record.score,
      }));

  // 准备分布数据
  const emotionTypes = ['anxiety', 'calm', 'low', 'tired', 'happy', 'empty'];
  const distributionData = recentLoading
    ? []
    : emotionTypes.map((type) => ({
        type,
        count: recentRecords.filter((r) => r.type === type).length,
      }));

  // 趋势方向显示
  const trendInfo = {
    up: { text: '上升', color: 'text-mood-high', bgColor: 'bg-mood-high/10' },
    down: { text: '下降', color: 'text-mood-low', bgColor: 'bg-mood-low/10' },
    stable: { text: '稳定', color: 'text-gray-600', bgColor: 'bg-gray-200' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-warm-gray-50 p-6">
      {/* 头部 */}
      <div className="mb-6">
        <h1 className="text-2xl text-gray-700 font-medium mb-2">情绪趋势</h1>
        <p className="text-gray-500">了解你的情绪变化模式</p>
      </div>

      <div className="space-y-8">
        {/* 7天情绪趋势 */}
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h2 className="text-lg text-gray-700 font-medium mb-4">近7天情绪趋势</h2>
          {recentLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-haze-blue-200 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">加载中...</span>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D6" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#A0A0A0"
                />
                <YAxis
                  domain={[1, 7]}
                  stroke="#A0A0A0"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F5F0E8',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#6B6375',
                  }}
                  formatter={(value) => `情绪分值: ${value}`}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#A8D5BA"
                  fill="#A8D5BA"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              暂无数据
            </div>
          )}
        </div>

        {/* 情绪类型分布 */}
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h2 className="text-lg text-gray-700 font-medium mb-4">情绪类型分布</h2>
          {recentLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-haze-blue-200 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">加载中...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {distributionData.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className="flex-1 h-8 bg-beige-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(item.count / (recentRecords.length || 1)) * 100}%`,
                        backgroundColor: emotionColors[item.type],
                      }}
                    />
                  </div>
                  <div className="w-24 text-sm text-gray-600">
                    {emotionLabels[item.type] || item.type}
                  </div>
                  <div className="w-16 text-sm text-gray-400 font-medium">
                    {item.count}次
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 月度统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="text-lg text-gray-700 font-medium mb-4">本月概览</h3>
            {statsLoading ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-haze-blue-200 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400">加载中...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">最高情绪分值</span>
                  <span className="text-mood-high font-medium">
                    {recentRecords.length > 0 ? Math.max(...recentRecords.map(r => r.score)) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最低情绪分值</span>
                  <span className="text-mood-low font-medium">
                    {recentRecords.length > 0 ? Math.min(...recentRecords.map(r => r.score)) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均情绪分值</span>
                  <span className="text-gray-700 font-medium">
                    {stats.averageScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">情绪波动</span>
                  <span className="text-gray-700 font-medium">
                    {stats.trendDirection === 'up' ? '较大' : stats.trendDirection === 'down' ? '较小' : '中等'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="text-lg text-gray-700 font-medium mb-4">改善建议</h3>
            {statsLoading ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-haze-blue-200 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400">加载中...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-gray-600">
                <p className="flex items-start gap-2">
                  <span className={`px-2 py-1 rounded-md text-sm ${trendInfo[stats.trendDirection].bgColor}`}>
                    {trendInfo[stats.trendDirection].text}
                  </span>
                  <span>情绪整体呈{trendInfo[stats.trendDirection].text}趋势</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-haze-blue-400">→</span>
                  <span>
                    {stats.trendDirection === 'up'
                      ? '继续保持积极的生活方式和情绪调节方法'
                      : stats.trendDirection === 'down'
                      ? '建议尝试更多情绪调节方法，如冥想、运动等'
                      : '保持当前的状态，适度调整'}
                  </span>
                </p>
                {stats.averageScore >= 5 && (
                  <p className="flex items-start gap-2">
                    <span className="text-mood-high">✓</span>
                    <span>整体情绪状态良好，继续保持！</span>
                  </p>
                )}
                {stats.averageScore < 3 && (
                  <p className="flex items-start gap-2">
                    <span className="text-mood-mid">!</span>
                    <span>建议寻求专业心理支持或与信任的朋友交流</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}