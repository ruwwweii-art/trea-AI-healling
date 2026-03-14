import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { chatCompletion } from '../services/api'
import {
  CHECKIN_CONVERSATION_FLOW,
  MICRO_ACTIONS,
  recommendActions,
  SYSTEM_PROMPT,
  type MicroAction,
} from '../lib/conversation'

export default function CheckIn() {
  const navigate = useNavigate()
  const messages = useAppStore((state) => state.messages)
  const addMessage = useAppStore((state) => state.addMessage)
  const setTyping = useAppStore((state) => state.setTyping)
  const isTyping = useAppStore((state) => state.isTyping)
  const currentStep = useAppStore((state) => state.currentStep)
  const incrementStep = useAppStore((state) => state.incrementStep)
  const clearMessages = useAppStore((state) => state.clearMessages)
  const resetStep = useAppStore((state) => state.resetStep)
  const addMoodRecord = useAppStore((state) => state.addMoodRecord)
  const setLastCheckInDate = useAppStore((state) => state.setLastCheckInDate)

  const [input, setInput] = useState('')
  const [currentMoodType, setCurrentMoodType] = useState<string>('')
  const [showActions, setShowActions] = useState(false)
  const [userResponses, setUserResponses] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 初始化对话
  useEffect(() => {
    if (messages.length === 0) {
      const firstQuestion = CHECKIN_CONVERSATION_FLOW[0]
      addMessage('assistant', firstQuestion.question)
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // 获取当前步骤的快捷回复选项
  const currentFlowStep = CHECKIN_CONVERSATION_FLOW[currentStep]
  const quickReplies = currentFlowStep?.options || []

  const handleQuickReply = (text: string) => {
    setInput(text)
    // 自动发送快捷回复
    setTimeout(() => handleSend(), 100)
  }

  const handleSend = async () => {
    if (!input.trim()) return

    // 记录用户回复
    const newResponses = [...userResponses, input]
    setUserResponses(newResponses)

    // 添加用户消息
    addMessage('user', input)
    setInput('')

    // 保存第一个回复作为情绪类型
    if (currentMoodType === '' && currentStep === 0) {
      setCurrentMoodType(input)
    }

    // 检查是否结束对话流程
    if (currentStep >= CHECKIN_CONVERSATION_FLOW.length - 1) {
      // 结束对话，显示微行动建议
      await endConversation(newResponses)
      return
    }

    // AI回复
    await getAIResponse(input, currentMoodType, newResponses)
  }

  const getAIResponse = async (userInput: string, moodType: string, responses: string[]) => {
    setTyping(true)

    try {
      // 构建上下文消息
      const contextMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.slice(-10).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: userInput },
      ]

      // 调用AI
      const response = await chatCompletion({ messages: contextMessages })

      // 添加AI回复
      addMessage('assistant', response)
      incrementStep()
    } catch (error) {
      console.error('AI response error:', error)

      // API调用失败时使用预设回复
      const nextStep = CHECKIN_CONVERSATION_FLOW[currentStep + 1]
      if (nextStep && nextStep.followUp) {
        // 替换占位符
        let followUp = nextStep.followUp.replace('{answer}', responses[0] || '')
        addMessage('assistant', followUp)
        incrementStep()
      }
    } finally {
      setTyping(false)
    }
  }

  const endConversation = async (responses: string[]) => {
    setTyping(true)

    // 保存情绪记录
    if (currentMoodType) {
      const moodScore = getMoodScore(currentMoodType)
      addMoodRecord({
        date: new Date().toISOString(),
        moodType: currentMoodType,
        moodScore,
        keywords: [responses[0] || currentMoodType],
        notes: responses.slice(1).join(' | '),
      })
      setLastCheckInDate(new Date().toISOString())
    }

    // 显示微行动建议
    setTimeout(() => {
      const actions = recommendActions(currentMoodType)
      let actionText = '谢谢你愿意分享。根据你今天的情况，我为你推荐以下小行动：\n\n'
      actions.slice(0, 2).forEach((action, index) => {
        actionText += `${index + 1}. ${action.icon} ${action.title}\n   ${action.description}\n`
      })
      actionText += '\n试试看吧，哪怕只是花几分钟，也会让你感觉好一些。'

      addMessage('assistant', actionText)
      setShowActions(true)
      setTyping(false)
    }, 1000)
  }

  const getMoodScore = (moodType: string): number => {
    const scores: Record<string, number> = {
      开心: 6,
      平静: 5,
      焦虑: 2,
      低落: 2,
      疲惫: 3,
    }
    return scores[moodType] || 4
  }

  const handleActionClick = (action: MicroAction) => {
    // 记录行动完成
    addMessage('user', `我试试"${action.title}"`)
    addMessage('assistant', `很好的选择！${action.description}，记得给自己一点时间，慢慢来。`)
    setShowActions(false)
  }

  const startNewCheckIn = () => {
    clearMessages()
    resetStep()
    setCurrentMoodType('')
    setShowActions(false)
    setUserResponses([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <header className="p-4 border-b border-earth-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-medium">情绪签到</h1>
          <button
            onClick={startNewCheckIn}
            className="text-sm text-earth-600 hover:text-earth-700"
          >
            重新开始
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-chat shadow-soft ${
                msg.role === 'user'
                  ? 'bg-cream-500'
                  : 'bg-misty-500'
              }`}
            >
              <p className="text-base leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-misty-500 px-4 py-3 rounded-chat shadow-soft">
              <p className="text-gray-500">对方正在输入...</p>
            </div>
          </div>
        )}

        {/* 微行动建议 */}
        {showActions && (
          <div className="bg-white rounded-2xl p-4 shadow-soft space-y-3">
            <h3 className="text-sm font-medium text-gray-600 mb-3">试试这些行动</h3>
            {recommendActions(currentMoodType).slice(0, 2).map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="w-full p-3 bg-cream-100 rounded-xl hover:bg-cream-200 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <p className="text-xs text-earth-600 mt-1">{action.duration}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!showActions && (
        <div className="p-4 border-t border-earth-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto space-y-3">
            {/* 快捷回复 */}
            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 bg-earth-100 text-gray-700 rounded-full text-sm hover:bg-earth-200 transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="轻轻告诉我..."
                className="flex-1 px-4 py-3 rounded-full bg-white shadow-soft focus:outline-none focus:ring-2 focus:ring-earth-300"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-earth-500 text-white rounded-full shadow-soft disabled:opacity-50 disabled:cursor-not-allowed hover:bg-earth-600 transition-all"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
