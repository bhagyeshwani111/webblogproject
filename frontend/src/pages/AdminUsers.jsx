import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('[ADMIN USERS] Fetching users from /users endpoint');
      console.log('[ADMIN USERS] Token present:', !!localStorage.getItem('token'));
      
      const response = await api.get('/users');
      
      console.log('[ADMIN USERS] Response received:', response);
      console.log('[ADMIN USERS] Response status:', response.status);
      console.log('[ADMIN USERS] Response data:', response.data);
      console.log('[ADMIN USERS] Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('[ADMIN USERS] Response data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      const usersData = response.data || [];
      console.log('[ADMIN USERS] Setting users:', usersData.length, 'users');
      
      setUsers(usersData);
    } catch (error) {
      console.error('[ADMIN USERS] Error fetching users:', error);
      console.error('[ADMIN USERS] Error response:', error.response);
      console.error('[ADMIN USERS] Error status:', error.response?.status);
      console.error('[ADMIN USERS] Error data:', error.response?.data);
      console.error('[ADMIN USERS] Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch users';
      
      toast.error(`Failed to fetch users: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete user';
      toast.error(errorMsg);
    }
  };

  const handleBlockToggle = async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/toggle-block`);
      setUsers(users.map(u => u.id === userId ? response.data : u));
      const isBlocked = response.data.isBlocked;
      toast.success(isBlocked ? 'User blocked successfully' : 'User unblocked successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to toggle block status';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Manage Users</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Blocked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No users found</td>
              </tr>
            ) : (
              users.map(user => {
                return (
                  <tr key={user.id} className={user.isBlocked ? 'user-blocked' : ''}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</td>
                    <td>{user.enabled ? 'Active' : 'Disabled'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: user.isBlocked ? '#FEF2F2' : '#F0FDF4',
                        color: user.isBlocked ? '#EF4444' : '#16A34A'
                      }}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleBlockToggle(user.id)}
                        className={`btn btn-sm ${user.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                        style={{ minWidth: '80px', marginRight: '8px' }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
