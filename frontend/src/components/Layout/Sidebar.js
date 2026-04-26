import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Nav, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/students', icon: 'bi-people', label: 'Students' },
    { path: '/classes', icon: 'bi-building', label: 'Classes' },
    { path: '/pending-users', icon: 'bi-person-check', label: 'Approvals', adminOnly: true },
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="bi bi-mortarboard-fill"></i>
          {!isCollapsed && <span>SMS</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </button>
      </div>
      
      <Nav className="flex-column sidebar-nav">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            <i className={`bi ${item.icon}`}></i>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </Nav>
      
      <div className="sidebar-footer">
        {!isCollapsed && (
          <small className="text-muted">v1.0.0</small>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
