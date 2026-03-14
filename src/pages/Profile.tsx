import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useAppStore } from '../store'

dayjs.locale('zh-cn')

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Profile() {
  const navigate = useNavigate()
  const moodRecords = useAppStore((state) => state.moodRecords)
  const exportData = useAppStore((state) => state.exportData)
  const importData = useAppStore((state) => state.importData)
  const clearAllData = useAppStore((state) => state.clearAllData)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [showImportError, setShowImportError] = useState(false)
  const fileInputRef = useState<HTMLInputElement | null>(null)[0]

  // 计算统计数据
  const stats = useMemo(() => {
    const totalCheckIns = moodRecords.length
    const avgScore = totalCheckIns > 0
      ? moodRecords.reduce((sum, r) => sum + r.moodScore, 0) / totalCheckIns
      : 0

    // 计算连续签到天数
    let streak = 0
    const today = dayjs().startOf('day')
    for (let i = 0; i < 365; i++) {
      const checkDate = today.subtract(i, 'day')
      const hasCheckIn = moodRecords.some(r =>
        dayjs(r.date).format('YYYY-MM-DD') === checkDate.format('YYYY-MM-DD')
      )
      if (hasCheckIn) {
        streak++
      } else if (i > 0) {
        // 第一天允许没有签到（今天可能还没签到）
        break
      }
    }

    // 计算本周签到状态
    const weekStart = dayjs().startOf('week')
    const weekCheckIns = WEEK_DAYS.map((_, index) => {
      const date = weekStart.add(index, 'day')
      const hasCheckIn = moodRecords.some(r =>
        dayjs(r.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
      )
      return hasCheckIn
    })

    // 计算情绪类型分布
    const moodTypeCounts: Record<string, number> = {}
    moodRecords.forEach(r => {
      moodTypeCounts[r.moodType] = (moodTypeCounts[r.moodType] || 0) + 1
    })
    const dominantMood = Object.entries(moodTypeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    return {
      totalCheckIns,
      avgScore: Number(avgScore.toFixed(1)),
      streak,
      weekCheckIns,
      dominantMood,
      completedActions: totalCheckIns, // 完成行动数暂时用总签到数模拟
    }
  }, [moodRecords])

  const handleExport = () => {
    try {
      const data = exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-healing-backup-${dayjs().format('YYYY-MM-DD')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowExportSuccess(true)
      setTimeout(() => setShowExportSuccess(false), 2000)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importData(content)
      if (success) {
        setShowExportSuccess(true)
        setTimeout(() => setShowExportSuccess(false), 2000)
      } else {
        setShowImportError(true)
        setTimeout(() => setShowImportError(false), 3000)
      }
    }
    reader.readAsText(file)
    // Reset input
    e.target.value = ''
  }

  const handleClearAll = () => {
    clearAllData()
    setShowClearConfirm(false)
  }

  const menuItems = [
    { icon: '📤', label: '导出数据', action: handleExport, count: null },
    { icon: '📥', label: '导入数据', action: () => fileInputRef?.click(), count: null },
    { icon: '🗑️', label: '清空所有数据', action: () => setShowClearConfirm(true), count: null },
    { icon: '⚙️', label: '设置', action: undefined, count: null },
  ]

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
          <h1 className="text-2xl font-medium text-gray-800">个人中心</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl p-6 shadow-soft space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-earth-200 to-earth-300 rounded-full flex items-center justify-center mb-3 shadow-soft">
              <span className="text-5xl">🌱</span>
            </div>
            <h2 className="text-xl font-medium text-gray-800">疗愈之旅</h2>
            <p className="text-gray-500 text-sm mt-1">
              {stats.streak > 0 ? `已连续签到 ${stats.streak} 天` : '还没有签到记录'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-earth-100">
            <div className="text-center">
              <p className="text-3xl font-medium text-earth-600">{stats.totalCheckIns}</p>
              <p className="text-xs text-gray-500 mt-1">总签到</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-earth-600">{stats.avgScore || '-'}</p>
              <p className="text-xs text-gray-500 mt-1">平均分</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-earth-600">{stats.completedActions}</p>
              <p className="text-xs text-gray-500 mt-1">完成行动</p>
            </div>
          </div>

          {stats.dominantMood && stats.totalCheckIns > 0 && (
            <div className="pt-4 border-t border-earth-100">
              <p className="text-sm text-gray-600 text-center">
                你最常见的情绪状态是 <span className="font-medium text-earth-600">{stats.dominantMood}</span>
              </p>
            </div>
          )}
        </div>

        {/* 签到日历 */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-medium mb-4">本周签到</h3>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day, index) => (
              <div key={day} className="text-center">
                <p className="text-xs text-gray-400 mb-2">{day}</p>
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                    stats.weekCheckIns[index]
                      ? 'bg-earth-400 text-white'
                      : 'bg-earth-100 text-gray-400'
                  }`}
                >
                  {stats.weekCheckIns[index] ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full px-6 py-4 flex items-center justify-between hover:bg-cream-50 transition-all ${
                index !== menuItems.length - 1 ? 'border-b border-earth-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-700">{item.label}</span>
              </div>
              {item.count !== null && (
                <span className="px-3 py-1 bg-earth-100 text-earth-600 rounded-full text-sm">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 温馨提示 */}
        <div className="bg-misty-500 rounded-2xl p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            💡 温馨提示：坚持记录情绪，帮助你更好地了解自己。如果感觉有需要，也可以寻求专业帮助。
          </p>
        </div>

        {/* 隐藏的文件输入框 */}
        <input
          ref={(el) => {
            if (el && !fileInputRef) {
              fileInputRef = el
            }
          }}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* 成功提示 */}
      {showExportSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-earth-500 text-white rounded-full shadow-soft z-50">
        操作成功！
        </div>
      )}

      {/* 错误提示 */}
      {showImportError && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-400 text-white rounded-full shadow-soft z-50">
          数据格式不正确，请重试
        </div>
      )}

      {/* 清空确认对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-soft">
            <h3 className="text-lg font-medium mb-2">确认清空</h3>
            <p className="text-gray-600 mb-6">确定要清空所有数据吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-earth-100 text-gray-700 rounded-full hover:bg-earth-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 bg-red-400 text-white rounded-full hover:bg-red-500 transition-all"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
