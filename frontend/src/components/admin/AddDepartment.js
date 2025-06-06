import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table, Badge, Row, Col } from 'react-bootstrap';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

function AddDepartment() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    sections: ['A', 'B', 'C']
  });
  const [departments, setDepartments] = useState([]);
  const [newSection, setNewSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/departments`);
      if (response.ok) {
        const data = await response.json();
        // Keep full department objects for better display
        setDepartments(data);
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
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add department');
      }

      setSuccess('Department added successfully!');
      setFormData({
        name: '',
        code: '',
        description: '',
        sections: ['A', 'B', 'C']
      });
      fetchDepartments();

      // Trigger refresh in parent components
      if (window.refreshDepartments) {
        window.refreshDepartments();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    if (newSection.trim() && !formData.sections.includes(newSection.trim().toUpperCase())) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, newSection.trim().toUpperCase()]
      }));
      setNewSection('');
    }
  };

  const removeSection = (sectionToRemove) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section !== sectionToRemove)
    }));
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🏢 Add New Department</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science Engineering"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Department Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., CSE"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Department description..."
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Department'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">📝 Manage Sections</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label>Available Sections</Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {formData.sections.map(section => (
                    <Badge
                      key={section}
                      bg="primary"
                      className="fs-6 p-2 d-flex align-items-center gap-2"
                    >
                      {section}
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        style={{ fontSize: '0.7em' }}
                        onClick={() => removeSection(section)}
                      ></button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value.toUpperCase())}
                  placeholder="Add new section (e.g., E)"
                  maxLength={2}
                />
                <Button variant="outline-primary" onClick={addSection}>
                  Add
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">📋 Existing Departments</h5>
        </Card.Header>
        <Card.Body>
          {departments.length === 0 ? (
            <Alert variant="info">No departments found. Add your first department above.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Code</th>
                  <th>Sections</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id}>
                    <td>
                      <strong>{dept.name}</strong>
                      {dept.description && (
                        <>
                          <br />
                          <small className="text-muted">{dept.description}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <Badge bg="secondary">{dept.code || 'N/A'}</Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {dept.sections && dept.sections.length > 0 ? (
                          dept.sections.map(section => (
                            <Badge key={section} bg="info" className="px-2">
                              {section}
                            </Badge>
                          ))
                        ) : (
                          <small className="text-muted">No sections</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={dept.isActive ? 'success' : 'danger'}>
                        {dept.isActive ? '✅ Active' : '❌ Inactive'}
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
  );
}

export default AddDepartment;
