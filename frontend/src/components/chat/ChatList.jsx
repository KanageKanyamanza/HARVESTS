import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '../../utils/i18n';
import CloudinaryImage from '../common/CloudinaryImage';

const ChatList = ({ conversations, activeConversationId, onSelectConversation, currentUser }) => {
  const { t, i18n } = useTranslation('common');
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-gray-500 p-6 text-center">
        <p className="text-sm font-medium">{t('messaging.noConversations')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {conversations.map((conversation) => {
        // Trouver l'autre participant pour les conversations directes
        const otherParticipant = conversation.participants.find(
          (p) => p.user?._id !== currentUser?._id
        )?.user;

        const isActive = activeConversationId === conversation._id;
        const unreadCount = conversation.unreadCount || 0;
        
        // Nom et avatar à afficher
        const displayName = conversation.type === 'group' 
            ? conversation.title 
            : otherParticipant 
                ? `${otherParticipant.firstName} ${otherParticipant.lastName}` 
                : t('messaging.unknownUser');
                
        const displayAvatar = conversation.type === 'group' 
            ? conversation.avatar 
            : otherParticipant?.avatar;

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all ${
              isActive
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50/60 ring-1 ring-emerald-100 shadow-sm'
                : 'hover:bg-gray-50/80'
            }`}
          >
            <div className="relative mr-3">
                {displayAvatar ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden">
                        <CloudinaryImage
                            publicId={displayAvatar}
                            alt={displayName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black shadow-sm">
                        {displayName.charAt(0)}
                    </div>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-sm font-black tracking-tight truncate ${isActive ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {displayName}
                </h3>
                {conversation.lastActivity && (
                  <span className="text-[10px] font-bold text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: false, locale: getDateFnsLocale(i18n.language) })}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-gray-800' : 'font-medium text-gray-500'}`}>
                {conversation.lastMessage?.sender === currentUser?._id && t('messaging.you')}
                {conversation.lastMessage?.content || (conversation.lastMessage?.attachments?.length > 0 ? t('messaging.attachment') : t('messaging.newConversation'))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
