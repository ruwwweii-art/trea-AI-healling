import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useAppStore } from '../store'

dayjs.locale('zh-cn')

export default function Home() {
  const navigate = useNavigate()
  const moodRecords = useAppStore((state) => state.moodRecords)

  // 计算连续签到天数
  const stats = useMemo(() => {
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
        break
      }
    }

    // 计算使用天数（从第一次签到开始）
    const totalDays = moodRecords.length > 0
      ? dayjs().diff(dayjs(moodRecords[0].date), 'day') + 1
      : 0

    return { streak, totalDays }
  }, [moodRecords])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-earth-200 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-misty-200 rounded-full opacity-30 blur-3xl"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-earth-200 to-earth-300 rounded-full flex items-center justify-center shadow-soft">
            <span className="text-5xl">🌱</span>
          </div>
          <h1 className="text-3xl font-medium text-gray-800">AI疗愈助手</h1>
          <p className="text-gray-600 leading-relaxed px-8">
            轻轻告诉我，今天感觉怎么样...
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => navigate('/checkin')}
            className="btn-primary w-full text-lg"
          >
            开始情绪签到
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary w-full text-lg"
          >
            查看情绪记录
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-full px-6 py-3 text-earth-600 hover:text-earth-700 transition-all"
          >
            个人中心
          </button>
        </div>

        <div className="pt-6 space-y-2 text-sm text-gray-400">
          <p>
            {stats.streak > 0 ? `已连续签到 ${stats.streak} 天` : '还没有签到记录'}
          </p>
          <p>
            {stats.totalDays > 0 ? `今天是你与 AI 相伴的第 ${stats.totalDays} 天` : '开始你的第一次情绪签到吧'}
          </p>
        </div>
      </div>
    </div>
  )
}
