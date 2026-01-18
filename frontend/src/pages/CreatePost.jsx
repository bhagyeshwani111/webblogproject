import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { UIStateContext } from '../context/UIStateContext';
import { toast } from 'react-toastify';
import './CreatePost.css';

const DRAFT_KEY = 'post_draft';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const textareaRef = useRef(null);
  const { user } = useContext(AuthContext);
  const { isUserBlocked } = useContext(UIStateContext);
  const navigate = useNavigate();

  const isBlocked = user && isUserBlocked(user.id);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setSelectedCategory(draft.category || '');
      } catch (err) {
        console.error('Error loading draft:', err);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Save draft to localStorage whenever fields change
  useEffect(() => {
    const draft = { title, content, category: selectedCategory };
    if (title.trim() || content.trim()) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [title, content, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-expand textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateTitle = (value) => {
    if (!value || value.trim() === '') {
      setTitleError('Title is required');
      return false;
    }
    if (!/^[A-Za-z0-9 ].+$/.test(value.trim())) {
      setTitleError('Title must contain readable characters');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateContent = (value) => {
    if (!value || value.trim() === '') {
      setContentError('Content is required');
      return false;
    }
    setContentError('');
    return true;
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    validateTitle(value);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    validateContent(value);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle('');
    setContent('');
    setSelectedCategory('');
  };

  const isFormValid = () => {
    const titleValid = validateTitle(title);
    const contentValid = validateContent(content);
    return titleValid && contentValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      return;
    }

    try {
      const postData = { title: title.trim(), content: content.trim() };
      // Note: Category assignment not yet supported by backend API
      // UI is ready for when backend supports it
      if (selectedCategory) {
        postData.categoryIds = [parseInt(selectedCategory)];
      }
      
      const response = await api.post('/posts', postData);
      // Clear draft after successful submission
      clearDraft();
      toast.success('Post created successfully!');
      navigate(`/post/${response.data.id}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create post';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const hasDraft = title.trim() || content.trim();

  return (
    <div className="container">
      <div className="form-container">
        <h2>Create New Post</h2>
        {isBlocked && (
          <div className="error" style={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FEE2E2',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            ⚠️ Your account is temporarily restricted. Post creation is disabled.
          </div>
        )}
        {hasDraft && (
          <div className="draft-notice" style={{ 
            padding: '12px', 
            backgroundColor: '#EFF6FF', 
            border: '1px solid var(--color-accent)', 
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--color-text-primary)'
          }}>
            💾 Draft saved automatically
            <button
              type="button"
              onClick={clearDraft}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Clear draft
            </button>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => validateTitle(title)}
              placeholder="Enter post title..."
              className={titleError ? 'error-input' : ''}
              required
            />
            {titleError && <div className="validation-message error">{titleError}</div>}
            <div className="validation-message">Title must contain readable characters</div>
          </div>

          {categories.length > 0 && (
            <div className="form-group">
              <label htmlFor="category">Category (Optional)</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onBlur={() => validateContent(content)}
              placeholder="Write your post content here... (No character limit)"
              className={`auto-expand-textarea ${contentError ? 'error-input' : ''}`}
              required
            />
            {contentError && <div className="validation-message error">{contentError}</div>}
            <div className="validation-message">No character limit - write as much as you need</div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!title.trim() || !content.trim() || isBlocked}
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
