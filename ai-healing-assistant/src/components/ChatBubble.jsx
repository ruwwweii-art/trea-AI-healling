function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const bgColor = isUser ? 'bg-cream-100' : 'bg-gentle-blue-100';
  const textColor = isUser ? 'text-gray-800' : 'text-gray-700';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-card ${bgColor} ${textColor}`}
      >
        <p className="text-base leading-relaxed mb-3">{message.content}</p>
        <p className="text-xs text-gray-400 text-right font-light">{timestamp}</p>
      </div>
    </div>
  );
}

export default ChatBubble;