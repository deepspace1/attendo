import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Row, Col, Button, Alert, Spinner, Modal, Form, Pagination } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function ManageData() {
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalAttendanceSessions: 0,
    activeStudents: 0,
    activeTeachers: 0,
    activeCourses: 0
  });
  const [recentData, setRecentData] = useState({
    students: [],
    teachers: [],
    courses: [],
    attendanceSessions: []
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAllData();

    // Set up global refresh functions for real-time updates
    window.refreshDashboard = fetchAllData;
    window.refreshStudents = fetchAllData;
    window.refreshTeachers = fetchAllData;
    window.refreshCourses = fetchAllData;
    window.refreshDepartments = fetchAllData;

    return () => {
      // Cleanup
      delete window.refreshDashboard;
      delete window.refreshStudents;
      delete window.refreshTeachers;
      delete window.refreshCourses;
      delete window.refreshDepartments;
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch comprehensive dashboard data
      const response = await fetch(`${apiBaseUrl}/api/admin/dashboard`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentData(data.recentData);
        setDepartmentStats(data.departmentStats);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }

    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed data for modals
  const fetchDetailedData = async (type, page = 1) => {
    setModalLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/${type}?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModalData(data[type] || []);
          setTotalPages(data.pagination?.pages || 1);
          setCurrentPage(page);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setModalLoading(false);
    }
  };

  // Show detailed modal
  const showDetailedView = (type) => {
    setModalType(type);
    setShowModal(true);
    setCurrentPage(1);
    fetchDetailedData(type, 1);
  };

  // Handle page change in modal
  const handlePageChange = (page) => {
    fetchDetailedData(modalType, page);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading data...</p>
      </div>
    );
  }

  return (
    <div>
      <h5 className="mb-4">📊 System Overview</h5>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-building text-primary" style={{fontSize: '2rem'}}></i>
              </div>
              <h2 className="text-primary mb-1">{stats.totalDepartments}</h2>
              <h6 className="text-muted mb-0">Departments</h6>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-chalkboard-teacher text-success" style={{fontSize: '2rem'}}></i>
              </div>
              <h2 className="text-success mb-1">{stats.totalTeachers}</h2>
              <h6 className="text-muted mb-2">Teachers</h6>
              <Badge bg="success" className="px-2">{stats.activeTeachers} Active</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-book text-info" style={{fontSize: '2rem'}}></i>
              </div>
              <h2 className="text-info mb-1">{stats.totalCourses}</h2>
              <h6 className="text-muted mb-2">Courses</h6>
              <Badge bg="info" className="px-2">{stats.activeCourses} Active</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-user-graduate text-warning" style={{fontSize: '2rem'}}></i>
              </div>
              <h2 className="text-warning mb-1">{stats.totalStudents}</h2>
              <h6 className="text-muted mb-2">Students</h6>
              <Badge bg="warning" className="px-2">{stats.activeStudents} Active</Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Stats Row */}
      <Row className="mb-4">
        <Col lg={4} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-calendar-check text-secondary" style={{fontSize: '2rem'}}></i>
              </div>
              <h2 className="text-secondary mb-1">{stats.totalAttendanceSessions}</h2>
              <h6 className="text-muted mb-0">Attendance Sessions</h6>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-2">
                <i className="fas fa-chart-line text-primary" style={{fontSize: '2rem'}}></i>
              </div>
              <h4 className="text-primary mb-1">
                {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
              </h4>
              <h6 className="text-muted mb-0">Student Activity Rate</h6>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12} className="mb-3">
          <Card className="text-center h-100 shadow-sm">
            <Card.Body className="py-4">
              <div className="mb-3">
                <Button variant="primary" size="lg" onClick={fetchAllData} className="px-4">
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh Data
                </Button>
              </div>
              <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Department Statistics */}
      {departmentStats.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">🏢 Department Statistics</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              {departmentStats.map((dept) => (
                <Col md={3} key={dept.name} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      <h6 className="text-primary">{dept.name}</h6>
                      <div className="d-flex justify-content-around">
                        <div>
                          <strong>{dept.students}</strong>
                          <br />
                          <small>Students</small>
                        </div>
                        <div>
                          <strong>{dept.teachers}</strong>
                          <br />
                          <small>Teachers</small>
                        </div>
                        <div>
                          <strong>{dept.courses}</strong>
                          <br />
                          <small>Courses</small>
                        </div>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Sections: {dept.sections.join(', ') || 'None'}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Recent Data Tables */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-user-graduate text-primary me-2"></i>
                Recent Students
              </h5>
            </Card.Header>
            <Card.Body>
              {recentData.students.length === 0 ? (
                <Alert variant="info" className="mb-0">No students found</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Student Details</th>
                        <th>Section & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentData.students.slice(0, 8).map((student) => (
                        <tr key={student._id}>
                          <td>
                            <div>
                              <strong className="text-dark">{student.name}</strong>
                              <br />
                              <small className="text-muted">USN: {student.rollNumber}</small>
                              <br />
                              <small className="text-muted">Barcode: {student.barcodeId}</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg="secondary" className="mb-2 px-2">Section {student.section}</Badge>
                            <br />
                            <Badge bg={student.isActive !== false ? 'success' : 'danger'} className="px-2">
                              {student.isActive !== false ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-chalkboard-teacher text-success me-2"></i>
                Recent Teachers
              </h5>
            </Card.Header>
            <Card.Body>
              {recentData.teachers.length === 0 ? (
                <Alert variant="info" className="mb-0">No teachers found</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Teacher Details</th>
                        <th>Department & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentData.teachers.slice(0, 8).map((teacher) => (
                        <tr key={teacher._id}>
                          <td>
                            <div>
                              <strong className="text-dark">{teacher.name}</strong>
                              <br />
                              <small className="text-muted">{teacher.email}</small>
                              {teacher.designation && (
                                <>
                                  <br />
                                  <small className="text-info">{teacher.designation}</small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted d-block mb-2">{teacher.department}</small>
                            <Badge bg={teacher.isActive !== false ? 'success' : 'danger'} className="px-2">
                              {teacher.isActive !== false ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-book text-info me-2"></i>
                Recent Courses
              </h5>
            </Card.Header>
            <Card.Body>
              {recentData.courses.length === 0 ? (
                <Alert variant="info" className="mb-0">No courses found</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Course Details</th>
                        <th>Credits & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentData.courses.slice(0, 8).map((course) => (
                        <tr key={course._id}>
                          <td>
                            <div>
                              <strong className="text-dark">{course.courseCode}</strong>
                              <br />
                              <small className="text-muted">{course.courseName}</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg="info" className="mb-2 px-2">{course.credits} Credits</Badge>
                            <br />
                            <Badge bg="secondary" className="mb-2 px-2">Semester {course.semester}</Badge>
                            <br />
                            <Badge bg={course.isActive !== false ? 'success' : 'danger'} className="px-2">
                              {course.isActive !== false ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-calendar-check text-warning me-2"></i>
                Recent Attendance Sessions
              </h5>
            </Card.Header>
            <Card.Body>
              {recentData.attendanceSessions.length === 0 ? (
                <Alert variant="info" className="mb-0">No attendance sessions found</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Session Details</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentData.attendanceSessions.slice(0, 8).map((session) => (
                        <tr key={session._id}>
                          <td>
                            <div>
                              <strong className="text-dark">{session.subjectCode}</strong>
                              <br />
                              <small className="text-muted">{session.department} - Section {session.section}</small>
                              <br />
                              <small className="text-info">{new Date(session.date).toLocaleDateString()}</small>
                            </div>
                          </td>
                          <td>
                            <div className="text-center">
                              <Badge bg="success" className="px-2">{session.presentStudents}</Badge>
                              <span className="mx-2 text-muted">/</span>
                              <Badge bg="secondary" className="px-2">{session.totalStudents}</Badge>
                              <br />
                              <strong className="text-primary mt-2 d-block">
                                {Math.round((session.presentStudents / session.totalStudents) * 100)}%
                              </strong>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="fas fa-bolt text-warning me-2"></i>
            Quick Actions
          </h5>
        </Card.Header>
        <Card.Body className="py-4">
          <Row>
            <Col lg={3} md={6} className="mb-3">
              <Button variant="outline-primary" className="w-100 py-3" size="lg">
                <i className="fas fa-download me-2"></i>
                <br />
                Export Students
              </Button>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Button variant="outline-success" className="w-100 py-3" size="lg">
                <i className="fas fa-chart-line me-2"></i>
                <br />
                Attendance Report
              </Button>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Button variant="outline-info" className="w-100 py-3" size="lg">
                <i className="fas fa-sync-alt me-2"></i>
                <br />
                Sync Data
              </Button>
            </Col>
            <Col lg={3} md={6} className="mb-3">
              <Button variant="outline-warning" className="w-100 py-3" size="lg">
                <i className="fas fa-database me-2"></i>
                <br />
                Backup Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ManageData;
