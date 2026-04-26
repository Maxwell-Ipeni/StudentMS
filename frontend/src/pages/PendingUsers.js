import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState({ show: false, user: null });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await adminService.getPendingUsers();
        setUsers(response.data.users || []);
      } else {
        const response = await adminService.getAllUsers();
        setAllUsers(response.data.users || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      toast.success('User approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      await adminService.rejectUser(rejectModal.user.id);
      toast.success('User rejected and removed');
      setRejectModal({ show: false, user: null });
      fetchData();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'danger',
      manager: 'warning',
      teacher: 'info',
      student: 'primary'
    };
    return <Badge bg={colors[role] || 'secondary'}>{role}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">User Management</h4>
          <p className="text-muted mb-0">Manage user registrations and approvals</p>
        </div>
      </div>

      <Card>
        <Card.Header className="bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Approvals
                {users.length > 0 && (
                  <Badge bg="danger" className="ms-2">{users.length}</Badge>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Users
              </button>
            </li>
          </ul>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : activeTab === 'pending' ? (
            users.length === 0 ? (
              <Alert variant="success" className="text-center py-4">
                <i className="bi bi-check-circle fs-1 d-block mb-2"></i>
                <strong>No pending approvals</strong>
                <p className="mb-0 text-muted">All user registrations have been processed.</p>
              </Alert>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="align-middle">{user.full_name}</td>
                      <td className="align-middle">{user.username}</td>
                      <td className="align-middle">{user.email}</td>
                      <td className="align-middle">{getRoleBadge(user.role)}</td>
                      <td className="align-middle">{formatDate(user.created_at)}</td>
                      <td className="align-middle">
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApprove(user.id)}
                        >
                          <i className="bi bi-check-lg me-1"></i>
                          Approve
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setRejectModal({ show: true, user })}
                        >
                          <i className="bi bi-x-lg me-1"></i>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          ) : (
            allUsers.length === 0 ? (
              <Alert variant="info" className="text-center py-4">
                No users found.
              </Alert>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Approved</th>
                    <th>Last Login</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td className="align-middle">{user.full_name}</td>
                      <td className="align-middle">{user.username}</td>
                      <td className="align-middle">{user.email}</td>
                      <td className="align-middle">{getRoleBadge(user.role)}</td>
                      <td className="align-middle">
                        <Badge bg={user.is_active ? 'success' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <Badge bg={user.is_approved ? 'success' : 'warning'}>
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        {user.last_login ? formatDate(user.last_login) : '-'}
                      </td>
                      <td className="align-middle">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          )}
        </Card.Body>
      </Card>

      <Modal show={rejectModal.show} onHide={() => setRejectModal({ show: false, user: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to reject and remove this user?</p>
          {rejectModal.user && (
            <Alert variant="danger">
              <strong>{rejectModal.user.full_name}</strong><br />
              <small>{rejectModal.user.email}</small>
            </Alert>
          )}
          <p className="mb-0 text-muted">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRejectModal({ show: false, user: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingUsers;