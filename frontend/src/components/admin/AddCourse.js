import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Row, Col } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function AddCourse() {
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    department: '',
    semester: '',
    credits: '',
    courseType: 'Theory',
    teacherId: '',
    academicYear: '2023-24'
  });
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

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

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/teachers`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim() || !formData.courseCode.trim() || !formData.department) {
      setError('Course name, code, and department are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isActive: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      setSuccess('Course added successfully!');
      setFormData({
        courseName: '',
        courseCode: '',
        department: '',
        semester: '',
        credits: '',
        courseType: 'Theory',
        teacherId: '',
        academicYear: '2023-24'
      });
      fetchCourses();

      // Trigger refresh in parent components
      if (window.refreshCourses) {
        window.refreshCourses();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">📚 Add New Course</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    placeholder="e.g., Data Structures and Algorithms"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    placeholder="e.g., CS301"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department *</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Semester</Form.Label>
                      <Form.Select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Semester</option>
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Credits</Form.Label>
                      <Form.Select
                        name="credits"
                        value={formData.credits}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Credits</option>
                        {[1,2,3,4,5,6].map(credit => (
                          <option key={credit} value={credit}>{credit}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Course Type</Form.Label>
                      <Form.Select
                        name="courseType"
                        value={formData.courseType}
                        onChange={handleInputChange}
                      >
                        <option value="Theory">Theory</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Lab">Lab</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Assigned Teacher</Form.Label>
                  <Form.Select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.department})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    placeholder="e.g., 2023-24"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Course'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📋 Courses List</h5>
            </Card.Header>
            <Card.Body>
              {courses.length === 0 ? (
                <Alert variant="info">No courses found. Add your first course.</Alert>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Department</th>
                        <th>Teacher</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.slice(0, 15).map((course) => (
                        <tr key={course._id}>
                          <td>
                            <strong>{course.courseCode}</strong>
                            <br />
                            <small className="text-muted">{course.courseName}</small>
                            <br />
                            <Badge bg="secondary" className="me-1">Sem {course.semester}</Badge>
                            <Badge bg="info">{course.credits} Credits</Badge>
                          </td>
                          <td>{course.department}</td>
                          <td>
                            {course.teacherId ? (
                              <small>{course.teacherId.name || 'Assigned'}</small>
                            ) : (
                              <small className="text-muted">Not assigned</small>
                            )}
                          </td>
                          <td>
                            <Badge bg={course.isActive ? 'success' : 'secondary'}>
                              {course.isActive ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              {courses.length > 15 && (
                <small className="text-muted">Showing first 15 courses...</small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddCourse;
