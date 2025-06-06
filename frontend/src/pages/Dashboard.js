import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    totalClasses: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all students
      const studentsResponse = await fetch(`${apiBaseUrl}/api/students`);
      if (!studentsResponse.ok) throw new Error('Failed to fetch students');
      const students = await studentsResponse.json();

      // Fetch recent attendance sessions
      const sessionsResponse = await fetch(`${apiBaseUrl}/api/attendance`);
      const sessions = sessionsResponse.ok ? await sessionsResponse.json() : [];

      // Calculate today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(session =>
        session.date && session.date.startsWith(today)
      );

      let presentToday = 0;
      let totalToday = 0;

      todaySessions.forEach(session => {
        if (session.records) {
          session.records.forEach(record => {
            totalToday++;
            if (record.status === 'present') {
              presentToday++;
            }
          });
        }
      });

      // Get unique classes
      const uniqueClasses = [...new Set(students.map(student => student.class))];

      const attendanceRate = totalToday > 0 ? ((presentToday / totalToday) * 100).toFixed(1) : 0;

      setStats({
        totalStudents: students.length,
        presentToday,
        absentToday: totalToday - presentToday,
        attendanceRate: parseFloat(attendanceRate),
        totalClasses: uniqueClasses.length
      });

      // Get recent 5 sessions
      setRecentSessions(sessions.slice(-5).reverse());

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle session click to show details
  const handleSessionClick = (session) => {
    // Navigate to view attendance with session details
    window.location.href = `/view-attendance?session=${session._id}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 border-primary">
            <Card.Body>
              <Card.Title className="text-primary">Today's Attendance</Card.Title>
              <Card.Text className="display-4 mb-0 text-primary">{stats.attendanceRate}%</Card.Text>
              <Card.Text className="text-muted">
                {stats.presentToday} present, {stats.absentToday} absent
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-success">
            <Card.Body>
              <Card.Title className="text-success">Total Students</Card.Title>
              <Card.Text className="display-4 mb-0 text-success">{stats.totalStudents}</Card.Text>
              <Card.Text className="text-muted">Active students</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-info">
            <Card.Body>
              <Card.Title className="text-info">Classes</Card.Title>
              <Card.Text className="display-4 mb-0 text-info">{stats.totalClasses}</Card.Text>
              <Card.Text className="text-muted">Active classes</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-warning">
            <Card.Body>
              <Card.Title className="text-warning">Sessions Today</Card.Title>
              <Card.Text className="display-4 mb-0 text-warning">
                {recentSessions.filter(s => s.date && s.date.startsWith(new Date().toISOString().split('T')[0])).length}
              </Card.Text>
              <Card.Text className="text-muted">Attendance sessions</Card.Text>
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
                  📝 Take New Attendance
                </Button>
                <Button
                  as={Link}
                  to="/view-attendance"
                  variant="outline-primary"
                  size="lg"
                >
                  📊 View Attendance Records
                </Button>
                <Button
                  as={Link}
                  to="/manage-students"
                  variant="outline-success"
                  size="lg"
                >
                  👥 Manage Students
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Attendance Sessions</Card.Title>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                  <p className="mt-2 mb-0">Loading recent sessions...</p>
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">No recent attendance sessions found</p>
                  <small className="text-muted">Take attendance to see recent sessions here</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentSessions.slice(0, 3).map((session, index) => {
                    const presentCount = session.records ? session.records.filter(r => r.status === 'present').length : 0;
                    const totalCount = session.records ? session.records.length : 0;
                    const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0;
                    const sessionDate = session.date ? new Date(session.date) : new Date();
                    const timeAgo = getTimeAgo(sessionDate);

                    return (
                      <div
                        key={session._id || index}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">
                            {session.subject || 'Unknown Subject'}
                            <Badge bg="primary" className="ms-2">{session.class}</Badge>
                          </h6>
                          <small>{timeAgo}</small>
                        </div>
                        <p className="mb-1">
                          Teacher: {session.teacher || 'Unknown'} |
                          Attendance: {presentCount}/{totalCount} ({attendanceRate}%)
                        </p>
                        <small className="text-muted">
                          <Badge bg={attendanceRate >= 80 ? 'success' : attendanceRate >= 60 ? 'warning' : 'danger'}>
                            {attendanceRate}% Present
                          </Badge>
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}
              {recentSessions.length > 3 && (
                <div className="text-center mt-3">
                  <Button
                    as={Link}
                    to="/view-attendance"
                    variant="outline-primary"
                    size="sm"
                  >
                    View All Sessions
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard; 