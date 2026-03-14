import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppStore } from '../store'

dayjs.locale('zh-cn')

const MOOD_TYPE_COLORS: Record<string, string> = {
  平静: '#E8F0F2',
  焦虑: '#F5E0D0',
  疲惫: '#D4C4B0',
  开心: '#CCAB98',
  低落: '#C29A85',
}

const MOOD_TYPE_DARK_COLORS: Record<string, string> = {
  平静: '#8DA6AC',
  焦虑: '#B89068',
  疲惫: '#A69A78',
  开心: '#996A4C',
  低落: '#7C5C46',
}

const MOOD_SCORE_COLORS = [
  { min: 1, max: 2, color: '#C29A85', label: '低落' },
  { min: 2, max: 3, color: '#B89068', label: '焦虑' },
  { min: 3, max: 4, color: '#A69A78', label: '疲惫' },
  { min: 4, max: 5, color: '#8DA6AC', label: '平静' },
  { min: 5, max: 6, color: '#996A4C', label: '开心' },
  { min: 6, max: 7, color: '#7C5C46', label: '愉悦' },
]

const getMoodTypeColor = (type: string) => MOOD_TYPE_COLORS[type] || MOOD_TYPE_COLORS['平静']

const getScoreColor = (score: number) => {
  for (const range of MOOD_SCORE_COLORS) {
    if (score >= range.min && score < range.max) return range.color
  }
  return MOOD_SCORE_COLORS[MOOD_SCORE_COLORS.length - 1].color
}

const formatTime = (dateString: string) => {
  const date = dayjs(dateString)
  const now = dayjs()
  const diffDays = now.diff(date, 'day')

  if (diffDays === 0) {
    return `今天 ${date.format('HH:mm')}`
  } else if (diffDays === 1) {
    return `昨天 ${date.format('HH:mm')}`
  } else {
    return date.format('M月D日 HH:mm')
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const moodRecords = useAppStore((state) => state.moodRecords)
  const deleteMoodRecord = useAppStore((state) => state.deleteMoodRecord)
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'7d' | '30d'>('7d')

  // 生成情绪趋势数据
  const trendData = useMemo(() => {
    const days = viewMode === '7d' ? 7 : 30
    const dateLabels = Array.from({ length: days }, (_, i) => {
      const date = dayjs().subtract(days - 1 - i, 'day')
      return viewMode === '7d' ? date.format('M/D') : date.format('M/D')
    })

    return dateLabels.map(date => {
      const dayRecords = moodRecords.filter(r => dayjs(r.date).format('M/D') === date)
      const avgScore = dayRecords.length > 0
        ? dayRecords.reduce((sum, r) => sum + r.moodScore, 0) / dayRecords.length
        : null

      return {
        date,
        score: avgScore !== null ? Number(avgScore.toFixed(1)) : null,
      }
    }).filter(d => d.score !== null)
  }, [moodRecords, viewMode])

  // 生成30天情绪分布（小提琴图简化版：密度分布）
  const moodDistributionData = useMemo(() => {
    const scoreRanges = ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7']
    return scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number)
      const count = moodRecords.filter(r => r.moodScore >= min && r.moodScore < max).length
      return {
        range,
        count,
        color: MOOD_SCORE_COLORS[scoreRanges.indexOf(range)]?.color || '#E8F0F2',
      }
    })
  }, [moodRecords])

  // 生成日历热力图数据
  const calendarData = useMemo(() => {
    const weeks = []
    const today = dayjs()
    const startDate = today.subtract(11, 'week').startOf('week')

    for (let w = 0; w < 12; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = startDate.add(w, 'week').add(d, 'day')
        const records = moodRecords.filter(r =>
          dayjs(r.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        )
        const avgScore = records.length > 0
          ? records.reduce((sum, r) => sum + r.moodScore, 0) / records.length
          : null

        week.push({
          date: date.format('YYYY-MM-DD'),
          hasRecord: records.length > 0,
          score: avgScore,
          isToday: date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD'),
        })
      }
      weeks.push(week)
    }

    return weeks
  }, [moodRecords])

  // 生成情绪类型分布数据
  const moodTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    moodRecords.forEach(record => {
      typeCounts[record.moodType] = (typeCounts[record.moodType] || 0) + 1
    })

    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
      color: MOOD_TYPE_DARK_COLORS[name] || MOOD_TYPE_DARK_COLORS['平静'],
    }))
  }, [moodRecords])

  // 历史记录按时间倒序
  const sortedRecords = useMemo(() => {
    return [...moodRecords].sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
  }, [moodRecords])

  // 统计数据
  const stats = useMemo(() => {
    if (moodRecords.length === 0) return null

    const avgScore = moodRecords.reduce((sum, r) => sum + r.moodScore, 0) / moodRecords.length
    const maxScore = Math.max(...moodRecords.map(r => r.moodScore))
    const minScore = Math.min(...moodRecords.map(r => r.moodScore))

    // 计算情绪稳定性（标准差）
    const variance = moodRecords.reduce((sum, r) =>
      sum + Math.pow(r.moodScore - avgScore, 2), 0
    ) / moodRecords.length
    const stability = Math.sqrt(variance)

    return {
      avgScore: Number(avgScore.toFixed(1)),
      maxScore,
      minScore,
      stability: Number(stability.toFixed(1)),
      totalRecords: moodRecords.length,
    }
  }, [moodRecords])

  const handleDelete = (id: string) => {
    deleteMoodRecord(id)
    setShowDeleteConfirm(null)
    setSelectedRecord(null)
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 bg-cream-50/80 backdrop-blur-sm p-6 mb-8 z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-medium text-gray-800">情绪记录</h1>
          <div className="w-12"></div>
        </div>
        <p className="text-gray-600 text-center">看见自己的情绪变化</p>
      </header>

      <div className="px-6 space-y-8">
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-medium text-earth-600">{stats.avgScore}</p>
              <p className="text-xs text-gray-500 mt-1">平均分</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-medium text-earth-600">{stats.maxScore}</p>
              <p className="text-xs text-gray-500 mt-1">最高分</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-medium text-earth-600">{stats.minScore}</p>
              <p className="text-xs text-gray-500 mt-1">最低分</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-medium text-earth-600">{stats.totalRecords}</p>
              <p className="text-xs text-gray-500 mt-1">总记录</p>
            </div>
          </div>
        )}

        {/* 情绪趋势图 */}
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">情绪趋势</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('7d')}
                className={`px-3 py-1 rounded-full text-sm ${
                  viewMode === '7d'
                    ? 'bg-earth-500 text-white'
                    : 'bg-earth-100 text-gray-600 hover:bg-earth-200'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => setViewMode('30d')}
                className={`px-3 py-1 rounded-full text-sm ${
                  viewMode === '30d'
                    ? 'bg-earth-500 text-white'
                    : 'bg-earth-100 text-gray-600 hover:bg-earth-200'
                }`}
              >
                近30天
              </button>
            </div>
          </div>
          {trendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCAB98" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#CCAB98" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#A0A0A0"
                    fontSize={12}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#A0A0A0"
                    fontSize={12}
                    domain={[1, 7]}
                    padding={{ top: 20 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F5F0E8',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#CCAB98"
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-cream-100 rounded-xl">
              <p className="text-gray-400">还没有签到记录，快去签到吧</p>
            </div>
          )}
        </section>

        {/* 情绪分布图 */}
        {moodRecords.length >= 5 && (
          <section className="bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-medium mb-4">情绪分布</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodDistributionData} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="#A0A0A0"
                    fontSize={12}
                    domain={[0, 'dataMax']}
                  />
                  <YAxis
                    type="category"
                    dataKey="range"
                    stroke="#A0A0A0"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F5F0E8',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#CCAB98"
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* 情绪类型分布 */}
        {moodTypeData.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-medium mb-4">情绪类型占比</h2>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F5F0E8',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* 日历热力图 */}
        {calendarData.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-medium mb-4">12周签到记录</h2>
            <div className="space-y-1">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`flex-1 aspect-square rounded cursor-pointer transition-all hover:scale-110 ${
                        day.isToday ? 'ring-2 ring-earth-400' : ''
                      }`}
                      style={{
                        backgroundColor: day.hasRecord
                          ? getScoreColor(day.score || 4)
                          : '#F5EDE5',
                      }}
                      title={day.date}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#C29A85' }}></div>
                <span>低落</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8DA6AC' }}></div>
                <span>平静</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7C5C46' }}></div>
                <span>愉悦</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F5EDE5' }}></div>
                <span>未签到</span>
              </div>
            </div>
          </section>
        )}

        {/* 历史记录列表 */}
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">历史记录</h2>
          {sortedRecords.length > 0 ? (
            <div className="space-y-3">
              {sortedRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedRecord === record.id
                      ? 'bg-earth-100 ring-2 ring-earth-300'
                      : 'bg-cream-100 hover:bg-cream-200'
                  }`}
                  onClick={() => setSelectedRecord(record.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">{formatTime(record.date)}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 text-gray-700 rounded-full text-sm font-medium"
                        style={{ backgroundColor: getMoodTypeColor(record.moodType) }}
                      >
                        {record.moodType}
                      </span>
                      <span className="text-sm text-earth-600 font-medium">
                        {record.moodScore}/7
                      </span>
                    </div>
                  </div>
                  {selectedRecord === record.id && (
                    <>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {record.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/50 rounded text-xs text-gray-500"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      {record.notes && (
                        <p className="text-gray-700">{record.notes}</p>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(record.id)
                        }}
                        className="mt-3 text-red-400 hover:text-red-600 text-sm"
                      >
                        删除此记录
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* 删除确认对话框 */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-soft">
                    <h3 className="text-lg font-medium mb-2">确认删除</h3>
                    <p className="text-gray-600 mb-6">确定要删除这条记录吗？删除后无法恢复。</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 py-3 bg-earth-100 text-gray-700 rounded-full hover:bg-earth-200 transition-all"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleDelete(showDeleteConfirm)}
                        className="flex-1 py-3 bg-red-400 text-white rounded-full hover:bg-red-500 transition-all"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>还没有签到记录</p>
              <p className="text-sm mt-2">开始你的第一次情绪签到吧</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
