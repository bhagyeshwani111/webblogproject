import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import './AdminReports.css';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reportId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reportId) => {
    setDeleteModal({ isOpen: true, reportId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.reportId) return;

    try {
      // Note: Backend doesn't have delete endpoint yet, but we'll handle gracefully
      await api.delete(`/reports/${deleteModal.reportId}`);
      setReports(reports.filter(report => report.id !== deleteModal.reportId));
      setDeleteModal({ isOpen: false, reportId: null });
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(error.response?.data?.error || 'Failed to delete report');
      setDeleteModal({ isOpen: false, reportId: null });
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

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: { bg: '#FEF3C7', color: '#D97706', text: 'Pending' },
      REVIEWED: { bg: '#DBEAFE', color: '#2563EB', text: 'Reviewed' },
      RESOLVED: { bg: '#D1FAE5', color: '#059669', text: 'Resolved' },
      DISMISSED: { bg: '#F3F4F6', color: '#6B7280', text: 'Dismissed' }
    };
    
    const statusInfo = statusColors[status] || statusColors.PENDING;
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: statusInfo.bg,
        color: statusInfo.color
      }}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Manage Reports</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="no-reports">
          <p>No reports found.</p>
        </div>
      ) : (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>
                    {report.postId ? (
                      <span>Post #{report.postId}</span>
                    ) : report.commentId ? (
                      <span>Comment #{report.commentId}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="report-reason">{report.reason}</td>
                  <td>{report.reporter?.name || 'Unknown'}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(report.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, reportId: null })}
        title="Delete Report"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete this report?</p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '12px' }}>
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminReports;

