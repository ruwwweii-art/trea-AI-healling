import { useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { ChatMessage } from '../types';
import { mockChatMessages } from '../utils/mockData';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);

    // 模拟 AI 响应
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '谢谢你愿意分享。根据你今天的情况，我有一个小建议...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige-50 to-warm-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl text-gray-700 font-medium">AI疗愈助手</h1>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[calc(100vh-200px)]">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>

      {/* 输入区域 */}
      <div className="bg-white shadow-soft">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}