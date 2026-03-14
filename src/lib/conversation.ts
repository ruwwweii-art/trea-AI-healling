/**
 * 对话流程配置
 * 按照PRD模块7设计的结构化对话
 */

export interface ConversationStep {
  id: string
  question: string
  type: 'open' | 'choice' | 'rating'
  options?: string[]
  followUp?: string
}

export const CHECKIN_CONVERSATION_FLOW: ConversationStep[] = [
  {
    id: 'opening',
    question: '今天感觉怎么样？用1-2个词形容一下',
    type: 'choice',
    options: ['平静', '焦虑', '低落', '疲惫', '开心'],
    followUp: '听起来你是{answer}，是因为发生了什么吗？',
  },
  {
    id: 'explore_reason',
    question: '',
    type: 'open',
    followUp: '这种感觉是从什么时候开始的？今天还是之前就有了？',
  },
  {
    id: 'duration',
    question: '',
    type: 'open',
    followUp: '这个情绪对你今天的影响大吗？（影响很大/一般/基本不影响）',
  },
  {
    id: 'impact',
    question: '',
    type: 'choice',
    options: ['影响很大', '一般', '基本不影响'],
    followUp: '面对这种感觉，你今天最需要什么？（倾听/建议/具体的行动）',
  },
  {
    id: 'need',
    question: '',
    type: 'choice',
    options: ['倾听', '建议', '具体的行动'],
    followUp: '有没有什么特别让你困扰或者纠结的事情？',
  },
  {
    id: 'concern',
    question: '',
    type: 'open',
    followUp: '谢谢你愿意分享。根据你今天的情况，我有一个小建议...',
  },
]

/**
 * 微行动库
 */
export interface MicroAction {
  id: string
  title: string
  description: string
  icon: string
  duration: string
  category: 'emotional' | 'mindset' | 'action'
}

export const MICRO_ACTIONS: MicroAction[] = [
  // 情绪调节类
  {
    id: 'breathing',
    title: '3分钟呼吸练习',
    description: '4-7-8呼吸法，专注呼吸节奏',
    icon: '💡',
    duration: '3分钟',
    category: 'emotional',
  },
  {
    id: 'music',
    title: '听一首疗愈音乐',
    description: '推荐平静风格的3-5分钟音乐',
    icon: '🎵',
    duration: '3-5分钟',
    category: 'emotional',
  },
  {
    id: 'water',
    title: '喝一杯温水',
    description: '慢下来，感受温度和味道',
    icon: '☕',
    duration: '2分钟',
    category: 'emotional',
  },
  // 思维转换类
  {
    id: 'gratitude',
    title: '写下三件值得感恩的事',
    description: '转移注意力到积极面',
    icon: '📝',
    duration: '5分钟',
    category: 'mindset',
  },
  {
    id: 'walk',
    title: '到阳台散步5分钟',
    description: '换个环境，转换心情',
    icon: '🚶',
    duration: '5分钟',
    category: 'mindset',
  },
  {
    id: 'photo',
    title: '拍一张窗外的照片',
    description: '关注生活中的小美好',
    icon: '🌅',
    duration: '2分钟',
    category: 'mindset',
  },
  // 行动导向类
  {
    id: 'read',
    title: '读5页轻松的书',
    description: '转移注意力，减少焦虑循环',
    icon: '📚',
    duration: '10分钟',
    category: 'action',
  },
  {
    id: 'friend',
    title: '主动问候一个朋友',
    description: '建立真实连接，缓解孤独',
    icon: '🤝',
    duration: '5分钟',
    category: 'action',
  },
  {
    id: 'stretch',
    title: '做10个简单的拉伸动作',
    description: '身体放松带动心理放松',
    icon: '🏃',
    duration: '3分钟',
    category: 'action',
  },
]

/**
 * 根据情绪类型推荐微行动
 */
export function recommendActions(moodType: string): MicroAction[] {
  const moodActions: Record<string, MicroAction[]> = {
    焦虑: [
      MICRO_ACTIONS.find(a => a.id === 'breathing')!,
      MICRO_ACTIONS.find(a => a.id === 'read')!,
      MICRO_ACTIONS.find(a => a.id === 'stretch')!,
    ],
    低落: [
      MICRO_ACTIONS.find(a => a.id === 'gratitude')!,
      MICRO_ACTIONS.find(a => a.id === 'photo')!,
      MICRO_ACTIONS.find(a => a.id === 'music')!,
    ],
    疲惫: [
      MICRO_ACTIONS.find(a => a.id === 'breathing')!,
      MICRO_ACTIONS.find(a => a.id === 'water')!,
      MICRO_ACTIONS.find(a => a.id === 'stretch')!,
    ],
    开心: [
      MICRO_ACTIONS.find(a => a.id === 'photo')!,
      MICRO_ACTIONS.find(a => a.id === 'walk')!,
      MICRO_ACTIONS.find(a => a.id === 'friend')!,
    ],
    平静: [
      MICRO_ACTIONS.find(a => a.id === 'walk')!,
      MICRO_ACTIONS.find(a => a.id === 'music')!,
      MICRO_ACTIONS.find(a => a.id === 'read')!,
    ],
  }

  return moodActions[moodType] || [
    MICRO_ACTIONS.find(a => a.id === 'breathing')!,
    MICRO_ACTIONS.find(a => a.id === 'gratitude')!,
  ]
}

/**
 * 系统提示词
 */
export const SYSTEM_PROMPT = `你是AI疗愈助手，帮助大学生缓解焦虑和空虚感。

你的目标：
1. 倾听用户的心声，给予温暖的支持
2. 帮助用户识别和理解自己的情绪
3. 在适当的时候给出具体、可执行的微行动建议

对话原则：
- 温柔、有耐心，不评判
- 保持真诚，像朋友一样交流
- 避免说教，多用共情
- 当用户表达极端情绪时，给予温柔的建议，并提醒寻求专业帮助
- 每次对话控制在3-5分钟内，引导用户结束对话并开始行动

重要：你不是专业心理治疗师，如果用户情绪状态很严重，要建议寻求专业帮助。`
