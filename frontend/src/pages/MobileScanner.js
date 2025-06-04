import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MobileScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const navigate = useNavigate();



  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>📱 Mobile Barcode Scanner</h1>
      <p>Use the advanced barcode scanner for best results</p>

      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h3>🎯 Recommended Scanner</h3>
        <p>For the best barcode scanning experience, use:</p>
        <a
          href="/native-camera.html"
          target="_blank"
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            display: 'inline-block',
            margin: '10px'
          }}
        >
          📷 Open Advanced Scanner
        </a>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h4>Or enter barcode manually:</h4>
        <input
          type="text"
          value={scanResult}
          onChange={(e) => setScanResult(e.target.value)}
          placeholder="Enter barcode here..."
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #007bff',
            borderRadius: '5px',
            width: '200px',
            margin: '10px'
          }}
        />
        <br />
        <button
          onClick={() => {
            if (scanResult) {
              localStorage.setItem('scannedBarcode', scanResult);
              navigate('/take-attendance');
            }
          }}
          disabled={!scanResult}
          style={{
            backgroundColor: scanResult ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            marginTop: '10px',
            cursor: scanResult ? 'pointer' : 'not-allowed'
          }}
        >
          Submit Barcode
        </button>
      </div>

      {scanResult && <p>Current Code: {scanResult}</p>}

      <button
        onClick={() => navigate('/take-attendance')}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Back to Attendance
      </button>
    </div>
  );
};

export default MobileScanner;
