import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TakeAttendance from './pages/TakeAttendance';
import ViewAttendance from './pages/ViewAttendance';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Container className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/take-attendance" element={<TakeAttendance />} />
            <Route path="/view-attendance" element={<ViewAttendance />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App; 