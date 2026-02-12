import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import CloudinaryImage from '../common/CloudinaryImage';

const ChatList = ({ conversations, activeConversationId, onSelectConversation, currentUser }) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
        <p>Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
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
                : 'Utilisateur inconnu';
                
        const displayAvatar = conversation.type === 'group' 
            ? conversation.avatar 
            : otherParticipant?.avatar;

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${
              isActive ? 'bg-green-50/50 border-l-4 border-l-harvests-green' : 'border-l-4 border-l-transparent'
            }`}
          >
            <div className="relative mr-4">
                {displayAvatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <CloudinaryImage
                            publicId={displayAvatar}
                            alt={displayName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {displayName.charAt(0)}
                    </div>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-harvests-green' : 'text-gray-900'}`}>
                  {displayName}
                </h3>
                {conversation.lastActivity && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: false, locale: fr })}
                  </span>
                )}
              </div>
              <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                {conversation.lastMessage?.sender === currentUser?._id && 'Vous: '}
                {conversation.lastMessage?.content || (conversation.lastMessage?.attachments?.length > 0 ? '📎 Pièce jointe' : 'Nouvelle conversation')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
