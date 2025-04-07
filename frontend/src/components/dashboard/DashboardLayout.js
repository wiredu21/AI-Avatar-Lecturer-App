import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// This component provides a consistent layout for all dashboard pages
const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current path to highlight active menu item
  const currentPath = location.pathname;
  
  // Check if a path is active
  const isActive = (path) => {
    return currentPath === path;
  };

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isFirstTimeLogin');
    localStorage.removeItem('userProfile');
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="bg-teal-500 text-white w-64 min-h-screen flex flex-col">
          <div className="p-4 border-b border-teal-600">
            <h1 className="text-xl font-bold">VirtuAId</h1>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/dashboard') 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-teal-600 transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/chat" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/dashboard/chat') 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-teal-600 transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>AI Chat</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/courses" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/dashboard/courses') 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-teal-600 transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span>Courses & Materials</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/insights" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/dashboard/insights') 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-teal-600 transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="6" height="20"></rect>
                    <rect x="10" y="10" width="6" height="12"></rect>
                    <rect x="18" y="4" width="6" height="18"></rect>
                  </svg>
                  <span>Learning Insights</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard/settings" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/dashboard/settings') 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-teal-600 transition-colors'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="p-4 border-t border-teal-600">
            <button 
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg hover:bg-teal-600 transition-colors w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 