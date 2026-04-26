import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar className="topbar" expand="lg">
      <div className="d-flex justify-content-between w-100 align-items-center px-3">
        <div className="page-title">
          <h5 className="mb-0">Student Management System</h5>
        </div>
        
        <Nav>
          <Dropdown align="end">
            <Dropdown.Toggle as={Nav.Link} className="user-dropdown">
              <div className="d-flex align-items-center">
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-info d-none d-md-block ms-2">
                  <span className="user-name">{user?.full_name || 'Admin'}</span>
                  <span className="user-role d-block text-muted">{user?.role || 'Administrator'}</span>
                </div>
              </div>
            </Dropdown.Toggle>
            
            <Dropdown.Menu className="dropdown-menu-end">
              <Dropdown.Item onClick={() => navigate('/profile')}>
                <i className="bi bi-person me-2"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
    </Navbar>
  );
};

export default Topbar;
