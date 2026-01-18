import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryUsage, setCategoryUsage] = useState({});
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null, categoryName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchCategoryUsage();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryUsage = async () => {
    try {
      const postsResponse = await api.get('/posts');
      const posts = postsResponse.data || [];
      
      // Count usage of each category
      const usage = {};
      posts.forEach(post => {
        if (post.categories && post.categories.length > 0) {
          post.categories.forEach(cat => {
            usage[cat.id] = (usage[cat.id] || 0) + 1;
          });
        }
      });
      
      setCategoryUsage(usage);
    } catch (error) {
      console.error('Error fetching category usage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
        setEditingId(null);
      } else {
        await api.post('/categories', { name });
      }
      setName('');
      fetchCategories();
      fetchCategoryUsage();
      toast.success(editingId ? 'Category updated successfully' : 'Category created successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to save category';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/categories/${deleteModal.categoryId}`);
      fetchCategories();
      fetchCategoryUsage();
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
      toast.success('Category deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete category';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Manage Categories</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
      <div className="categories-container">
        <div className="category-form-card">
          <h2>{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name..."
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="categories-list-card">
          <h2>All Categories</h2>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No categories yet. Create one above!</p>
          ) : (
            <div className="categories-grid">
              {categories.map(category => {
                const usageCount = categoryUsage[category.id] || 0;
                return (
                  <div key={category.id} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      <span className="category-usage">
                        {usageCount} {usageCount === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                    <div className="category-actions">
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })}
        title="Delete Category"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete the category <strong>"{deleteModal.categoryName}"</strong>?</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '12px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminCategories;
