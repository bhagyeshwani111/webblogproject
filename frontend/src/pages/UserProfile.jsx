import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UIStateContext } from '../context/UIStateContext';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './UserProfile.css';

const UserProfile = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const { isUserBlocked } = useContext(UIStateContext);
  const [userPosts, setUserPosts] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const navigate = useNavigate();

  const isBlocked = user && isUserBlocked(user.id);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [postsResponse] = await Promise.all([
        api.get('/posts')
      ]);
      
      // Filter posts by current user
      const posts = (postsResponse.data || []).filter(post => post.authorId === user.id);
      setUserPosts(posts);

      // Calculate total comments by fetching comments for each user post
      let commentCount = 0;
      for (const post of posts) {
        try {
          const commentsResponse = await api.get(`/comments/post/${post.id}`);
          const comments = commentsResponse.data || [];
          // Count comments made by this user
          commentCount += comments.filter(c => c.authorId === user.id).length;
        } catch (err) {
          console.error(`Error fetching comments for post ${post.id}:`, err);
        }
      }
      setTotalComments(commentCount);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleDeleteClick = (postId) => {
    setDeleteModal({ isOpen: true, postId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.postId) return;

    try {
      await api.delete(`/posts/${deleteModal.postId}`);
      setUserPosts(userPosts.filter(post => post.id !== deleteModal.postId));
      setDeleteModal({ isOpen: false, postId: null });
      toast.success('Post deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMsg);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="not-logged-in">
          <p>Please login to view your profile</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  const totalPosts = userPosts.length;
  const joinedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header-content">
            <div className="avatar-container">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="role-badge">
                <span className={`role-tag ${isAdmin() ? 'admin' : 'user'}`}>
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{totalPosts}</div>
              <div className="stat-label">Total Posts</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-value">{totalComments}</div>
              <div className="stat-label">Total Comments</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">-</div>
              <div className="stat-label">Joined Date</div>
            </div>
          </div>
        </section>

        {/* My Posts Section */}
        <section className="my-posts-section">
          <div className="section-header">
            <h2 className="section-title">My Posts</h2>
            {!isAdmin() && (
              <Link 
                to="/create-post" 
                className={`btn btn-primary ${isBlocked ? 'disabled' : ''}`}
                onClick={(e) => {
                  if (isBlocked) {
                    e.preventDefault();
                  }
                }}
                style={{ opacity: isBlocked ? 0.6 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
              >
                Create New Post
              </Link>
            )}
          </div>
          {isBlocked && (
            <div style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '6px',
              marginBottom: '24px',
              color: 'var(--color-danger)',
              fontSize: '14px'
            }}>
              ⚠️ Your account is temporarily restricted. Post creation is disabled.
            </div>
          )}

          {userPosts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-content">
                <p className="no-posts-text">You haven't created any posts yet.</p>
                {!isAdmin() && (
                  <Link to="/create-post" className="btn btn-primary">
                    Create Your First Post
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="posts-grid">
              {userPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        title="Delete Post"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete this post?</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '12px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default UserProfile;
