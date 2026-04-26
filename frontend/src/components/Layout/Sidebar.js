import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: 'bi-house-door', label: 'Dashboard' },
    { path: '/students', icon: 'bi-people', label: 'Students' },
    { path: '/classes', icon: 'bi-building', label: 'Classes' },
  ];

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
        {menuItems.map((item) => (
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
