import React from 'react';
import { useRouter } from 'next/router';
import { FaSignOutAlt, FaHome, FaUserTie } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

const AgentLayout = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Redirect if not agent
  if (user && user.role !== 'agent') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Agent Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white py-4 shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/agent" className="text-2xl font-bold text-black cursor-pointer">IMMIZA</a>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-sm text-gray-500 mr-2">
                  Welcome, <span className="font-medium text-gray-900">{user?.username}</span>
                </div>
                <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">
                  Agent
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 font-medium flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
              >
                <FaSignOutAlt className="mr-2 text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default AgentLayout;
