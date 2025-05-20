import React, { useState } from 'react';
import { Form, Card, Table, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';

function TakeAttendance() {
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    teacher: ''
  });
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching students for class:', formData.class);
      // Fetch students for the specific class - encode the class parameter properly
      const encodedClass = encodeURIComponent(formData.class);
      const response = await fetch(`http://localhost:5000/api/students?class=${encodedClass}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch students');
      }
      const data = await response.json();
      console.log('Received students:', data);
      setStudents(data);
      // Initialize attendance data for each student as 'absent'
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student._id] = 'absent';
      });
      setAttendanceData(initialAttendance);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!formData.class || !formData.subject || !formData.teacher) {
      setError('Please fill in all fields');
      return;
    }
    setSessionStarted(true);
    setError('');
    setSuccess('');
    await fetchStudents();
  };

  const handleMarkAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmitSession = async () => {
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      console.log('Submitting attendance with date:', formattedDate);

      const response = await fetch('http://localhost:5000/api/attendance/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: formData.class,
          subject: formData.subject,
          teacher: formData.teacher,
          date: formattedDate,
          records: Object.entries(attendanceData).map(([studentId, status]) => ({
            student: studentId,
            status: status,
            timestamp: new Date().toISOString()
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save attendance session');
      }

      const result = await response.json();
      setSuccess('Attendance session saved successfully!');

      // Reset form and session
      setFormData({
        class: '',
        subject: '',
        teacher: ''
      });
      setStudents([]);
      setAttendanceData({});
      setSessionStarted(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Take Attendance</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Start New Session</Card.Title>
          <Form onSubmit={handleStartSession}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Class</Form.Label>
                  <Form.Control
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="Enter class (e.g., CSE-2)"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Teacher</Form.Label>
                  <Form.Control
                    type="text"
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                    placeholder="Enter teacher name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button variant="primary" type="submit">
                Start Session
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      {sessionStarted && (
        <Card>
          <Card.Body>
            <Card.Title>Mark Attendance</Card.Title>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                {students.length === 0 ? (
                  <Alert variant="warning">No students found in this class.</Alert>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student._id}>
                          <td>{student.rollNumber}</td>
                          <td>{student.name}</td>
                          <td>
                            <span className={`badge bg-${attendanceData[student._id] === 'present' ? 'success' : 'danger'}`}>
                              {attendanceData[student._id]}
                            </span>
                          </td>
                          <td>
                            <Button
                              variant={attendanceData[student._id] === 'present' ? 'danger' : 'success'}
                              size="sm"
                              onClick={() => handleMarkAttendance(student._id)}
                            >
                              {attendanceData[student._id] === 'present' ? 'Mark Absent' : 'Mark Present'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                <div className="mt-3">
                  <Button variant="primary" onClick={handleSubmitSession}>
                    Submit Attendance
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default TakeAttendance;