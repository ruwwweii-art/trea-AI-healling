import { MicroAction } from '../types';

const actionTypeColors = {
  emotional: 'bg-mood-low',
  mindset: 'bg-mood-mid',
  action: 'bg-mood-high',
};

const actionTypeLabels = {
  emotional: '情绪调节',
  mindset: '思维转换',
  action: '行动导向',
};

interface MicroActionCardProps {
  action: MicroAction;
  onSelect: (action: MicroAction) => void;
}

export default function MicroActionCard({ action, onSelect }: MicroActionCardProps) {
  return (
    <div
      onClick={() => onSelect(action)}
      className={`bg-white rounded-xl p-5 shadow-soft hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 ${actionTypeColors[action.type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{action.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 bg-white/50 rounded-md text-sm font-medium ${actionTypeColors[action.type].replace('bg-', 'text-')}`}>
              {actionTypeLabels[action.type]}
            </span>
            <span className="text-gray-400 text-sm">{action.duration}分钟</span>
          </div>
          <h3 className="text-lg text-gray-700 font-medium mb-1">{action.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';