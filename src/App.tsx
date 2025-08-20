import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  useAuthenticationStatus, 
  useSignInEmailPassword, 
  useSignUpEmailPassword, 
  useSignOut
} from '@nhost/react';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  LogOut, 
  Mail, 
  Lock, 
  User, 
  Loader2 
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { notify } from './lib/notifications';
import { 
  GET_CHATS, 
  CREATE_CHAT,
  GET_MESSAGES_FOR_CHAT, 
  INSERT_USER_MESSAGE, 
  SEND_MESSAGE_TO_BOT
} from './graphql';

// TypeScript interfaces
interface Chat {
  id: string;
  title?: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  chat_id: string;
}

interface ChatListProps {
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

interface MessageWindowProps {
  activeChatId: string | null;
}

// Main App Component - Handles authentication flow
function App(): JSX.Element {
  const { isLoading, isAuthenticated, error } = useAuthenticationStatus();

  console.log('🔍 Auth Status Debug:', { 
    isLoading, 
    isAuthenticated, 
    error: error?.message || 'No error',
    timestamp: new Date().toISOString()
  });

  // Show connection error with helpful instructions
  if (error) {
    console.error('❌ Nhost Connection Error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-red-600 text-xl font-semibold mb-3">Connection Error</h2>
          <p className="text-gray-600 text-sm mb-4">
            Unable to connect to Vartalap backend. This could be due to:
          </p>
          <ul className="text-gray-500 text-xs mb-6 text-left space-y-1">
            <li>• Nhost project is not active</li>
            <li>• Incorrect subdomain or region</li>
            <li>• CORS configuration issues</li>
            <li>• Network connectivity problems</li>
          </ul>
          <p className="text-gray-400 text-xs mb-6 p-3 bg-gray-50 rounded-lg">
            Error: {error.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Connecting to Vartalap</h3>
            <p className="text-sm text-gray-600">Please wait while we establish connection...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main app. Authenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-900">
      {isAuthenticated ? <ChatInterface /> : <AuthComponent />}
      <Toaster />
    </div>
  );
}

// Authentication Component
function AuthComponent(): JSX.Element {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  const { signInEmailPassword, isLoading: isSigningIn, error: signInError } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: isSigningUp, error: signUpError } = useSignUpEmailPassword();

  const isLoading = isSigningIn || isSigningUp;
  const error = signInError || signUpError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const loadingToast = notify.loading(isSignUp ? 'Creating account...' : 'Signing in...');
    
    try {
      if (isSignUp) {
        const result = await signUpEmailPassword(email, password, {
          displayName,
        });
        notify.dismiss(loadingToast);
        if (result.error) {
          notify.error(result.error.message || 'Registration failed');
        } else {
          notify.success('Account created successfully! Please check your email to verify.');
        }
      } else {
        const result = await signInEmailPassword(email, password);
        notify.dismiss(loadingToast);
        if (result.error) {
          notify.error(result.error.message || 'Sign in failed');
        } else {
          notify.success('Welcome back! Signed in successfully.');
        }
      }
    } catch (err) {
      notify.dismiss(loadingToast);
      notify.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-200 backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vartalap</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your display name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-red-700 text-sm font-medium">{error.message}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail('');
              setPassword('');
              setDisplayName('');
            }}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// Chat Interface Component
function ChatInterface(): JSX.Element {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { signOut } = useSignOut();

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Vartalap</h2>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1">
          <ChatList activeChatId={activeChatId} onChatSelect={setActiveChatId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChatId ? (
          <MessageWindow activeChatId={activeChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Vartalap
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your intelligent conversation partner. Start a conversation to explore ideas, get assistance, and unlock the power of AI.
              </p>
              <div className="grid gap-3 text-left">
                <div className="flex items-center space-x-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Ask questions about any topic</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Get instant, intelligent responses</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 font-medium">Organize conversations in separate chats</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Chat List Component
function ChatList({ activeChatId, onChatSelect }: ChatListProps): JSX.Element {
  const { data, loading } = useQuery<{ chats: Chat[] }>(GET_CHATS);
  
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
    onCompleted: (data) => {
      if (data?.insert_chats_one?.id) {
        onChatSelect(data.insert_chats_one.id);
      }
    }
  });

  const handleNewChat = async () => {
    try {
      const defaultTitle = `Chat ${new Date().toLocaleString()}`;
      console.log('📱 Creating new chat with title:', defaultTitle);
      
      const result = await createChat({
        variables: {
          title: defaultTitle
        }
      });
      
      console.log('✅ Chat created successfully:', result);
    } catch (error) {
      console.error('❌ Error creating chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          disabled={creating}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {creating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>{creating ? 'Creating...' : 'New Chat'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4">
        {data?.chats?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No conversations yet</p>
            <p className="text-sm text-gray-500 mt-1">Start your first chat with Vartalap</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.chats?.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                  activeChatId === chat.id
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activeChatId === chat.id ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {chat.title || `Chat ${chat.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Message Window Component
function MessageWindow({ activeChatId }: MessageWindowProps): JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data: messagesData, loading } = useSubscription<{ messages: Message[] }>(GET_MESSAGES_FOR_CHAT, {
    variables: { chat_id: activeChatId },
    skip: !activeChatId
  });

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesData?.messages]);

  const [insertUserMessage] = useMutation(INSERT_USER_MESSAGE);
  const [sendMessageToBot] = useMutation(SEND_MESSAGE_TO_BOT);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId || sending) return;

    const messageContent = message.trim();
    setSending(true);

    console.log('💬 Sending message:', { activeChatId, messageContent });

    try {
      // Clear the input immediately when starting to send
      setMessage('');
      
      // Focus back to input for better UX
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Step 1: Insert user message
      console.log('📝 Inserting user message...');
      const userMessageResult = await insertUserMessage({
        variables: {
          chat_id: activeChatId,
          content: messageContent
        }
      });
      console.log('✅ User message inserted:', userMessageResult);

      // Step 2: Send message to bot
      console.log('🤖 Sending to bot...');
      const botResult = await sendMessageToBot({
        variables: {
          chat_id: activeChatId,
          message: messageContent
        }
      });
      console.log('✅ Bot response:', botResult);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Only restore message on error if it's critical
      setMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Welcome to Vartalap</h3>
          <p>Select a chat from the sidebar or create a new one to start your conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Vartalap AI</h2>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-blue-50/30">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-gray-600">Loading messages...</span>
            </div>
          </div>
        ) : messagesData?.messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Start your conversation</h3>
              <p className="text-gray-600">Ask me anything! I'm here to help with questions, tasks, and creative projects.</p>
            </div>
          </div>
        ) : (
          messagesData?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <MessageCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Message */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-gray-600">Vartalap is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4 max-w-4xl mx-auto">
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Type your message here..."
                disabled={sending}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none shadow-sm hover:shadow-md transition-shadow"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  title="Send message"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;