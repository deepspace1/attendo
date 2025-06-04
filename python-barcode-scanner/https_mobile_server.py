#!/usr/bin/env python3
"""
HTTPS Mobile Barcode Scanner Server
Secure server with SSL for mobile camera access

Usage:
    python https_mobile_server.py [--port 8443] [--host 0.0.0.0]
"""

import http.server
import socketserver
import ssl
import json
import os
import sys
import argparse
import threading
import webbrowser
import qrcode
import subprocess
from datetime import datetime

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector


def create_self_signed_cert():
    """Create self-signed SSL certificate"""
    cert_file = "server.crt"
    key_file = "server.key"
    
    if os.path.exists(cert_file) and os.path.exists(key_file):
        print("✅ SSL certificate already exists")
        return cert_file, key_file
    
    print("🔧 Creating self-signed SSL certificate...")
    
    try:
        # Create self-signed certificate using openssl
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:4096", 
            "-keyout", key_file, "-out", cert_file, "-days", "365", "-nodes",
            "-subj", "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        ], check=True, capture_output=True)
        
        print("✅ SSL certificate created successfully")
        return cert_file, key_file
        
    except subprocess.CalledProcessError:
        print("⚠️  OpenSSL not found, trying Python method...")
        return create_python_cert()
    except FileNotFoundError:
        print("⚠️  OpenSSL not available, trying Python method...")
        return create_python_cert()


def create_python_cert():
    """Create certificate using Python cryptography library"""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
        import datetime
        import ipaddress
        
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "State"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "City"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Barcode Scanner"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.DNSName("*.local"),
                x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
                x509.IPAddress(ipaddress.IPv4Address("192.168.1.1")),  # Common router IP
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Write certificate
        with open("server.crt", "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        # Write private key
        with open("server.key", "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        print("✅ SSL certificate created with Python cryptography")
        return "server.crt", "server.key"
        
    except ImportError:
        print("❌ cryptography library not found")
        print("💡 Install with: pip install cryptography")
        return None, None
    except Exception as e:
        print(f"❌ Error creating certificate: {e}")
        return None, None


class HTTPSMobileBarcodeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, detector=None, **kwargs):
        self.detector = detector or BarcodeDetector()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self.serve_mobile_scanner()
        elif self.path == '/status':
            self.serve_status_page()
        else:
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/barcode':
            self.handle_barcode_post()
        else:
            self.send_error(404, "Not Found")
    
    def serve_mobile_scanner(self):
        """Serve the mobile scanner HTML page with HTTPS support"""
        html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📱 HTTPS Mobile Barcode Scanner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            width: 100%;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 { font-size: 1.5rem; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 0.9rem; }
        .camera-container {
            position: relative;
            background: #000;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #video {
            width: 100%;
            height: auto;
            max-height: 400px;
            object-fit: cover;
        }
        .overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 250px;
            height: 150px;
            border: 3px solid #28a745;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(40, 167, 69, 0.5);
            pointer-events: none;
        }
        .controls {
            padding: 20px;
            text-align: center;
        }
        .btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
        .btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .status {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 20px;
            border-radius: 10px;
            border-left: 4px solid #28a745;
        }
        .status.success { background: #d4edda; border-left-color: #28a745; color: #155724; }
        .status.error { background: #f8d7da; border-left-color: #dc3545; color: #721c24; }
        .result {
            background: #e7f3ff;
            padding: 20px;
            margin: 10px 20px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
            display: none;
        }
        .result.show { display: block; }
        .result-type { font-weight: bold; color: #007bff; font-size: 1.1rem; margin-bottom: 5px; }
        .result-data {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 10px;
            border-radius: 5px;
            word-break: break-all;
            margin: 10px 0;
        }
        .https-notice {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            margin: 10px 20px;
            border-radius: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 HTTPS Mobile Scanner</h1>
            <p>🔒 Secure camera access enabled</p>
        </div>
        
        <div class="https-notice">
            <strong>🔒 HTTPS Enabled!</strong><br>
            Camera access now works on mobile devices
        </div>
        
        <div class="camera-container">
            <video id="video" autoplay playsinline></video>
            <div class="overlay"></div>
        </div>
        
        <div class="controls">
            <button id="startBtn" class="btn">📷 Start Camera</button>
            <button id="stopBtn" class="btn" disabled>⏹️ Stop Camera</button>
        </div>
        
        <div id="status" class="status">
            Click "Start Camera" to begin scanning
        </div>
        
        <div id="result" class="result">
            <div class="result-type" id="resultType"></div>
            <div class="result-data" id="resultData"></div>
        </div>
    </div>

    <script src="https://unpkg.com/@zxing/library@latest/umd/index.min.js"></script>
    <script>
        class HTTPSMobileBarcodeScanner {
            constructor() {
                this.video = document.getElementById('video');
                this.startBtn = document.getElementById('startBtn');
                this.stopBtn = document.getElementById('stopBtn');
                this.status = document.getElementById('status');
                this.result = document.getElementById('result');
                this.resultType = document.getElementById('resultType');
                this.resultData = document.getElementById('resultData');
                
                this.stream = null;
                this.codeReader = null;
                this.scanning = false;
                
                this.initializeScanner();
                this.setupEventListeners();
            }
            
            initializeScanner() {
                this.codeReader = new ZXing.BrowserMultiFormatReader();
                console.log('HTTPS ZXing code reader initialized');
            }
            
            setupEventListeners() {
                this.startBtn.addEventListener('click', () => this.startScanning());
                this.stopBtn.addEventListener('click', () => this.stopScanning());
            }
            
            async startScanning() {
                try {
                    this.updateStatus('🔍 Starting secure camera...', 'info');
                    
                    const constraints = {
                        video: {
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        }
                    };
                    
                    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                    this.video.srcObject = this.stream;
                    
                    await new Promise((resolve) => {
                        this.video.onloadedmetadata = resolve;
                    });
                    
                    this.scanning = true;
                    this.startBtn.disabled = true;
                    this.stopBtn.disabled = false;
                    
                    this.updateStatus('📷 🔒 Secure camera active - Scan barcodes!', 'success');
                    this.scanContinuously();
                    
                } catch (error) {
                    console.error('Camera error:', error);
                    this.updateStatus('❌ Camera access failed: ' + error.message, 'error');
                }
            }
            
            async scanContinuously() {
                if (!this.scanning) return;
                
                try {
                    const result = await this.codeReader.decodeOnceFromVideoDevice(undefined, this.video);
                    
                    if (result) {
                        this.handleBarcodeDetected(result);
                        setTimeout(() => {
                            if (this.scanning) this.scanContinuously();
                        }, 1000);
                    } else {
                        if (this.scanning) {
                            requestAnimationFrame(() => this.scanContinuously());
                        }
                    }
                } catch (error) {
                    if (this.scanning) {
                        setTimeout(() => this.scanContinuously(), 100);
                    }
                }
            }
            
            handleBarcodeDetected(result) {
                const barcodeData = result.text;
                const barcodeFormat = result.format;
                const timestamp = new Date().toLocaleString();
                
                this.resultType.textContent = `🔒 ${barcodeFormat}`;
                this.resultData.textContent = barcodeData;
                this.result.classList.add('show');
                
                this.updateStatus(`✅ 🔒 Secure scan: ${barcodeFormat}`, 'success');
                
                if (navigator.vibrate) navigator.vibrate(200);
                
                this.sendToBackend(barcodeData, barcodeFormat);
            }
            
            async sendToBackend(data, format) {
                try {
                    const response = await fetch('/barcode', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            data: data,
                            format: format,
                            timestamp: new Date().toISOString(),
                            source: 'https_mobile'
                        })
                    });
                    
                    if (response.ok) {
                        console.log('Secure barcode sent successfully');
                    }
                } catch (error) {
                    console.log('Backend not available:', error.message);
                }
            }
            
            stopScanning() {
                this.scanning = false;
                
                if (this.codeReader) this.codeReader.reset();
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                    this.stream = null;
                }
                
                this.video.srcObject = null;
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                
                this.updateStatus('📷 🔒 Secure camera stopped', 'info');
                this.result.classList.remove('show');
            }
            
            updateStatus(message, type = 'info') {
                this.status.textContent = message;
                this.status.className = `status ${type}`;
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            new HTTPSMobileBarcodeScanner();
        });
    </script>
</body>
</html>
        """
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def serve_status_page(self):
        """Serve status page"""
        stats = self.detector.get_detection_stats()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>🔒 HTTPS Barcode Scanner Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }}
                .https-badge {{ background: #28a745; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }}
                .stats {{ background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                .barcode {{ background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28a745; }}
                .type {{ font-weight: bold; color: #28a745; }}
                .data {{ font-family: monospace; background: white; padding: 5px; border-radius: 3px; margin: 5px 0; }}
                .meta {{ font-size: 0.9em; color: #666; }}
                .refresh {{ background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="https-badge">
                    🔒 HTTPS Mobile Barcode Scanner Status
                </div>
                
                <div class="stats">
                    <h3>📊 Statistics</h3>
                    <p><strong>Total Detections:</strong> {stats['total_detections']}</p>
                    <p><strong>Linear Barcodes:</strong> {stats['linear_barcodes']}</p>
                    <p><strong>2D Barcodes:</strong> {stats['matrix_barcodes']}</p>
                </div>
                
                <h3>🔍 Recent Secure Detections</h3>
        """
        
        recent_detections = self.detector.detected_barcodes[-10:]
        if recent_detections:
            for barcode in reversed(recent_detections):
                html += f"""
                <div class="barcode">
                    <div class="type">🔒 {barcode['type']}</div>
                    <div class="data">{barcode['data']}</div>
                    <div class="meta">
                        Source: {barcode.get('source', 'unknown')} | 
                        Time: {barcode['timestamp']}
                    </div>
                </div>
                """
        else:
            html += "<p>No secure barcodes detected yet.</p>"
        
        html += """
                <button class="refresh" onclick="location.reload()">🔄 Refresh</button>
                <p><a href="/">← Back to Scanner</a></p>
            </div>
        </body>
        </html>
        """
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    def handle_barcode_post(self):
        """Handle barcode data from mobile device"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            barcode_info = {
                'data': data.get('data', ''),
                'type': data.get('format', 'UNKNOWN'),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'confidence': 95.0,
                'source': data.get('source', 'https_mobile')
            }
            
            self.detector.detected_barcodes.append(barcode_info)
            
            print(f"\n📱 🔒 HTTPS MOBILE BARCODE DETECTED!")
            print(f"   Type: {barcode_info['type']}")
            print(f"   Data: {barcode_info['data']}")
            print(f"   Source: {barcode_info['source']}")
            print(f"   Time: {barcode_info['timestamp']}")
            
            self.detector.save_detection(barcode_info, 'https_mobile_detections.json')
            
            response = {
                'status': 'success',
                'message': 'Secure barcode received',
                'barcode': barcode_info
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error handling HTTPS barcode POST: {e}")
            
            error_response = {'status': 'error', 'message': str(e)}
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def get_local_ip():
    """Get local IP address"""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "localhost"


def generate_https_qr(port=8443):
    """Generate QR code for HTTPS access"""
    try:
        local_ip = get_local_ip()
        https_url = f"https://{local_ip}:{port}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(https_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("https_mobile_qr.png")
        
        print(f"🔒 HTTPS QR code generated: https_mobile_qr.png")
        print(f"📱 HTTPS URL: {https_url}")
        
        return https_url
        
    except Exception as e:
        print(f"⚠️  Could not generate HTTPS QR code: {e}")
        return None


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='HTTPS Mobile Barcode Scanner Server')
    parser.add_argument('--host', '-H', type=str, default='0.0.0.0',
                       help='Host address (default: 0.0.0.0)')
    parser.add_argument('--port', '-p', type=int, default=8443,
                       help='Port number (default: 8443)')
    
    args = parser.parse_args()
    
    print("🔒 HTTPS Mobile Barcode Scanner Server")
    print("=" * 50)
    
    # Create SSL certificate
    cert_file, key_file = create_self_signed_cert()
    
    if not cert_file or not key_file:
        print("❌ Could not create SSL certificate")
        print("💡 Try installing: pip install cryptography")
        sys.exit(1)
    
    # Generate HTTPS QR code
    https_url = generate_https_qr(args.port)
    
    try:
        # Create HTTPS server
        detector = BarcodeDetector()
        
        def handler(*args, **kwargs):
            return HTTPSMobileBarcodeHandler(*args, detector=detector, **kwargs)
        
        httpd = socketserver.TCPServer((args.host, args.port), handler)
        
        # Wrap with SSL
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(cert_file, key_file)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        local_ip = get_local_ip()
        
        print(f"🔒 HTTPS server running on https://{args.host}:{args.port}")
        print(f"📱 Mobile URL: https://{local_ip}:{args.port}/")
        print(f"📊 Status: https://{local_ip}:{args.port}/status")
        print(f"🔗 QR Code: https_mobile_qr.png")
        
        print("\n💡 HTTPS Instructions:")
        print("1. Scan the HTTPS QR code with your phone")
        print("2. Accept the security warning (self-signed certificate)")
        print("3. Allow camera permissions")
        print("4. Start scanning barcodes!")
        
        print("\n⚠️  Security Note:")
        print("You'll see a security warning - this is normal for self-signed certificates")
        print("Click 'Advanced' → 'Proceed to [IP] (unsafe)' to continue")
        
        print("\nPress Ctrl+C to stop server")
        print("=" * 50)
        
        # Start server
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\n👋 HTTPS server stopped")
    except Exception as e:
        print(f"\n❌ HTTPS server error: {e}")


if __name__ == "__main__":
    main()
