import { useState } from 'react';

function ChatInput({ onSend, placeholder = "轻轻告诉我，今天感觉怎么样..." }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-4 p-6">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 rounded-full px-8 py-4 shadow-card bg-warm-white text-base outline-none border-2 border-warm-gray-200 focus:border-gentle-blue focus:border-2 focus:ring-4 focus:ring-gentle-blue/20 transition-all placeholder:text-gray-400"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="px-8 py-4 rounded-full bg-gentle-blue-100 hover:bg-gentle-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium transition-all shadow-button disabled:shadow-none"
      >
        发送
      </button>
    </div>
  );
}

export default ChatInput;