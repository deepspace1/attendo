import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
console.log('🔍 API Base URL:', apiBaseUrl);
console.log('🔍 All env vars:', process.env);

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
  const [barcode, setBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedStudents, setScannedStudents] = useState([]);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching students for class:', formData.class);
      // Fetch students for the specific class - encode the class parameter properly
      const encodedClass = encodeURIComponent(formData.class);
      const response = await fetch(`${apiBaseUrl}/api/students?class=${encodedClass}`);

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

  const processScannedBarcode = async (scannedBarcode) => {
    if (!sessionStarted) {
      setError('Please start an attendance session first');
      setBarcode('');
      return;
    }

    if (!scannedBarcode || scannedBarcode.length === 0) {
      setBarcode('');
      return;
    }

    try {
      setError(''); // Clear previous errors

      // Fetch student by barcode
      const res = await fetch(`${apiBaseUrl}/api/students/barcode/${scannedBarcode}`);
      if (!res.ok) {
        throw new Error('Student not found');
      }

      const student = await res.json();

      // Check if student belongs to current class
      const studentInClass = students.find(s => s._id === student._id);
      if (!studentInClass) {
        setError(`Student ${student.name} is not in class ${formData.class}`);
        setBarcode('');
        return;
      }

      // Toggle attendance status (present ↔ absent)
      const currentStatus = attendanceData[student._id];
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';

      setAttendanceData(prev => ({
        ...prev,
        [student._id]: newStatus
      }));

      // Add to scanned students list
      setScannedStudents(prev => {
        const newList = [...prev];
        const existingIndex = newList.findIndex(s => s._id === student._id);
        if (existingIndex >= 0) {
          newList[existingIndex] = { ...studentInClass, timestamp: new Date(), status: newStatus };
        } else {
          newList.unshift({ ...studentInClass, timestamp: new Date(), status: newStatus });
        }
        return newList.slice(0, 10); // Keep only last 10 scanned students
      });

      // Show success message
      setLastScannedStudent({
        ...studentInClass,
        status: newStatus
      });
      setSuccess(`✅ ${student.name} marked as ${newStatus.toUpperCase()}`);

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess('');
        setLastScannedStudent(null);
      }, 2000);

    } catch (err) {
      setError(`❌ Student not found for barcode: ${scannedBarcode}`);

      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      // Always clear the barcode input for next scan
      setBarcode('');

      // Refocus the input field for continuous scanning
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Focus here for scanner"]');
        if (input) {
          input.focus();
        }
      }, 100);
    }
  };

  const handleScannedStudent = (student) => {
    // Check if session is started
    if (!sessionStarted) {
      setError('Please start an attendance session first');
      return;
    }

    // Check if student belongs to current class
    const studentInClass = students.find(s => s._id === student._id || s._id === student.id);
    if (!studentInClass) {
      setError(`Student ${student.name} is not in class ${formData.class}`);
      return;
    }

    // Use the correct student ID from the database
    const studentId = studentInClass._id;

    // Mark student as present
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: 'present'
    }));

    // Add to scanned students list
    setScannedStudents(prev => {
      const newList = [...prev];
      const existingIndex = newList.findIndex(s => s._id === studentId);
      if (existingIndex >= 0) {
        newList[existingIndex] = { ...studentInClass, timestamp: new Date() };
      } else {
        newList.unshift({ ...studentInClass, timestamp: new Date() });
      }
      return newList.slice(0, 10); // Keep only last 10 scanned students
    });

    setLastScannedStudent(studentInClass);
    setError(''); // Clear any previous errors

    // Clear the last scanned student after 3 seconds
    setTimeout(() => {
      setLastScannedStudent(null);
    }, 3000);
  };

  const handleSubmitSession = async () => {
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      console.log('Submitting attendance with date:', formattedDate);

      const response = await fetch(`${apiBaseUrl}/api/attendance/session`, {
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

  const handleStartScanner = () => {
    setShowScanner(true);
  };

  // Listen for barcode scans from native camera page
  useEffect(() => {
    const handleStorageChange = () => {
      const scannedData = localStorage.getItem('scannedStudent');
      if (scannedData) {
        try {
          const { student, timestamp } = JSON.parse(scannedData);
          // Only process if the scan is recent (within last 5 seconds)
          if (Date.now() - timestamp < 5000) {
            handleScannedStudent(student);
            localStorage.removeItem('scannedStudent'); // Clear after processing
          }
        } catch (error) {
          console.error('Error processing scanned student data:', error);
        }
      }
    };

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also check on component mount
    handleStorageChange();

    // Listen for postMessage events (from iframe)
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'BARCODE_SCANNED') {
        handleScannedStudent(event.data.student);
      }
    };
    window.addEventListener('message', handleMessage);

    // Listen for custom events
    const handleCustomEvent = (event) => {
      if (event.detail && event.detail.student) {
        handleScannedStudent(event.detail.student);
      }
    };
    window.addEventListener('studentScanned', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('studentScanned', handleCustomEvent);
    };
  }, [sessionStarted, students, formData.class]);

  useEffect(() => {
    if (showScanner) {
      const readerElement = document.getElementById('reader');
      if (readerElement) {
        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
        scanner.render(
          async (decodedText) => {
            try {
              const res = await fetch(`${apiBaseUrl}/api/students/barcode/${decodedText}`);
              if (!res.ok) throw new Error('Student not found');
              const student = await res.json();
              handleMarkAttendance(student._id);
              scanner.clear(); // Stop the scanner after a successful scan
              setShowScanner(false);
            } catch (err) {
              alert('Student not found for barcode: ' + decodedText);
            }
          },
          (error) => {
            console.error('QR Code scanning error:', error);
          }
        );
      }
    }
  }, [showScanner]);

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

      {lastScannedStudent && (
        <Alert variant={lastScannedStudent.status === 'present' ? 'success' : 'warning'} className="mb-4">
          <strong>{lastScannedStudent.status === 'present' ? '✅' : '❌'} Scanned:</strong> {lastScannedStudent.name} ({lastScannedStudent.rollNumber}) - Marked {lastScannedStudent.status?.toUpperCase() || 'PRESENT'}
        </Alert>
      )}

      {sessionStarted && (
        <>
          {scannedStudents.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>📱 Recent Barcode Scans</Card.Title>
                <div className="d-flex flex-wrap gap-2">
                  {scannedStudents.slice(0, 5).map((student, index) => (
                    <span
                      key={`${student._id}-${index}`}
                      className={`badge ${student.status === 'present' ? 'bg-success' : 'bg-warning'} fs-6`}
                    >
                      {student.status === 'present' ? '✅' : '❌'} {student.name} ({student.rollNumber})
                    </span>
                  ))}
                </div>
                <small className="text-muted">
                  Open the barcode scanner on your mobile: <strong>http://your-ip/native-camera.html</strong>
                </small>
              </Card.Body>
            </Card>
          )}

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
        </>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>📱 Third-Party Scanner Input</Card.Title>
          <p className="text-muted">
            This field automatically processes scanned barcodes from your third-party scanner service.
            The scanner should send the student ID to this input field.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Barcode Scanner Input</Form.Label>
            <Form.Control
              type="text"
              placeholder="Focus here for scanner input..."
              value={barcode}
              onChange={async (e) => {
                const scannedValue = e.target.value;
                setBarcode(scannedValue);

                // Auto-process when barcode is complete (you can adjust the length)
                if (scannedValue.length >= 6) { // Adjust this based on your barcode length
                  await processScannedBarcode(scannedValue);
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const scannedBarcode = barcode.trim();
                  if (scannedBarcode.length === 0) return;
                  await processScannedBarcode(scannedBarcode);
                }
              }}
              onBlur={async () => {
                // Process when field loses focus (in case scanner doesn't trigger onChange)
                if (barcode.trim().length > 0) {
                  await processScannedBarcode(barcode.trim());
                }
              }}
              autoFocus
              style={{
                fontSize: '18px',
                padding: '12px',
                border: '3px solid #007bff',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}
            />
          </Form.Group>

          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-info">Status:</span>
            <span className={`badge ${sessionStarted ? 'bg-success' : 'bg-warning'}`}>
              {sessionStarted ? 'Ready for scanning' : 'Start session first'}
            </span>
          </div>
        </Card.Body>
      </Card>

      {showScanner && <div id="reader" style={{ width: '100%' }}></div>}

      <div className="mt-3">
        <Button variant="secondary" onClick={handleStartScanner} disabled={showScanner}>
          {showScanner ? 'Scanning...' : 'Start Camera Scanner'}
        </Button>
      </div>
    </div>
  );
}

export default TakeAttendance;