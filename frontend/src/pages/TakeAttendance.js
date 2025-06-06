import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Row, Col, Button, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
console.log('🔍 API Base URL:', apiBaseUrl);
console.log('🔍 All env vars:', process.env);

function TakeAttendance() {
  const [formData, setFormData] = useState({
    department: '',
    section: '',
    subjectCode: '',
    teacher: ''
  });

  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
  const [toasts, setToasts] = useState([]);

  // Function to show toast notifications
  const showToast = (message, variant = 'success', student = null) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      variant,
      student,
      timestamp: new Date()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  // Function to remove toast manually
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchTeachers();

    // Set up global refresh functions
    window.refreshDepartments = fetchDepartments;
    window.refreshTeachers = fetchTeachers;

    return () => {
      // Cleanup
      delete window.refreshDepartments;
      delete window.refreshTeachers;
    };
  }, []);

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
      console.log('🔍 Fetching sections for department:', department);
      const url = `${apiBaseUrl}/api/departments/sections?departmentName=${encodeURIComponent(department)}`;
      console.log('🔍 Request URL:', url);

      const response = await fetch(url);
      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);

        if (data.success) {
          console.log('✅ Sections fetched successfully:', data.sections);
          setSections(data.sections);
        } else {
          console.error('❌ Error fetching sections:', data.message);
          setSections([]);
        }
      } else {
        console.error('❌ Response not ok:', response.status);
        setSections([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sections:', error);
      setSections([]);
    }
  };

  // Fetch subjects when department changes
  const fetchSubjects = async (department) => {
    try {
      console.log('🔍 Fetching subjects for department:', department);
      const url = `${apiBaseUrl}/api/courses/subject-codes?department=${encodeURIComponent(department)}`;
      console.log('🔍 Subjects request URL:', url);

      const response = await fetch(url);
      console.log('🔍 Subjects response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Subjects response data:', data);
        setSubjects(data);
      } else {
        console.error('❌ Subjects response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ Subjects error response:', errorText);
        setSubjects([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  // Fetch teachers
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

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching students for department:', formData.department, 'section:', formData.section);
      // Fetch students for the specific department and section
      const response = await fetch(`${apiBaseUrl}/api/students?department=${formData.department}&section=${formData.section}`);

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
    if (!formData.department || !formData.section || !formData.subjectCode || !formData.teacher) {
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
        setError(`Student ${student.name} is not in ${formData.department} section ${formData.section}`);
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

      // Show toast notification
      showToast(
        `${student.name} marked as ${newStatus.toUpperCase()}`,
        newStatus === 'present' ? 'success' : 'warning',
        {
          ...studentInClass,
          status: newStatus
        }
      );

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess('');
        setLastScannedStudent(null);
      }, 2000);

    } catch (err) {
      setError(`❌ Student not found for barcode: ${scannedBarcode}`);

      // Show error toast notification
      showToast(
        `Student not found for barcode: ${scannedBarcode}`,
        'danger'
      );

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
      setError(`Student ${student.name} is not in ${formData.department} section ${formData.section}`);
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
          department: formData.department,
          section: formData.section,
          subjectCode: formData.subjectCode,
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
        department: '',
        section: '',
        subjectCode: '',
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
  }, [sessionStarted, students, formData.department, formData.section]);

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

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={4000}
            autohide
            bg={toast.variant}
            className="text-white"
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">
                {toast.variant === 'success' ? '✅ Attendance Marked' :
                 toast.variant === 'warning' ? '⚠️ Status Changed' :
                 '❌ Scan Error'}
              </strong>
              <small>{toast.timestamp.toLocaleTimeString()}</small>
            </Toast.Header>
            <Toast.Body>
              {toast.student ? (
                <div>
                  <strong>{toast.student.name}</strong>
                  <br />
                  <small>USN: {toast.student.rollNumber}</small>
                  <br />
                  <small>Barcode: {toast.student.barcodeId}</small>
                  <br />
                  <span className={`badge bg-${toast.student.status === 'present' ? 'success' : 'warning'} mt-1`}>
                    {toast.student.status?.toUpperCase() || 'PRESENT'}
                  </span>
                </div>
              ) : (
                toast.message
              )}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Start New Session</Card.Title>
          <Form onSubmit={handleStartSession}>
            <Row className="g-3">
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
                    <option value="">
                      {!formData.department ? 'Select Department First' :
                       sections.length === 0 ? 'Loading sections...' : 'Select Section'}
                    </option>
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    disabled={!formData.department}
                  >
                    <option value="">
                      {!formData.department ? 'Select Department First' :
                       subjects.length === 0 ? 'Loading subjects...' : 'Select Subject'}
                    </option>
                    {subjects.map(subject => (
                      <option key={subject.courseCode} value={subject.courseCode}>
                        {subject.courseCode} - {subject.courseName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Teacher</Form.Label>
                  <Form.Select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher.name}>
                        {teacher.name}
                      </option>
                    ))}
                  </Form.Select>
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Mark Attendance</Card.Title>
                <div className="d-flex gap-3">
                  <span className="badge bg-success fs-6">
                    ✅ Present: {Object.values(attendanceData).filter(status => status === 'present').length}
                  </span>
                  <span className="badge bg-danger fs-6">
                    ❌ Absent: {Object.values(attendanceData).filter(status => status === 'absent').length}
                  </span>
                  <span className="badge bg-info fs-6">
                    👥 Total: {students.length}
                  </span>
                </div>
              </div>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                {students.length === 0 ? (
                  <Alert variant="warning">No students found in {formData.department} section {formData.section}.</Alert>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Barcode ID / USN</th>
                        <th>Student Name</th>
                        <th>Attendance Status</th>
                        <th>Manual Toggle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const isPresent = attendanceData[student._id] === 'present';
                        const wasRecentlyScanned = scannedStudents.some(s => s._id === student._id);

                        return (
                          <tr
                            key={student._id}
                            className={wasRecentlyScanned ? 'table-success' : ''}
                            style={wasRecentlyScanned ? { backgroundColor: '#d1e7dd' } : {}}
                          >
                            <td>
                              <strong>{student.barcodeId}</strong>
                              <br />
                              <small className="text-muted">{student.rollNumber}</small>
                            </td>
                            <td>
                              {student.name}
                              {wasRecentlyScanned && <span className="ms-2">📱</span>}
                            </td>
                            <td>
                              <span className={`badge bg-${isPresent ? 'success' : 'danger'}`}>
                                {isPresent ? '✅ PRESENT' : '❌ ABSENT'}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant={isPresent ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => handleMarkAttendance(student._id)}
                              >
                                {isPresent ? 'Mark Absent' : 'Mark Present'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
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
          <Card.Title>📱 Barcode Scanner Input</Card.Title>
          <div className="alert alert-info">
            <strong>📋 How to use:</strong>
            <ul className="mb-0 mt-2">
              <li>Focus on the input field below</li>
              <li>Scan student barcode (format: 22CS125, 22CS069, etc.)</li>
              <li>Student will be automatically marked PRESENT</li>
              <li>Input field clears automatically for next scan</li>
              <li>Green highlight shows recently scanned students</li>
            </ul>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">🔍 Barcode Scanner Input Field</Form.Label>
            <Form.Control
              type="text"
              placeholder="📱 Scan barcode here (22CS125, 22CS069, etc.) - Auto-clears after scan"
              value={barcode}
              onChange={async (e) => {
                const scannedValue = e.target.value.toUpperCase().trim();
                setBarcode(scannedValue);

                // Auto-process when barcode matches 22***** pattern (7 characters)
                if (scannedValue.length >= 7 && scannedValue.match(/^22[A-Z]{2}\d{3}$/)) {
                  await processScannedBarcode(scannedValue);
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const scannedBarcode = barcode.trim().toUpperCase();
                  if (scannedBarcode.length === 0) return;
                  await processScannedBarcode(scannedBarcode);
                }
              }}
              onBlur={async () => {
                // Process when field loses focus (in case scanner doesn't trigger onChange)
                if (barcode.trim().length > 0) {
                  await processScannedBarcode(barcode.trim().toUpperCase());
                }
              }}
              autoFocus
              style={{
                fontSize: '20px',
                padding: '15px',
                border: '3px solid #28a745',
                borderRadius: '10px',
                backgroundColor: '#f8fff9',
                textAlign: 'center',
                fontWeight: 'bold',
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