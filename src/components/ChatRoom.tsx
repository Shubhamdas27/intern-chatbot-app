import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubscription, useMutation } from '@apollo/client';
import { GET_MESSAGES_FOR_CHAT, INSERT_USER_MESSAGE, SEND_MESSAGE_TO_BOT } from '../graphql';
import MessageBubble from './MessageBubble';
import { Send, Bot } from 'lucide-react';

const ChatRoom: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData } = useSubscription(GET_MESSAGES_FOR_CHAT, {
    variables: { chat_id: chatId },
    skip: !chatId,
  });

  const [insertUserMessage] = useMutation(INSERT_USER_MESSAGE);
  const [sendMessageToBot] = useMutation(SEND_MESSAGE_TO_BOT);

  const messages = messagesData?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      // Step 1: Insert user message
      await insertUserMessage({
        variables: {
          chat_id: chatId,
          content: userMessage,
        },
      });

      // Step 2: Send message to bot
      await sendMessageToBot({
        variables: {
          chat_id: chatId,
          message: userMessage,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to AI Chatbot</h2>
          <p className="text-gray-400 mb-6">Start a new conversation or select an existing chat</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            role={msg.role}
          />
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce bounce-delay-0"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce bounce-delay-1"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce bounce-delay-2"></div>
            </div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            title="Send message"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;