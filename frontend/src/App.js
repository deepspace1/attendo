import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TakeAttendance from './pages/TakeAttendance';
import ViewRecords from './pages/ViewRecords';
import AdminDashboard from './pages/AdminDashboard';
import TeacherLogin from './pages/TeacherLogin';
import PrivateRoute from './components/PrivateRoute';
import MobileScanner from './pages/MobileScanner';
import PublicScanner from './pages/PublicScanner';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(auth === 'true');
  }, []);

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navigation />}
        <Container className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" />
                ) : (
                  <TeacherLogin onLogin={() => setIsAuthenticated(true)} />
                )
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/take-attendance"
              element={
                <PrivateRoute>
                  <TakeAttendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-records"
              element={
                <PrivateRoute>
                  <ViewRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/mobile-scanner"
              element={
                <PrivateRoute>
                  <MobileScanner />
                </PrivateRoute>
          }
        />
        <Route path="/public-scanner" element={<PublicScanner />} />
      </Routes>
    </Container>
  </div>
</Router>
  );
}

export default App;
