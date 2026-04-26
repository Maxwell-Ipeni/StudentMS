import React from 'react';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          <Container fluid>
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Layout;
