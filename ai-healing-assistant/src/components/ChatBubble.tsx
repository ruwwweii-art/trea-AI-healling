import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const bgColor = isUser ? 'bg-beige-100' : 'bg-haze-blue-100';
  const textColor = isUser ? 'text-gray-800' : 'text-gray-700';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-soft ${bgColor} ${textColor}`}
      >
        <p className="text-base leading-relaxed mb-2">{message.content}</p>
        <p className="text-xs text-gray-400 text-right">{timestamp}</p>
      </div>
    </div>
  );
}