
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <div className="logo">VirtuAid</div>
          <nav className="nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><Link to="/login" className="btn btn-login">Login</Link></li>
              <li><Link to="/signup" className="btn btn-primary">Sign Up</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Your Virtual Healthcare Assistant</h1>
            <p>VirtuAid provides personalized healthcare assistance through advanced AI, making healthcare more accessible and convenient for everyone.</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
              <a href="#learn-more" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/healthcare-assistant.svg" alt="Virtual Healthcare Assistant" />
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🩺</div>
              <h3>AI-Powered Diagnostics</h3>
              <p>Get preliminary assessments based on your symptoms using advanced machine learning algorithms.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Appointment Scheduling</h3>
              <p>Easily book appointments with healthcare providers through our integrated scheduling system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Medication Reminders</h3>
              <p>Never miss a dose with personalized medication reminders and tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Health Records</h3>
              <p>Access and manage your health records in one secure, HIPAA-compliant platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <h2>About VirtuAid</h2>
            <p>VirtuAid was created to bridge the gap between patients and healthcare services, providing accessible, efficient, and personalized healthcare assistance.</p>
            <p>Our team of medical professionals and AI specialists work together to ensure accurate and helpful guidance for all your healthcare needs.</p>
          </div>
          <div className="about-image">
            <img src="/images/about-healthcare.svg" alt="About VirtuAid" />
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2>What Our Users Say</h2>
          <div className="testimonial-carousel">
            <div className="testimonial-card">
              <p>"VirtuAid has made managing my chronic condition so much easier. The medication reminders and quick access to my doctor have been life-changing."</p>
              <div className="testimonial-author">
                <img src="/images/user1.jpg" alt="Sarah J." />
                <h4>Sarah J.</h4>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"As a busy parent, being able to get quick health assessments for my children has saved me countless unnecessary trips to the doctor."</p>
              <div className="testimonial-author">
                <img src="/images/user2.jpg" alt="Michael T." />
                <h4>Michael T.</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <h2>Contact Us</h2>
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Your Email" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" placeholder="Your Message"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>VirtuAid</h3>
              <p>Your Virtual Healthcare Assistant</p>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-social">
              <h4>Connect With Us</h4>
              <div className="social-icons">
                <a href="#" className="social-icon">FB</a>
                <a href="#" className="social-icon">TW</a>
                <a href="#" className="social-icon">IN</a>
                <a href="#" className="social-icon">IG</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 VirtuAid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
