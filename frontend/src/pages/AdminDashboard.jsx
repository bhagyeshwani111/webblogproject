import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalReports: 0,
    pendingReports: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Use the new admin stats endpoint
      const response = await api.get('/admin/stats');
      const statsData = response.data;

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalPosts: statsData.totalPosts || 0,
        totalComments: statsData.totalComments || 0,
        totalReports: statsData.totalReports || 0,
        pendingReports: statsData.pendingReports || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      {/* Stats Section */}
      <section className="admin-stats-section">
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-value">{stats.loading ? '-' : stats.totalUsers}</div>
            <div className="admin-stat-label">Total Users</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">📝</div>
            <div className="admin-stat-value">{stats.loading ? '-' : stats.totalPosts}</div>
            <div className="admin-stat-label">Total Posts</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">💬</div>
            <div className="admin-stat-value">{stats.loading ? '-' : stats.totalComments}</div>
            <div className="admin-stat-label">Total Comments</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">🚩</div>
            <div className="admin-stat-value">{stats.loading ? '-' : stats.totalReports}</div>
            <div className="admin-stat-label">Total Reports</div>
          </div>
          <div className="admin-stat-card admin-stat-card-warning">
            <div className="admin-stat-icon">⚠️</div>
            <div className="admin-stat-value">{stats.loading ? '-' : stats.pendingReports}</div>
            <div className="admin-stat-label">Pending Reports</div>
          </div>
        </div>
      </section>

      {/* Management Cards */}
      <section className="admin-management-section">
        <h2 className="section-title">Management</h2>
        <div className="admin-grid">
          <Link to="/admin/users" className="admin-card">
            <h3>Manage Users</h3>
            <p>View, edit, and delete users</p>
          </Link>
          <Link to="/admin/categories" className="admin-card">
            <h3>Manage Categories</h3>
            <p>Create, edit, and delete categories</p>
          </Link>
          <Link to="/admin/reports" className="admin-card">
            <h3>Manage Reports</h3>
            <p>View and delete reported posts</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
