import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';

const MobileScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data);
      try {
        const response = await fetch('http://localhost:5000/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scanCode: data }),
        });
        if (response.ok) {
          const result = await response.json();
          alert('Scan successful: ' + result.message);
          // Navigate or update UI as needed after successful scan
          // For example, navigate to attendance page
          navigate('/take-attendance');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to send scan code');
        }
      } catch (err) {
        setError('Error sending scan code: ' + err.message);
      }
    }
  };

  const handleError = (err) => {
    setError('Error accessing camera: ' + err.message);
  };

  return (
    <div>
      <h2>Mobile Scanner</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      {scanResult && <p>Scanned Code: {scanResult}</p>}
    </div>
  );
};

export default MobileScanner;
