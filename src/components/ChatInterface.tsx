import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';
import { Menu, X } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthenticationStatus();

  // Safety check - redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Please sign in to continue</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 h-full bg-gray-800 border-r border-gray-700 z-50
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <Routes>
          <Route path="/" element={<ChatRoom />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
        </Routes>
      </div>
    </div>
  );
};

export default ChatInterface;