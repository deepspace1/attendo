import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Row, Col, Button, Spinner, Alert, Nav, Tab, Badge, ProgressBar } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function ViewRecords() {
  const [activeView, setActiveView] = useState('subject-wise');
  const [formData, setFormData] = useState({
    date: '',
    department: '',
    section: '',
    subjectCode: '',
    studentId: ''
  });

  const [records, setRecords] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [classOverview, setClassOverview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDepartments();

    // Set up global refresh functions
    window.refreshCourses = () => {
      if (formData.department) {
        fetchSubjects(formData.department);
      }
    };
    window.refreshStudents = () => {
      if (formData.department && formData.section) {
        fetchStudents();
      }
    };

    return () => {
      // Cleanup
      delete window.refreshCourses;
      delete window.refreshStudents;
    };
  }, [formData.department, formData.section]);

  // Fetch students when department and section change
  useEffect(() => {
    if (formData.department && formData.section) {
      fetchStudents();
    }
  }, [formData.department, formData.section]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/departments`);
      if (response.ok) {
        const data = await response.json();
        // Extract department names from the department objects
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
      console.log('🔍 [ViewRecords] Fetching sections for department:', department);
      const url = `${apiBaseUrl}/api/departments/sections?departmentName=${encodeURIComponent(department)}`;
      console.log('🔍 [ViewRecords] Sections request URL:', url);

      const response = await fetch(url);
      console.log('🔍 [ViewRecords] Sections response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [ViewRecords] Sections response data:', data);

        if (data.success) {
          console.log('✅ [ViewRecords] Sections fetched successfully:', data.sections);
          setSections(data.sections);
        } else {
          console.error('❌ [ViewRecords] Error fetching sections:', data.message);
          setSections([]);
        }
      } else {
        console.error('❌ [ViewRecords] Sections response not ok:', response.status);
        setSections([]);
      }
    } catch (error) {
      console.error('❌ [ViewRecords] Error fetching sections:', error);
      setSections([]);
    }
  };

  // Fetch subjects when department changes
  const fetchSubjects = async (department) => {
    try {
      console.log('🔍 [ViewRecords] Fetching subjects for department:', department);
      const url = `${apiBaseUrl}/api/courses/subject-codes?department=${encodeURIComponent(department)}`;
      console.log('🔍 [ViewRecords] Subjects request URL:', url);

      const response = await fetch(url);
      console.log('🔍 [ViewRecords] Subjects response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [ViewRecords] Subjects response data:', data);
        setSubjects(data);
      } else {
        console.error('❌ [ViewRecords] Subjects response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ [ViewRecords] Subjects error response:', errorText);
        setSubjects([]);
      }
    } catch (error) {
      console.error('❌ [ViewRecords] Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  // Fetch students for student-wise view
  const fetchStudents = async () => {
    try {
      console.log('🔍 [ViewRecords] Fetching students for:', formData.department, formData.section);
      const url = `${apiBaseUrl}/api/students?department=${encodeURIComponent(formData.department)}&section=${encodeURIComponent(formData.section)}`;
      console.log('🔍 [ViewRecords] Students request URL:', url);

      const response = await fetch(url);
      console.log('🔍 [ViewRecords] Students response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [ViewRecords] Students response data:', data);
        setStudents(data);
      } else {
        console.error('❌ [ViewRecords] Students response not ok:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ [ViewRecords] Error fetching students:', error);
      setStudents([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch subject-wise attendance (all students for one subject)
  const fetchSubjectWiseAttendance = async () => {
    if (!formData.department || !formData.section || !formData.subjectCode) {
      setError('Please select department, section, and subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/attendance/subject-wise?department=${formData.department}&section=${formData.section}&subjectCode=${formData.subjectCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      setSubjectAttendance(data);
    } catch (err) {
      setError('Failed to fetch attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student-wise attendance (one student, all subjects)
  const fetchStudentWiseAttendance = async () => {
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/attendance/student-wise?studentId=${formData.studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student attendance');
      }

      const data = await response.json();
      setStudentProfile(data);
    } catch (err) {
      setError('Failed to fetch student attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch class overview
  const fetchClassOverview = async () => {
    if (!formData.department || !formData.section) {
      setError('Please select department and section');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/attendance/class-overview?department=${formData.department}&section=${formData.section}`);
      if (!response.ok) {
        throw new Error('Failed to fetch class overview');
      }

      const data = await response.json();
      setClassOverview(data);
    } catch (err) {
      setError('Failed to fetch class overview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Legacy function for date-wise records
  const fetchRecords = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.department || !formData.section || !formData.subjectCode) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        date: formData.date,
        department: formData.department,
        section: formData.section,
        subjectCode: formData.subjectCode
      });

      const response = await fetch(`${apiBaseUrl}/api/attendance/records?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get attendance color
  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  };

  return (
    <div>
      <h1 className="mb-4">📊 Attendance Management</h1>

      <Tab.Container activeKey={activeView} onSelect={(k) => setActiveView(k)}>
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="subject-wise">
                  📚 Subject-wise View
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="student-wise">
                  👨‍🎓 Student Profile
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="class-overview">
                  🏫 Class Overview
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="date-wise">
                  📅 Date-wise Records
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Subject-wise View */}
              <Tab.Pane eventKey="subject-wise">
                <h5>📚 Subject-wise Attendance Overview</h5>
                <p className="text-muted">View all students' attendance for a specific subject</p>

                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={(e) => {
                          handleInputChange(e);
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        disabled={!formData.department}
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Select
                        name="subjectCode"
                        value={formData.subjectCode}
                        onChange={handleInputChange}
                        disabled={!formData.department}
                      >
                        <option value="">Select Subject</option>
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
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={fetchSubjectWiseAttendance}
                        disabled={!formData.department || !formData.section || !formData.subjectCode}
                      >
                        View
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                {subjectAttendance.length > 0 && (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Classes Attended</th>
                        <th>Total Classes</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectAttendance.map((student, index) => (
                        <tr key={index}>
                          <td>{student.rollNumber}</td>
                          <td>{student.studentName}</td>
                          <td>{student.classesAttended}</td>
                          <td>{student.totalClasses}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <ProgressBar
                                variant={getAttendanceColor(student.percentage)}
                                now={student.percentage}
                                style={{ width: '100px', marginRight: '10px' }}
                              />
                              <strong>{student.percentage}%</strong>
                            </div>
                          </td>
                          <td>
                            <Badge bg={getAttendanceColor(student.percentage)}>
                              {student.percentage >= 75 ? '✅ Good' : '⚠️ Low'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>

              {/* Student-wise View */}
              <Tab.Pane eventKey="student-wise">
                <h5>👨‍🎓 Individual Student Attendance Profile</h5>
                <p className="text-muted">View a student's attendance across all subjects</p>

                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.value) {
                            fetchSections(e.target.value);
                          } else {
                            setSections([]);
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Fetch students when both department and section are selected
                          if (formData.department && e.target.value) {
                            setTimeout(() => fetchStudents(), 100); // Small delay to ensure state is updated
                          } else {
                            setStudents([]);
                          }
                        }}
                        disabled={!formData.department}
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Student</Form.Label>
                      <Form.Select
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        disabled={!formData.department || !formData.section}
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.rollNumber} - {student.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={fetchStudentWiseAttendance}
                        disabled={!formData.studentId}
                      >
                        View
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                {studentProfile && (
                  <div>
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <h5>{studentProfile.studentName}</h5>
                            <p className="mb-1"><strong>Roll Number:</strong> {studentProfile.rollNumber}</p>
                            <p className="mb-1"><strong>Department:</strong> {studentProfile.department}</p>
                            <p className="mb-0"><strong>Section:</strong> {studentProfile.section}</p>
                          </Col>
                          <Col md={4} className="text-end">
                            <h3>
                              <Badge bg={getAttendanceColor(studentProfile.overallPercentage)}>
                                Overall: {studentProfile.overallPercentage}%
                              </Badge>
                            </h3>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Classes Attended</th>
                          <th>Total Classes</th>
                          <th>Attendance %</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentProfile.subjects.map((subject, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{subject.subjectCode}</strong>
                              <br />
                              <small className="text-muted">{subject.subjectName}</small>
                            </td>
                            <td>{subject.classesAttended}</td>
                            <td>{subject.totalClasses}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <ProgressBar
                                  variant={getAttendanceColor(subject.percentage)}
                                  now={subject.percentage}
                                  style={{ width: '100px', marginRight: '10px' }}
                                />
                                <strong>{subject.percentage}%</strong>
                              </div>
                            </td>
                            <td>
                              <Badge bg={getAttendanceColor(subject.percentage)}>
                                {subject.percentage >= 75 ? '✅ Good' : '⚠️ Low'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>

              {/* Class Overview */}
              <Tab.Pane eventKey="class-overview">
                <h5>🏫 Class Attendance Overview</h5>
                <p className="text-muted">View attendance summary for entire class</p>

                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.value) {
                            fetchSections(e.target.value);
                          } else {
                            setSections([]);
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        disabled={!formData.department}
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={fetchClassOverview}
                        disabled={!formData.department || !formData.section}
                      >
                        View Overview
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                {classOverview.length > 0 && (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Total Students</th>
                        <th>Avg Attendance</th>
                        <th>Students &gt; 75%</th>
                        <th>Students &lt; 75%</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classOverview.map((subject, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{subject.subjectCode}</strong>
                            <br />
                            <small className="text-muted">{subject.subjectName}</small>
                          </td>
                          <td>{subject.totalStudents}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <ProgressBar
                                variant={getAttendanceColor(subject.averageAttendance)}
                                now={subject.averageAttendance}
                                style={{ width: '80px', marginRight: '10px' }}
                              />
                              <strong>{subject.averageAttendance}%</strong>
                            </div>
                          </td>
                          <td>
                            <Badge bg="success">{subject.studentsAbove75}</Badge>
                          </td>
                          <td>
                            <Badge bg="danger">{subject.studentsBelow75}</Badge>
                          </td>
                          <td>
                            <Badge bg={getAttendanceColor(subject.averageAttendance)}>
                              {subject.averageAttendance >= 75 ? '✅ Good' : '⚠️ Needs Attention'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab.Pane>

              {/* Date-wise Records (Legacy) */}
              <Tab.Pane eventKey="date-wise">
                <h5>📅 Date-wise Attendance Records</h5>
                <p className="text-muted">View attendance records for a specific date</p>

                  <Form onSubmit={fetchRecords}>
                  <Row className="g-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={(e) => {
                            handleInputChange(e);
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
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Section</Form.Label>
                        <Form.Select
                          name="section"
                          value={formData.section}
                          onChange={handleInputChange}
                          disabled={!formData.department}
                        >
                          <option value="">Select Section</option>
                          {sections.map(section => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Subject Code</Form.Label>
                        <Form.Select
                          name="subjectCode"
                          value={formData.subjectCode}
                          onChange={handleInputChange}
                          disabled={!formData.department}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject.courseCode} value={subject.courseCode}>
                              {subject.courseCode} - {subject.courseName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    <Button variant="primary" type="submit">
                      View Records
                    </Button>
                  </div>
                </Form>

                {records.length > 0 && (
                  <div className="mt-4">
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>USN</th>
                          <th>Barcode ID</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record, index) => (
                          <tr key={`${record.rollNumber}-${index}`}>
                            <td>{record.studentName}</td>
                            <td>{record.rollNumber}</td>
                            <td>{record.barcodeId}</td>
                            <td>
                              <span className={`badge bg-${record.status === 'present' ? 'success' : 'danger'}`}>
                                {record.status}
                              </span>
                            </td>
                            <td>{new Date(record.date).toLocaleDateString()}</td>
                            <td>{record.subject}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </div>
  );
}

export default ViewRecords;
