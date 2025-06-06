import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Row, Col } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function AddStudent() {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    barcodeId: '',
    email: '',
    department: '',
    section: '',
    semester: '',
    academicYear: '2023-24'
  });
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  // Fetch sections when department changes
  const fetchSections = async (department) => {
    try {
      console.log('🔍 [AddStudent] Fetching sections for department:', department);
      const url = `${apiBaseUrl}/api/departments/sections?departmentName=${encodeURIComponent(department)}`;
      console.log('🔍 [AddStudent] Request URL:', url);

      const response = await fetch(url);
      console.log('🔍 [AddStudent] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [AddStudent] Response data:', data);

        if (data.success) {
          console.log('✅ [AddStudent] Sections fetched successfully:', data.sections);
          setSections(data.sections);
        } else {
          console.error('❌ [AddStudent] Error fetching sections:', data.message);
          setSections([]);
        }
      } else {
        console.error('❌ [AddStudent] Response not ok:', response.status);
        setSections([]);
      }
    } catch (error) {
      console.error('❌ [AddStudent] Error fetching sections:', error);
      setSections([]);
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
    if (!formData.name.trim() || !formData.rollNumber.trim() || !formData.barcodeId.trim() || !formData.department) {
      setError('Name, USN, Barcode ID, and department are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/students`, {
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
        throw new Error('Failed to add student');
      }

      setSuccess('Student added successfully!');
      setFormData({
        name: '',
        rollNumber: '',
        barcodeId: '',
        email: '',
        department: '',
        section: '',
        semester: '',
        academicYear: '2023-24'
      });
      fetchStudents();

      // Trigger refresh in parent components
      if (window.refreshStudents) {
        window.refreshStudents();
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
              <h5 className="mb-0">👨‍🎓 Add New Student</h5>
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
                    placeholder="e.g., John Doe"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>USN (Roll Number) *</Form.Label>
                      <Form.Control
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., 1MS22CS076"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Barcode ID *</Form.Label>
                      <Form.Control
                        type="text"
                        name="barcodeId"
                        value={formData.barcodeId}
                        onChange={handleInputChange}
                        placeholder="e.g., 22CS125"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john.doe@college.edu"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department *</Form.Label>
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
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        disabled={!formData.department}
                      >
                        <option value="">
                          {!formData.department ? 'Select Department First' : 'Select Section'}
                        </option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
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
                  <Col md={6}>
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
                  </Col>
                </Row>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Student'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📋 Students List</h5>
            </Card.Header>
            <Card.Body>
              {students.length === 0 ? (
                <Alert variant="info">No students found. Add your first student.</Alert>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Department</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 15).map((student) => (
                        <tr key={student._id}>
                          <td>
                            <strong>{student.name}</strong>
                            <br />
                            <small className="text-muted">USN: {student.rollNumber}</small>
                            <br />
                            <small className="text-muted">Barcode: {student.barcodeId}</small>
                            <br />
                            <Badge bg="secondary" className="me-1">Sec {student.section}</Badge>
                            <Badge bg="info">Sem {student.semester}</Badge>
                          </td>
                          <td>{student.department}</td>
                          <td>
                            <Badge bg={student.isActive ? 'success' : 'secondary'}>
                              {student.isActive ? '✅ Active' : '❌ Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              {students.length > 15 && (
                <small className="text-muted">Showing first 15 students...</small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AddStudent;
