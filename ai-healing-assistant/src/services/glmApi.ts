// GLM API 配置
const API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 请求接口
interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

// 响应接口
interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 发送聊天请求
export async function sendChatMessage(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (!API_KEY) {
    console.error('GLM API Key not configured');
    return null;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个温暖、专业的AI疗愈助手，专门帮助大学生缓解焦虑和空虚感。你的语气要温柔、理解性强，对话要自然不机械。每次回复要控制在3-5分钟阅读量，避免过度解释。如果遇到无法回答的问题，要诚实地说我不确定，不要编造答案。'
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      } as ChatRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GLM API error:', response.status, errorText);
      return null;
    }

    const data: ChatResponse = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('GLM API request failed:', error);
    // 返回友好的错误消息
    return '抱歉，我现在无法连接到AI服务。请稍后再试，或者检查网络连接。';
  }
}

// 情绪分析（简单的关键词匹配）
export function analyzeEmotion(text: string) {
  const emotionKeywords = {
    anxiety: ['焦虑', '担心', '紧张', '害怕', '不安', '压力', '烦恼'],
    calm: ['平静', '放松', '舒服', '安稳', '宁静', '愉快'],
    low: ['低落', '难过', '抑郁', '沮丧', '伤心', '痛苦'],
    tired: ['疲惫', '累', '疲劳', '困倦', '乏力', '虚弱'],
    happy: ['开心', '高兴', '快乐', '兴奋', '愉快', '欣喜'],
    empty: ['空虚', '寂寞', '无聊', '孤单', '空虚感', '孤独'],
  };

  let matchedEmotion: string | null = null;
  let maxMatchCount = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
    if (matchCount > maxMatchCount) {
      maxMatchCount = matchCount;
      matchedEmotion = emotion;
    }
  }

  return matchedEmotion;
}

// 情绪强度分析（1-5分制）
export function analyzeEmotionIntensity(text: string) {
  const highIntensityWords = ['非常', '特别', '极其', '太', '超级'];
  const mediumIntensityWords = ['比较', '相当', '挺', '有些'];
  const lowIntensityWords = ['有点', '轻微', '稍微', '一般'];

  if (highIntensityWords.some(word => text.includes(word))) {
    return 4;
  } else if (mediumIntensityWords.some(word => text.includes(word))) {
    return 3;
  } else if (lowIntensityWords.some(word => text.includes(word))) {
    return 2;
  } else {
    return 2; // 默认中等强度
  }
}