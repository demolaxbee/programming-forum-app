import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">CodeQnA</h3>
            <p className="footer-description">
              A channel-based platform for programming questions and answers.
              Connect with other developers, share knowledge, and help each other grow.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/channels">Channels</Link></li>
              <li><Link to="/search">Search</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Account</h3>
            <ul className="footer-links">
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} CodeQnA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 