import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <Navbar bg="white" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          Attendance System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/take-attendance" 
              className={location.pathname === '/take-attendance' ? 'active' : ''}
            >
              Take Attendance
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/view-attendance" 
              className={location.pathname === '/view-attendance' ? 'active' : ''}
            >
              View Records
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 