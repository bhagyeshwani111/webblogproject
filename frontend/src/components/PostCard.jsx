import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { UIStateContext } from '../context/UIStateContext';
import CategoryBadge from './CategoryBadge';
import { toast } from 'react-toastify';
import './PostCard.css';

const PostCard = ({ post, onDelete }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const { isPostFlagged } = useContext(UIStateContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const canEdit = user && (user.id === post.authorId || isAdmin());
  const canDelete = user && (user.id === post.authorId || isAdmin());
  const isFlagged = isPostFlagged(post.id);

  useEffect(() => {
    fetchLikeCount();
    if (user) {
      checkLikeStatus();
      checkSaveStatus();
    }
  }, [post.id, user]);

  const fetchLikeCount = async () => {
    try {
      const response = await api.get(`/post-likes/${post.id}/count`);
      setLikeCount(response.data.likeCount || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await api.get(`/post-likes/${post.id}/is-liked?userId=${user.id}`);
      setIsLiked(response.data.isLiked || false);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkSaveStatus = async () => {
    try {
      const response = await api.get(`/saved-posts/${post.id}/is-saved?userId=${user.id}`);
      setIsSaved(response.data.isSaved || false);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loadingLike) return;

    try {
      setLoadingLike(true);
      const response = await api.post(`/post-likes/${post.id}/toggle`);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like post. Please try again.');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loadingSave) return;

    try {
      setLoadingSave(true);
      const response = await api.post(`/saved-posts/${post.id}/toggle`);
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setLoadingSave(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PREVIEW_LENGTH = 150;
  const shouldShowReadMore = post.content && post.content.length > PREVIEW_LENGTH;
  const displayContent = isExpanded || !shouldShowReadMore 
    ? post.content 
    : `${post.content.substring(0, PREVIEW_LENGTH)}...`;

  return (
    <div className={`post-card ${isFlagged ? 'post-flagged' : ''}`}>
      <Link to={`/post/${post.id}`} className="post-link">
        <div className="post-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 className="post-title">{post.title}</h2>
            {isFlagged && isAdmin() && (
              <span style={{
                fontSize: '12px',
                padding: '4px 8px',
                backgroundColor: '#FEF2F2',
                color: 'var(--color-danger)',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                🚩 Flagged
              </span>
            )}
          </div>
          {post.categories && post.categories.length > 0 && (
            <div className="post-categories">
              {post.categories.map(cat => (
                <CategoryBadge key={cat.id} name={cat.name} />
              ))}
            </div>
          )}
        </div>
        <p className="post-meta">
          By <span className="post-author">{post.author?.name || 'Unknown'}</span> • {formatDate(post.createdAt)}
        </p>
        <p className="post-content-preview">
          {displayContent}
        </p>
        {shouldShowReadMore && (
          <button
            className="read-more-btn"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </Link>
      <div className="post-interactions">
        <button
          onClick={handleLike}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          disabled={!user || loadingLike}
          title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
        {user && (
          <button
            onClick={handleSave}
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            disabled={loadingSave}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? '🔖' : '📌'}
          </button>
        )}
      </div>
      {canEdit && (
        <div className="post-actions">
          <Link to={`/edit-post/${post.id}`} className="btn btn-secondary btn-sm">
            Edit
          </Link>
          {canDelete && (
            <button onClick={() => onDelete(post.id)} className="btn btn-danger btn-sm">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
