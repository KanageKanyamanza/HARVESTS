import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import CloudinaryImage from '../common/CloudinaryImage';

const ChatBubble = ({ message, isOwn, showAvatar, sender }) => {
  const time = format(new Date(message.createdAt), 'HH:mm', { locale: fr });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-3 self-end">
             {sender?.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    <CloudinaryImage
                        publicId={sender.avatar}
                        alt={`${sender.firstName} ${sender.lastName}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-8 h-8 rounded-full bg-harvests-green text-white flex items-center justify-center text-xs font-bold">
                    {sender?.firstName?.charAt(0)}
                </div>
            )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-11" />} {/* Spacer */}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm relative shadow-sm ${
            isOwn
              ? 'bg-harvests-green text-white rounded-br-none'
              : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
          }`}
        >
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          
          {/* Pièces jointes (images) */}
          {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                  {message.attachments.map((att, idx) => (
                      att.type === 'image' && (
                          <div key={idx} className="rounded-lg overflow-hidden max-w-[200px]">
                              <img src={att.url} alt="attachment" className="w-full h-auto" />
                          </div>
                      )
                  ))}
              </div>
          )}

          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
            isOwn ? 'text-green-100' : 'text-gray-400'
          }`}>
            <span>{time}</span>
            {isOwn && (
              <span>
                {message.status === 'read' ? (
                  <CheckCheck size={14} className="text-blue-200" />
                ) : (
                  <Check size={14} />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
