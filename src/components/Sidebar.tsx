import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useSignOut, useUserData } from '@nhost/react';
import { GET_CHATS, CREATE_CHAT } from '../graphql';
import { Plus, MessageCircle, LogOut, User, X } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { signOut } = useSignOut();
  const userData = useUserData();

  const { data: chatsData, loading } = useQuery(GET_CHATS);
  const [createChat, { loading: creatingChat }] = useMutation(CREATE_CHAT, {
    refetchQueries: [GET_CHATS],
  });

  const handleNewChat = async () => {
    try {
      const result = await createChat();
      if (result.data?.insert_chats_one?.id) {
        navigate(`/chat/${result.data.insert_chats_one.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleChatSelect = (id: string) => {
    navigate(`/chat/${id}`);
    onClose();
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Chatbot</h2>
              <p className="text-gray-400 text-sm">{userData?.displayName || userData?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          disabled={creatingChat}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>{creatingChat ? 'Creating...' : 'New Chat'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Recent Chats</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {chatsData?.chats?.map((chat: any) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200 group
                    ${chatId === chat.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {chat.title || `Chat ${chat.id.slice(0, 8)}`}
                    </span>
                  </div>
                </button>
              ))}
              {(!chatsData?.chats || chatsData.chats.length === 0) && !loading && (
                <p className="text-gray-500 text-sm text-center py-8">
                  No chats yet. Create your first chat to get started!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {userData?.displayName || 'User'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {userData?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;