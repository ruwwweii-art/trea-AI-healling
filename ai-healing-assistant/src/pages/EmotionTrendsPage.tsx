import { mockEmotionRecords } from '../utils/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function EmotionTrendsPage() {
  // 计算最近7天数据
  const last7Days = mockEmotionRecords.slice(0, 7).reverse();

  // 30天分布数据
  const emotionTypes = ['anxiety', 'calm', 'low', 'tired', 'happy', 'empty'] as const;
  const distributionData = emotionTypes.map(type => ({
    type,
    count: mockEmotionRecords.filter(r => r.type === type).length,
  }));

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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { day: 'numeric' })}
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
        </div>

        {/* 情绪类型分布 */}
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h2 className="text-lg text-gray-700 font-medium mb-4">情绪类型分布</h2>
          <div className="space-y-3">
            {distributionData.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="flex-1 h-8 bg-beige-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(item.count / mockEmotionRecords.length) * 100}%`,
                      backgroundColor: {
                        anxiety: '#D4C6B5',
                        calm: '#C8DEE8',
                        low: '#D4C6B5',
                        tired: '#DAD2C6',
                        happy: '#A8D5BA',
                        empty: '#DED4C8',
                      }[item.type],
                    }}
                  />
                </div>
                <div className="w-24 text-sm text-gray-600">
                  {item.type === 'anxiety' && '焦虑'}
                  {item.type === 'calm' && '平静'}
                  {item.type === 'low' && '低落'}
                  {item.type === 'tired' && '疲惫'}
                  {item.type === 'happy' && '开心'}
                  {item.type === 'empty' && '空虚'}
                </div>
                <div className="w-16 text-sm text-gray-400 font-medium">
                  {item.count}次
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月度统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="text-lg text-gray-700 font-medium mb-4">本月概览</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">最高情绪分值</span>
                <span className="text-mood-high font-medium">6分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最低情绪分值</span>
                <span className="text-mood-low font-medium">2分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最常见情绪</span>
                <span className="text-gray-700 font-medium">平静</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">情绪波动</span>
                <span className="text-gray-700 font-medium">中等</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="text-lg text-gray-700 font-medium mb-4">改善建议</h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-start gap-2">
                <span className="text-mood-high">✓</span>
                <span>情绪整体呈上升趋势</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-haze-blue-400">→</span>
                <span>建议继续保持情绪记录习惯</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-mood-mid">!</span>
                <span>焦虑情绪频率较高，可以尝试更多情绪调节方法</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}