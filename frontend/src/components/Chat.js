
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ courseId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat history when component mounts
  useEffect(() => {
    if (courseId) {
      fetchChatHistory();
    }
  }, [courseId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat-history/by_course/?course_id=${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here once auth is set up
        }
      });
      
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(), // temporary ID
      message: inputMessage,
      is_user_message: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await axios.post('/api/chat-history/', {
        course: courseId,
        message: inputMessage,
        is_user_message: true,
        context_data: {} // Optional context data
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here once auth is set up
        }
      });

      // Once we get a response, update the messages
      if (response.data) {
        // Update messages with the server response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== userMessage.id), // Remove temporary message
          response.data // Add the server-generated message with real ID
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in UI
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          message: 'Sorry, there was an error sending your message. Please try again.',
          is_user_message: false,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.is_user_message ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {msg.message}
            </div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
