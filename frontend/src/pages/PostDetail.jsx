import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { UIStateContext } from '../context/UIStateContext';
import CategoryBadge from '../components/CategoryBadge';
import { toast } from 'react-toastify';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState({});
  const { user, isAdmin } = useContext(AuthContext);
  const { isUserBlocked } = useContext(UIStateContext);
  const navigate = useNavigate();

  const isBlocked = user && isUserBlocked(user.id);

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchLikeCount();
    if (user) {
      checkLikeStatus();
      checkSaveStatus();
    }
  }, [id, user]);

  useEffect(() => {
    if (comments.length > 0) {
      comments.forEach(comment => {
        fetchReplies(comment.id);
      });
    }
  }, [comments]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/post/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const response = await api.get(`/post-likes/${id}/count`);
      setLikeCount(response.data.likeCount || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await api.get(`/post-likes/${id}/is-liked?userId=${user.id}`);
      setIsLiked(response.data.isLiked || false);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const checkSaveStatus = async () => {
    try {
      const response = await api.get(`/saved-posts/${id}/is-saved?userId=${user.id}`);
      setIsSaved(response.data.isSaved || false);
    } catch (error) {
      console.error('Error checking save status:', error);
    }
  };

  const handleLike = async () => {
    if (!user || loadingLike) return;

    try {
      setLoadingLike(true);
      const response = await api.post(`/post-likes/${id}/toggle`);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like post. Please try again.');
    } finally {
      setLoadingLike(false);
    }
  };

  const handleSave = async () => {
    if (!user || loadingSave) return;

    try {
      setLoadingSave(true);
      const response = await api.post(`/saved-posts/${id}/toggle`);
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setLoadingSave(false);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const response = await api.get(`/comment-replies/comment/${commentId}`);
      setReplies(prev => ({ ...prev, [commentId]: response.data }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!user || !replyContent.trim()) return;

    try {
      await api.post(`/comment-replies/comment/${commentId}`, { content: replyContent });
      setReplyContent('');
      setReplyingTo(null);
      fetchReplies(commentId);
      toast.success('Reply posted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to post reply';
      toast.error(errorMsg);
    }
  };

  const handleDeleteReply = async (replyId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await api.delete(`/comment-replies/${replyId}`);
      fetchReplies(commentId);
      toast.success('Reply deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete reply';
      toast.error(errorMsg);
    }
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post(`/comments/post/${id}`, { content: commentContent });
      setCommentContent('');
      fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create comment';
      toast.error(errorMsg);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete comment';
      toast.error(errorMsg);
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

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!post) {
    return <div className="container">Post not found</div>;
  }

  const canEditPost = user && (user.id === post.authorId || isAdmin());
  const canDeletePost = user && (user.id === post.authorId || isAdmin());

  return (
    <div className="container">
      <div className="post-detail">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, flex: 1 }}>{post.title}</h1>
        </div>
        <p className="post-meta">
          By {post.author?.name} • {formatDate(post.createdAt)}
        </p>
        <div className="post-interactions-detail">
          <button
            onClick={handleLike}
            className={`like-btn-detail ${isLiked ? 'liked' : ''}`}
            disabled={!user || loadingLike}
            title={user ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>
          {user && (
            <button
              onClick={handleSave}
              className={`save-btn-detail ${isSaved ? 'saved' : ''}`}
              disabled={loadingSave}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              {isSaved ? '🔖 Saved' : '📌 Save'}
            </button>
          )}
          {canEditPost && (
            <Link to={`/edit-post/${post.id}`} className="btn btn-secondary">
              Edit Post
            </Link>
          )}
        </div>
        <div className="post-content">{post.content}</div>
        {post.categories && post.categories.length > 0 && (
          <div className="post-categories">
            {post.categories.map(cat => (
              <CategoryBadge key={cat.id} name={cat.name} />
            ))}
          </div>
        )}
      </div>

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {user && !isBlocked ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Comment
            </button>
          </form>
        ) : user && isBlocked ? (
          <div style={{
            padding: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '6px',
            marginBottom: '24px',
            color: 'var(--color-danger)'
          }}>
            ⚠️ Your account is temporarily restricted. Commenting is disabled.
          </div>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Login</Link> to add a comment
          </p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => {
              const canDeleteComment = user && (user.id === comment.authorId || isAdmin());
              const commentReplies = replies[comment.id] || [];
              return (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <strong>{comment.author?.name}</strong>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-actions">
                    {user && !isBlocked && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                      </button>
                    )}
                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {replyingTo === comment.id && user && (
                    <div className="reply-form">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows="3"
                      />
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        className="btn btn-primary btn-sm"
                        disabled={!replyContent.trim()}
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                  {commentReplies.length > 0 && (
                    <div className="replies-list">
                      {commentReplies.map(reply => {
                        const canDeleteReply = user && (user.id === reply.authorId || isAdmin());
                        return (
                          <div key={reply.id} className="reply-card">
                            <div className="reply-header">
                              <strong>{reply.author?.name}</strong>
                              <span className="reply-date">{formatDate(reply.createdAt)}</span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                            {canDeleteReply && (
                              <button
                                onClick={() => handleDeleteReply(reply.id, comment.id)}
                                className="btn btn-danger btn-xs"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default PostDetail;

