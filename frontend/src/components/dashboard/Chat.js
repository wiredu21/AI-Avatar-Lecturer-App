import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const Chat = () => {
  const messagesEndRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversations, setConversations] = useState([
    { id: 1, title: 'Object-Oriented Programming', date: 'Today' },
    { id: 2, title: 'Database Normalization', date: 'Yesterday' },
    { id: 3, title: 'Web Development Frameworks', date: '3 days ago' },
  ]);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', content: 'Hello! I\'m your AI learning assistant. How can I help you today?', timestamp: '10:30 AM' },
  ]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, userMessage]);
    setCurrentMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        content: `I understand you're asking about "${currentMessage}". Let me provide some information on that topic...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const startNewConversation = () => {
    setMessages([
      { id: 1, sender: 'ai', content: 'Hello! I\'m your AI learning assistant. How can I help you today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="bg-white w-64 flex flex-col border-r overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-teal-500">Chat History</h1>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={startNewConversation}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conversation => (
              <div 
                key={conversation.id} 
                className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <div>
                    <h3 className="font-medium truncate">{conversation.title}</h3>
                    <p className="text-xs text-gray-500">{conversation.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Back to Dashboard Link */}
          <div className="p-4 border-t">
            <Link 
              to="/dashboard"
              className="w-full flex items-center justify-center text-gray-600 hover:text-teal-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                <span className="text-teal-500 font-bold">AI</span>
              </div>
              <div>
                <h2 className="font-medium">VirtuAId Assistant</h2>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-teal-500 text-white rounded-br-none' 
                        : 'bg-white border rounded-bl-none'
                    }`}
                  >
                    {message.content}
                    <div 
                      className={`text-xs ${
                        message.sender === 'user' ? 'text-teal-200' : 'text-gray-500'
                      } mt-1 text-right`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
            <div className="flex items-center">
              <button 
                type="button"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="13" x2="15" y2="13"></line>
                  <line x1="9" y1="17" x2="15" y2="17"></line>
                </svg>
              </button>
              
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
              />
              
              <button 
                type="submit"
                className="ml-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"
                disabled={!currentMessage.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 