import React, { useState } from 'react';
import { User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatMessage = ({ message, isBot, timestamp, messageId, onFeedback, feedbackGiven }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div 
      className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
      onMouseEnter={() => isBot && setShowFeedback(true)}
      onMouseLeave={() => setShowFeedback(false)}
    >
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
        <div className="flex items-center gap-2 mt-1 px-1">
          {timestamp && (
            <span className="text-xs text-gray-400">
              {new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {/* Feedback buttons for bot messages */}
          {isBot && messageId && (showFeedback || feedbackGiven !== undefined) && (
            <div className="flex items-center gap-1">
              {feedbackGiven === undefined ? (
                <>
                  <button
                    onClick={() => onFeedback && onFeedback(messageId, true)}
                    className="p-0.5 text-gray-400 hover:text-green-500 transition-colors"
                    title="Utile"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback && onFeedback(messageId, false)}
                    className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Pas utile"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <span className={`text-xs ${feedbackGiven ? 'text-green-500' : 'text-red-500'}`}>
                  {feedbackGiven ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

