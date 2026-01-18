import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import { UIStateContext } from '../context/UIStateContext';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, alphabetical
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const { user, isAdmin } = useContext(AuthContext);
  const { isUserBlocked } = useContext(UIStateContext);
  const navigate = useNavigate();

  const isBlocked = user && isUserBlocked(user.id);

  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/posts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteClick = (postId) => {
    setDeleteModal({ isOpen: true, postId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.postId) return;

    try {
      await api.delete(`/posts/${deleteModal.postId}`);
      setPosts(posts.filter(post => post.id !== deleteModal.postId));
      setDeleteModal({ isOpen: false, postId: null });
      toast.success('Post deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMsg);
      setDeleteModal({ isOpen: false, postId: null });
    }
  };

  // Filter posts by category
  const categoryFiltered = selectedCategory
    ? posts.filter(post => post.categories?.some(cat => cat.id === selectedCategory))
    : posts;

  // Search filter
  const searchFiltered = searchQuery.trim()
    ? categoryFiltered.filter(post => {
        const query = searchQuery.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(query);
        const contentMatch = post.content?.toLowerCase().includes(query);
        const authorMatch = post.author?.name?.toLowerCase().includes(query);
        return titleMatch || contentMatch || authorMatch;
      })
    : categoryFiltered;

  // Sort posts
  const sortedPosts = [...searchFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'alphabetical':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCategory, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-skeleton-container">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="post-skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-content short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPosts} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to WebBlog</h1>
            <p className="hero-subtitle">Discover, create, and share amazing stories</p>
            {!user && (
              <div className="hero-actions">
                <button onClick={() => navigate('/register')} className="btn btn-primary">
                  Get Started
                </button>
                <button onClick={() => navigate('/login')} className="btn btn-secondary">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Search and Sort Section */}
        <section className="search-sort-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search posts by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </section>

        {/* Category Filter Section */}
        {categories.length > 0 && (
          <section className="category-filter-section">
            <h2 className="section-title">Browse by Category</h2>
            <div className="category-filters">
              <button
                className={`category-filter-btn ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Posts
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Posts Grid Section */}
        <section className="posts-section">
          <div className="posts-header">
            <h2 className="section-title">
              {selectedCategory
                ? `${categories.find(c => c.id === selectedCategory)?.name || ''} Posts`
                : 'All Posts'}
              {searchQuery && ` (${sortedPosts.length} found)`}
            </h2>
            {user && !isAdmin() && (
              <button 
                onClick={() => navigate('/create-post')} 
                className="btn btn-primary"
                disabled={isBlocked}
                title={isBlocked ? 'Your account is temporarily restricted' : ''}
              >
                Create Post
              </button>
            )}
          </div>

          {paginatedPosts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-content">
                <p className="no-posts-text">
                  {searchQuery
                    ? `No posts found matching "${searchQuery}"`
                    : selectedCategory
                    ? `No posts found in this category. Be the first to create one!`
                    : 'No posts yet. Be the first to create one!'}
                </p>
                {user && (
                  <button onClick={() => navigate('/create-post')} className="btn btn-primary">
                    Create Post
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {paginatedPosts.map(post => (
                  <PostCard key={post.id} post={post} onDelete={handleDeleteClick} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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

export default Home;
