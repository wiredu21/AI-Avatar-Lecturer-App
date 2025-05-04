import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing-page/LandingPage';
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/signup/SignupPage';
import AboutYouPage from './components/about-you/AboutYouPage';
import Dashboard from './components/dashboard/Dashboard';
import Courses from './components/dashboard/Courses';
import Insights from './components/dashboard/Insights';
import Settings from './components/dashboard/Settings';
import Chat from './components/dashboard/Chat';
import UniversityContent from './components/dashboard/UniversityContent';
import VerifyEmail from './components/verify-email/VerifyEmail';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about-you" element={<AboutYouPage />} />
        <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/courses" element={<Courses />} />
        <Route path="/dashboard/insights" element={<Insights />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/chat" element={<Chat />} />
        <Route path="/dashboard/university-content" element={<UniversityContent />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
