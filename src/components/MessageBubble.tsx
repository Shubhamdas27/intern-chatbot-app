import React from 'react';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ content, role }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-3xl`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
            : 'bg-gray-600'
          }
        `}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message bubble */}
        <div className={`
          px-4 py-3 rounded-2xl shadow-lg
          ${isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-gray-700 text-gray-100'
          }
          ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;