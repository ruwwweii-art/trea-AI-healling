import EmotionCard from '../components/EmotionCard';
import { mockEmotionRecords } from '../utils/mockData';

export default function EmotionRecordsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-warm-gray-50 p-6">
      {/* 头部 */}
      <div className="mb-6">
        <h1 className="text-2xl text-gray-700 font-medium mb-2">情绪记录</h1>
        <p className="text-gray-500">查看你的情绪变化历程</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">总记录数</div>
          <div className="text-3xl text-gray-700 font-medium">{mockEmotionRecords.length}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">平均情绪分值</div>
          <div className="text-3xl text-haze-blue-400 font-medium">
            {mockEmotionRecords.reduce((sum, record) => sum + record.score, 0) / mockEmotionRecords.length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-soft">
          <div className="text-sm text-gray-400 mb-1">连续记录天数</div>
          <div className="text-3xl text-mood-high font-medium">7天</div>
        </div>
      </div>

      {/* 情绪记录列表 */}
      <div className="space-y-4">
        {mockEmotionRecords.map((record) => (
          <EmotionCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}