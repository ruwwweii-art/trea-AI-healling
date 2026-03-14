import { useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { sendChatMessage } from '../services/glmApi';
import { emotionCheckinService } from '../services/emotionService';
import { createEmotionRecord } from '../services/supabaseService';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: '轻轻告诉我，今天感觉怎么样？用1-2个词形容一下',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSendMessage = async (content) => {
    if (isLoading || isComplete) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    const result = emotionCheckinService.processUserInput(content);

    if (result.aiResponse) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);

      if (result.isComplete) {
        setIsComplete(true);

        try {
          await createEmotionRecord({
            date: new Date(),
            score: result.emotionData.score,
            type: result.emotionData.type,
            keywords: result.emotionData.keywords,
            intensity: result.emotionData.intensity,
            trigger: result.emotionData.trigger,
            action: result.aiResponse || '',
          });
        } catch (error) {
          console.error('Failed to save emotion record:', error);
        }

        setTimeout(() => {
          const finalMessage = {
            id: (Date.now() + 3).toString(),
            role: 'assistant',
            content: result.aiResponse || '',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, finalMessage]);
        }, 1000);
      }
    } else {
      setTimeout(async () => {
        const conversationHistory = messages.slice(1).map(m => ({
          role: m.role,
          content: m.content,
        }));

        const aiContent = await sendChatMessage([
          ...conversationHistory,
          { role: 'user', content },
        ]);

        if (aiContent) {
          const aiMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: aiContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);

          const processResult = emotionCheckinService.processUserInput('');
          if (processResult.isComplete) {
            setIsComplete(true);

            try {
              await createEmotionRecord({
                date: new Date(),
                score: processResult.emotionData.score,
                type: processResult.emotionData.type,
                keywords: processResult.emotionData.keywords,
                intensity: processResult.emotionData.intensity,
                trigger: processResult.emotionData.trigger,
                action: processResult.aiResponse || '',
              });
            } catch (error) {
              console.error('Failed to save emotion record:', error);
            }

            setTimeout(() => {
              const finalMessage = {
                id: (Date.now() + 3).toString(),
                role: 'assistant',
                content: processResult.aiResponse || '',
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, finalMessage]);
            }, 1000);
          }
        } else {
          const errorMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: '抱歉，AI服务暂时无法响应。请稍后再试，或者检查你的网络连接。',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsComplete(false);
        }

        setIsLoading(false);
      }, 500);
    }
  };

  const handleStartNewCheckin = () => {
    emotionCheckinService.reset();
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: '轻轻告诉我，今天感觉怎么样？用1-2个词形容一下',
        timestamp: new Date(),
      },
    ]);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-warm-gray-50">
      {/* 头部 */}
      <div className="bg-warm-white shadow-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-medium text-gray-700">AI疗愈助手</h1>
          {isComplete && (
            <button
              onClick={handleStartNewCheckin}
              className="px-6 py-2.5 rounded-full bg-mood-high text-warm-white hover:bg-mood-high/90 transition-all shadow-button hover:shadow-glow"
            >
              开始新的签到
            </button>
          )}
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-h-[calc(100vh-220px)]">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gentle-blue-50/80 rounded-2xl px-6 py-4 shadow-card animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-gentle-blue border-t-transparent rounded-full animate-pulse-gentle"></div>
                  <span className="text-gray-500 text-base">正在思考...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-warm-white shadow-floating px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            placeholder={isComplete ? "今天感觉怎么样？开始新的情绪签到..." : "轻轻告诉我，今天感觉怎么样..."}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}