import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Row, Col } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function AddTeacher() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    employeeId: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.department) {
      setError('Name, email, and department are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/teachers`, {
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
        throw new Error('Failed to add teacher');
      }

      setSuccess('Teacher added successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        employeeId: ''
      });
      fetchTeachers();

      // Trigger refresh in parent components
      if (window.refreshTeachers) {
        window.refreshTeachers();
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
              <h5 className="mb-0">👨‍🏫 Add New Teacher</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. John Smith"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john.smith@college.edu"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                  />
                </Form.Group>

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

                <Form.Group className="mb-3">
                  <Form.Label>Designation</Form.Label>
                  <Form.Select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="e.g., EMP001"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Teacher'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📋 Teachers List</h5>
            </Card.Header>
            <Card.Body>
              {teachers.length === 0 ? (
                <Alert variant="info">No teachers found. Add your first teacher.</Alert>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.slice(0, 10).map((teacher) => (
                        <tr key={teacher._id}>
                          <td>
                            <strong>{teacher.name}</strong>
                            {teacher.designation && (
                              <>
                                <br />
                                <small className="text-muted">{teacher.designation}</small>
                              </>
                            )}
                            <br />
                            <small className="text-muted">{teacher.email}</small>
                          </td>
                          <td>{teacher.department}</td>
                          <td>
                            <Badge bg={teacher.isActive ? 'success' : 'secondary'}>
                              {teacher.isActive ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              {teachers.length > 10 && (
                <small className="text-muted">Showing first 10 teachers...</small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddTeacher;
