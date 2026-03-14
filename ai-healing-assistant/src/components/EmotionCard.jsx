const emotionColors = {
  anxiety: 'bg-mood-low',
  calm: 'bg-mood-mid',
  low: 'bg-mood-low',
  tired: 'bg-warm-gray-200',
  happy: 'bg-mood-high',
  empty: 'bg-beige-300',
};

const emotionLabels = {
  anxiety: '焦虑',
  calm: '平静',
  low: '低落',
  tired: '疲惫',
  happy: '开心',
  empty: '空虚',
};

function EmotionCard({ record }) {
  const dateStr = new Date(record.date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date(record.date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow-soft hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-400 mb-1">{dateStr}</p>
          <p className="text-lg text-gray-600">{timeStr}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg ${emotionColors[record.type]}`}>
          <span className="text-white font-medium">{emotionLabels[record.type]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">情绪分值：</span>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-2 rounded ${
                  i < record.score ? 'bg-haze-blue-200' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-haze-blue-400 font-medium">{record.score}/7</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">强度：</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-2 rounded ${
                  i < record.intensity ? 'bg-warm-gray-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {record.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-beige-200 text-gray-600 rounded-lg text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>

        {record.trigger && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">触发因素：</span>
            <span className="text-gray-600">{record.trigger}</span>
          </div>
        )}

        {record.action && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">采取行动：</span>
            <span className="text-gray-600">{record.action}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmotionCard;