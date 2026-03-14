interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export default function ChatInput({ onSend, placeholder = "轻轻告诉我，今天感觉怎么样..." }: ChatInputProps) {
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 p-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 rounded-2xl px-5 py-3 shadow-soft bg-white text-base outline-none focus:ring-2 focus:ring-haze-blue-200 transition-all"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="px-6 py-3 rounded-2xl bg-haze-blue-100 text-gray-700 hover:bg-haze-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        发送
      </button>
    </div>
  );
}

import React from 'react';