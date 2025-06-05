import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function ViewAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filters, setFilters] = useState({
    date: '',
    class: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        date: filters.date,
        class: filters.class,
        subject: filters.subject
      }).toString();
      
      console.log('Search Parameters:', filters);
      const apiUrl = `${apiBaseUrl}/api/attendance/records?${queryParams}`;
      console.log('Query URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch attendance records');
      }

      console.log('Response Data:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setAttendanceRecords(data.data);
        if (data.data.length === 0) {
          setError('No attendance records found for the selected date, class, and subject.');
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Search Error:', err);
      setError(err.message);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setSelectedRecord(null); // Clear previous selected record
    
    if (!filters.date || !filters.class || !filters.subject) {
      setError('Please fill in all fields: date, class, and subject');
      return;
    }
    
    // Format date to YYYY-MM-DD
    let formattedDate = filters.date;
    if (filters.date) {
      const date = new Date(filters.date);
      if (isNaN(date.getTime())) {
        setError('Invalid date format. Please use YYYY-MM-DD format.');
        return;
      }
      // Format to YYYY-MM-DD
      formattedDate = date.toISOString().split('T')[0];
    }
    
    // Update filters with formatted date
    setFilters(prev => ({
      ...prev,
      date: formattedDate
    }));
    
    console.log('Searching with parameters:', {
      date: formattedDate,
      class: filters.class,
      subject: filters.subject
    });
    
    fetchAttendanceRecords();
  };

  const handleViewDetails = async (recordId) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/attendance/records/${recordId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch record details');
      }
      
      if (data.success) {
        setSelectedRecord(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch record details');
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Convert attendance records to CSV
    const headers = ['Date', 'Class', 'Subject', 'Teacher', 'Present', 'Absent', 'Total'];
    const csvData = attendanceRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.class,
      record.subject,
      record.teacher,
      record.presentCount,
      record.absentCount,
      record.totalStudents
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="mb-4">View Attendance Records</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Search Records</Card.Title>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Class</Form.Label>
                  <Form.Control
                    type="text"
                    name="class"
                    value={filters.class}
                    onChange={handleFilterChange}
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
                    value={filters.subject}
                    onChange={handleFilterChange}
                    placeholder="Enter subject"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button variant="primary" type="submit">
                Search
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

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">Attendance Records</Card.Title>
            {attendanceRecords.length > 0 && (
              <Button variant="outline-primary" onClick={handleExport}>
                Export to CSV
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {attendanceRecords.length === 0 ? (
                <Alert variant="info">No records found. Try different search criteria.</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.class}</td>
                        <td>{record.subject}</td>
                        <td>{record.teacher}</td>
                        <td>{record.presentCount}</td>
                        <td>{record.absentCount}</td>
                        <td>{record.totalStudents}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(record._id)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {selectedRecord && (
                <Card className="mt-4">
                  <Card.Body>
                    <Card.Title>Attendance Details</Card.Title>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Roll No</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.records.map((record) => (
                          <tr key={record.studentId}>
                            <td>{record.rollNumber}</td>
                            <td>{record.name}</td>
                            <td>
                              <span className={`badge bg-${record.status === 'present' ? 'success' : 'danger'}`}>
                                {record.status}
                              </span>
                            </td>
                            <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default ViewAttendance; 
