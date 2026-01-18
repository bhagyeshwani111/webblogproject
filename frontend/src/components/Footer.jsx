import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="app-footer">
      <div className="app-footer-wave" />
      <div className="container app-footer-content">
        <div className="app-footer-brand">
          <h2>WebBlog</h2>
          <p>Share your stories, connect with others, and stay inspired.</p>
        </div>

        <div className="app-footer-links">
          <div className="app-footer-column">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="app-footer-column">
            <h4>For Creators</h4>
            <Link to="/create-post">Create Post</Link>
            <Link to="/profile">Your Profile</Link>
          </div>
          <div className="app-footer-column">
            <h4>Admin</h4>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/categories">Categories</Link>
          </div>
        </div>

        <div className="app-footer-bottom">
          <span>© {year} WebBlog. All rights reserved.</span>
          <button
            type="button"
            className="btn app-footer-top-btn"
            onClick={handleScrollTop}
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


