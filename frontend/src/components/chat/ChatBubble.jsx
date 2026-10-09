import React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '../../utils/i18n';
import { Check, CheckCheck } from 'lucide-react';
import CloudinaryImage from '../common/CloudinaryImage';

const ChatBubble = ({ message, isOwn, showAvatar, sender }) => {
  const { t, i18n } = useTranslation('common');
  const time = format(new Date(message.createdAt), 'HH:mm', { locale: getDateFnsLocale(i18n.language) });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-3 self-end">
             {sender?.avatar ? (
                <div className="w-8 h-8 rounded-xl overflow-hidden">
                    <CloudinaryImage
                        publicId={sender.avatar}
                        alt={`${sender.firstName} ${sender.lastName}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs font-bold">
                    {sender?.firstName?.charAt(0)}
                </div>
            )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-11" />} {/* Spacer */}

      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 rounded-[1.25rem] text-sm leading-relaxed relative ${
            isOwn
              ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-br-md shadow-md shadow-emerald-900/10'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-sm'
          }`}
        >
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          
          {/* Pièces jointes (images) */}
          {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                  {message.attachments.map((att, idx) => (
                      att.type === 'image' && (
                          <div key={idx} className="rounded-lg overflow-hidden max-w-[200px]">
                              <img src={att.url} alt={t('messaging.attachmentAlt')} className="w-full h-auto" />
                          </div>
                      )
                  ))}
              </div>
          )}

          <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
            isOwn ? 'text-emerald-50/80' : 'text-gray-400'
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
