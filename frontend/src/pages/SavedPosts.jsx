import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import './SavedPosts.css';

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSavedPosts();
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/saved-posts/my-saved');
      setSavedPosts(response.data.map(item => item.post).filter(Boolean));
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-skeleton-container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="post-skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-content"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="saved-posts-page">
        <h1>My Saved Posts</h1>
        {savedPosts.length === 0 ? (
          <div className="no-saved-posts">
            <p>You haven't saved any posts yet.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Browse Posts
            </button>
          </div>
        ) : (
          <div className="saved-posts-grid">
            {savedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;

