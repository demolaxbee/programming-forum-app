import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="hero">
        <h1>Welcome to Programming Channels</h1>
        <p>A platform for programmers to ask questions, share knowledge, and learn together.</p>
        <div className="cta-buttons">
          <Link to="/channels" className="btn btn-primary">Explore Channels</Link>
          <Link to="/register" className="btn btn-secondary">Join Now</Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-item">
          <h2>Topic-focused Channels</h2>
          <p>Find discussions grouped by programming topics</p>
        </div>
        <div className="feature-item">
          <h2>Threaded Discussions</h2>
          <p>Easily follow conversation threads and nested replies</p>
        </div>
        <div className="feature-item">
          <h2>Screenshot Sharing</h2>
          <p>Upload screenshots to better explain your code issues</p>
        </div>
      </div>
    </div>
  );
};

export default Landing; 