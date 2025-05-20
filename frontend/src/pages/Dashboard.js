import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Today's Attendance</Card.Title>
              <Card.Text className="display-4 mb-0">85%</Card.Text>
              <Card.Text className="text-muted">Average attendance rate</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Students</Card.Title>
              <Card.Text className="display-4 mb-0">13</Card.Text>
              <Card.Text className="text-muted">Active students</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Classes</Card.Title>
              <Card.Text className="display-4 mb-0">3</Card.Text>
              <Card.Text className="text-muted">Active classes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/take-attendance" 
                  variant="primary" 
                  size="lg"
                >
                  Take New Attendance
                </Button>
                <Button 
                  as={Link} 
                  to="/view-attendance" 
                  variant="outline-primary" 
                  size="lg"
                >
                  View Attendance Records
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Data Structures Class</h6>
                    <small>3 hours ago</small>
                  </div>
                  <p className="mb-1">Attendance taken for CSE-2</p>
                </div>
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Database Systems</h6>
                    <small>Yesterday</small>
                  </div>
                  <p className="mb-1">Attendance taken for CSE-2</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard; 