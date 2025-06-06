import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Row, Col, Spinner, Tabs, Tab } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function SearchAttendance() {
  const [activeTab, setActiveTab] = useState('search-students');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectAttendanceData, setSubjectAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Subject search fields
  const [subjectCode, setSubjectCode] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Search students
  const handleSearchStudents = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/search/students?query=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search students');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.students);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get attendance by student
  const handleGetAttendance = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/attendance/by-student?query=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.attendanceData);
        setSearchResults(data.students);
      } else {
        throw new Error(data.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError('Failed to fetch attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get attendance by subject
  const handleGetSubjectAttendance = async (e) => {
    e.preventDefault();
    if (!subjectCode.trim()) {
      setError('Please enter a subject code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let url = `${apiBaseUrl}/api/admin/attendance/by-subject?subjectCode=${encodeURIComponent(subjectCode)}`;
      if (department) url += `&department=${encodeURIComponent(department)}`;
      if (section) url += `&section=${encodeURIComponent(section)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch subject attendance');
      }

      const data = await response.json();

      if (data.success) {
        setSubjectAttendanceData(data);
      } else {
        throw new Error(data.message || 'Failed to fetch subject attendance');
      }
    } catch (err) {
      setError('Failed to fetch subject attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/departments`);
      if (response.ok) {
        const data = await response.json();
        const departmentNames = data.map(dept => dept.name);
        setDepartments(departmentNames);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch sections when department changes
  const fetchSections = async (department) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/departments/sections?departmentName=${encodeURIComponent(department)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSections(data.sections);
        } else {
          setSections([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    }
  };

  // Fetch subjects when department changes
  const fetchSubjects = async (department) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/courses/subject-codes?department=${encodeURIComponent(department)}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  };

  return (
    <div>
      <h5 className="mb-4">🔍 Search & Attendance Lookup</h5>
      
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="search-students" title="🔍 Search Students">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Search Students by Name, USN, or Barcode</h6>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSearchStudents}>
                <Row className="g-3 mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Search Query</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter name, USN, or barcode..."
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Search Type</Form.Label>
                      <Form.Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="all">All Fields</option>
                        <option value="name">Name Only</option>
                        <option value="usn">USN Only</option>
                        <option value="barcode">Barcode Only</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Search'}
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h6>Search Results ({searchResults.length} found)</h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>USN</th>
                        <th>Barcode ID</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((student) => (
                        <tr key={student._id}>
                          <td><strong>{student.name}</strong></td>
                          <td>{student.rollNumber}</td>
                          <td>{student.barcodeId}</td>
                          <td>{student.department}</td>
                          <td>
                            <Badge bg="secondary">{student.section}</Badge>
                          </td>
                          <td>
                            <Badge bg={student.isActive !== false ? 'success' : 'danger'}>
                              {student.isActive !== false ? 'Active' : 'Inactive'}
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
        </Tab>

        <Tab eventKey="subject-attendance" title="📚 Subject Attendance">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Get Class Attendance for a Subject</h6>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleGetSubjectAttendance}>
                <Row className="g-3 mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (e.target.value) {
                            fetchSections(e.target.value);
                            fetchSubjects(e.target.value);
                          } else {
                            setSections([]);
                            setSubjects([]);
                          }
                        }}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        disabled={!department}
                      >
                        <option value="">
                          {!department ? 'Select Dept First' : 'Select Section'}
                        </option>
                        {sections.map(sec => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Subject Code *</Form.Label>
                      <Form.Select
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        disabled={!department}
                        required
                      >
                        <option value="">
                          {!department ? 'Select Dept First' : 'Select Subject'}
                        </option>
                        {subjects.map(subject => (
                          <option key={subject.courseCode} value={subject.courseCode}>
                            {subject.courseCode} - {subject.courseName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button variant="info" type="submit" className="w-100" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Get Attendance'}
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {subjectAttendanceData && (
                <div className="mt-4">
                  <Card className="mb-4">
                    <Card.Header>
                      <Row>
                        <Col md={8}>
                          <h6 className="mb-0">Subject: {subjectAttendanceData.subjectCode}</h6>
                          <small className="text-muted">
                            {subjectAttendanceData.department && `Department: ${subjectAttendanceData.department}`}
                            {subjectAttendanceData.section && ` | Section: ${subjectAttendanceData.section}`}
                          </small>
                        </Col>
                        <Col md={4} className="text-end">
                          <h5>
                            <Badge bg="info">
                              Class Average: {subjectAttendanceData.classAverage}%
                            </Badge>
                          </h5>
                          <small className="text-muted">
                            {subjectAttendanceData.totalSessions} sessions | {subjectAttendanceData.totalStudents} students
                          </small>
                        </Col>
                      </Row>
                    </Card.Header>
                    <Card.Body>
                      {subjectAttendanceData.studentSummary.length === 0 ? (
                        <Alert variant="info">No attendance records found for this subject.</Alert>
                      ) : (
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>USN</th>
                              <th>Barcode</th>
                              <th>Present</th>
                              <th>Absent</th>
                              <th>Total</th>
                              <th>Percentage</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subjectAttendanceData.studentSummary.map((studentData) => (
                              <tr key={studentData.student._id}>
                                <td><strong>{studentData.student.name}</strong></td>
                                <td>{studentData.student.rollNumber}</td>
                                <td>{studentData.student.barcodeId}</td>
                                <td>
                                  <Badge bg="success">{studentData.presentClasses}</Badge>
                                </td>
                                <td>
                                  <Badge bg="danger">{studentData.absentClasses}</Badge>
                                </td>
                                <td>{studentData.totalClasses}</td>
                                <td>
                                  <Badge bg={getAttendanceColor(studentData.percentage)}>
                                    {studentData.percentage}%
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={studentData.percentage >= 75 ? 'success' : 'danger'}>
                                    {studentData.percentage >= 75 ? '✅ Good' : '⚠️ Low'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="attendance-lookup" title="📊 Attendance Lookup">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Get Student Attendance by Name, USN, or Barcode</h6>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleGetAttendance}>
                <Row className="g-3 mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Search Query</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter name, USN, or barcode..."
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Search Type</Form.Label>
                      <Form.Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="all">All Fields</option>
                        <option value="name">Name Only</option>
                        <option value="usn">USN Only</option>
                        <option value="barcode">Barcode Only</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button variant="success" type="submit" className="w-100" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Get Attendance'}
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {attendanceData.length > 0 && (
                <div className="mt-4">
                  {attendanceData.map((studentData) => (
                    <Card key={studentData.student._id} className="mb-4">
                      <Card.Header>
                        <Row>
                          <Col md={8}>
                            <h6 className="mb-0">{studentData.student.name}</h6>
                            <small className="text-muted">
                              USN: {studentData.student.rollNumber} | 
                              Barcode: {studentData.student.barcodeId} | 
                              {studentData.student.department} - {studentData.student.section}
                            </small>
                          </Col>
                          <Col md={4} className="text-end">
                            <h5>
                              <Badge bg={getAttendanceColor(studentData.overallPercentage)}>
                                Overall: {studentData.overallPercentage}%
                              </Badge>
                            </h5>
                            <small className="text-muted">
                              {studentData.totalPresent}/{studentData.totalClasses} classes
                            </small>
                          </Col>
                        </Row>
                      </Card.Header>
                      <Card.Body>
                        {studentData.subjects.length === 0 ? (
                          <Alert variant="info">No attendance records found for this student.</Alert>
                        ) : (
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Classes Attended</th>
                                <th>Total Classes</th>
                                <th>Percentage</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentData.subjects.map((subject) => (
                                <tr key={`${studentData.student._id}-${subject.subjectCode}`}>
                                  <td><strong>{subject.subjectCode}</strong></td>
                                  <td>{subject.presentClasses}</td>
                                  <td>{subject.totalClasses}</td>
                                  <td>
                                    <Badge bg={getAttendanceColor(subject.percentage)}>
                                      {subject.percentage}%
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge bg={subject.percentage >= 75 ? 'success' : 'danger'}>
                                      {subject.percentage >= 75 ? '✅ Good' : '⚠️ Low'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default SearchAttendance;
