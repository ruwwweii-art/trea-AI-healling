/**
 * 智谱GLM API调用服务
 */

const GLM_API_KEY = import.meta.env.VITE_GLM_API_KEY || ''
const GLM_API_URL = import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

/**
 * 调用智谱GLM聊天API
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<string> {
  if (!GLM_API_KEY) {
    throw new Error('GLM_API_KEY not configured')
  }

  try {
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 500,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GLM API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    console.error('Chat completion error:', error)
    throw error
  }
}
