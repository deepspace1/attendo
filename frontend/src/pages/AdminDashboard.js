import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import AddDepartment from '../components/admin/AddDepartment';
import AddTeacher from '../components/admin/AddTeacher';
import AddCourse from '../components/admin/AddCourse';
import AddStudent from '../components/admin/AddStudent';
import ManageData from '../components/admin/ManageData';
import SearchAttendance from '../components/admin/SearchAttendance';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <Container fluid>
      <h1 className="mb-4">🔧 Admin Dashboard</h1>
      
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col md={3}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Admin Functions</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="departments" className="text-start">
                      🏢 Manage Departments
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="teachers" className="text-start">
                      👨‍🏫 Manage Teachers
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="courses" className="text-start">
                      📚 Manage Courses
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="students" className="text-start">
                      👨‍🎓 Manage Students
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="search" className="text-start">
                      🔍 Search & Attendance
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="data" className="text-start">
                      📊 View All Data
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="departments">
                <AddDepartment />
              </Tab.Pane>
              
              <Tab.Pane eventKey="teachers">
                <AddTeacher />
              </Tab.Pane>
              
              <Tab.Pane eventKey="courses">
                <AddCourse />
              </Tab.Pane>
              
              <Tab.Pane eventKey="students">
                <AddStudent />
              </Tab.Pane>

              <Tab.Pane eventKey="search">
                <SearchAttendance />
              </Tab.Pane>

              <Tab.Pane eventKey="data">
                <ManageData />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default AdminDashboard;
