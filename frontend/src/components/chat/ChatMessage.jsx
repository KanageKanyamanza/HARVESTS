import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isBot, timestamp }) => {
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      
      {/* Message */}
      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} max-w-[80%]`}>
        <div className={`px-4 py-2 rounded-2xl whitespace-pre-wrap text-sm ${
          isBot 
            ? 'bg-gray-100 text-gray-800 rounded-tl-none' 
            : 'bg-green-600 text-white rounded-tr-none'
        }`}>
          {message}
        </div>
        {timestamp && (
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

