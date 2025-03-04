
import React, { useState } from 'react';
import './App.css';
import Chat from './components/Chat';

function App() {
  // Mock state - would come from authentication and course selection in a real app
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userId, setUserId] = useState(1); // Mock user ID
  
  // Mock courses - would come from API in a real app
  const courses = [
    { id: 1, code: 'CS101', title: 'Introduction to Computer Science' },
    { id: 2, code: 'MATH201', title: 'Advanced Calculus' },
    { id: 3, code: 'ENG102', title: 'English Composition' }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>VirtuAid</h1>
        <p>Your AI University Assistant</p>
      </header>
      
      <main className="App-main">
        <div className="course-selector">
          <h2>Select a Course</h2>
          <div className="course-list">
            {courses.map(course => (
              <button
                key={course.id}
                className={`course-button ${selectedCourse === course.id ? 'active' : ''}`}
                onClick={() => setSelectedCourse(course.id)}
              >
                {course.code}: {course.title}
              </button>
            ))}
          </div>
        </div>
        
        {selectedCourse ? (
          <div className="chat-section">
            <h2>Chat with VirtuAid</h2>
            <Chat courseId={selectedCourse} userId={userId} />
          </div>
        ) : (
          <div className="select-course-prompt">
            <p>Please select a course to start chatting</p>
          </div>
        )}
      </main>
      
      <footer className="App-footer">
        <p>&copy; 2023 VirtuAid - AI University Assistant</p>
      </footer>
    </div>
  );
}

export default App;
