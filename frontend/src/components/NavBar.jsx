import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Modal from './Modal';
import './NavBar.css';

const NavBar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="nav-brand">
              WebBlog
            </Link>
            <div className="nav-links">
              {user ? (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  {!isAdmin() && <Link to="/create-post" className="nav-link">Create Post</Link>}
                  {!isAdmin() && <Link to="/saved-posts" className="nav-link">Saved</Link>}
                  {!isAdmin() && <Link to="/profile" className="nav-link">Profile</Link>}
                  {isAdmin() && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
                  <span className="nav-user">Hello, {user.name}</span>
                  <button onClick={handleLogoutClick} className="btn btn-secondary btn-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Modal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Confirm Logout"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </>
  );
};

export default NavBar;
