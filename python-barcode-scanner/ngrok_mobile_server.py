#!/usr/bin/env python3
"""
Ngrok Mobile Barcode Scanner Server
Creates public HTTPS URL using ngrok for mobile camera access

Usage:
    python ngrok_mobile_server.py [--port 8000]
"""

import http.server
import socketserver
import json
import os
import sys
import argparse
import threading
import webbrowser
import qrcode
import subprocess
import time
import requests
from datetime import datetime

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector


class NgrokMobileBarcodeHandler(http.server.SimpleHTTPRequestHandler):
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
        """Serve the mobile scanner HTML page"""
        html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📱 Public Mobile Barcode Scanner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
            border: 3px solid #ff6b6b;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            pointer-events: none;
        }
        .controls {
            padding: 20px;
            text-align: center;
        }
        .btn {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
            border-left: 4px solid #ff6b6b;
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
        .ngrok-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
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
            <h1>📱 Public Mobile Scanner</h1>
            <p>🌐 Powered by ngrok tunnel</p>
        </div>
        
        <div class="ngrok-notice">
            <strong>🌐 Public HTTPS Access!</strong><br>
            Camera works from anywhere with internet
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
        class NgrokMobileBarcodeScanner {
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
                console.log('Ngrok ZXing code reader initialized');
            }
            
            setupEventListeners() {
                this.startBtn.addEventListener('click', () => this.startScanning());
                this.stopBtn.addEventListener('click', () => this.stopScanning());
            }
            
            async startScanning() {
                try {
                    this.updateStatus('🔍 Starting public camera...', 'info');
                    
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
                    
                    this.updateStatus('📷 🌐 Public camera active - Scan away!', 'success');
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
                
                this.resultType.textContent = `🌐 ${barcodeFormat}`;
                this.resultData.textContent = barcodeData;
                this.result.classList.add('show');
                
                this.updateStatus(`✅ 🌐 Public scan: ${barcodeFormat}`, 'success');
                
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
                            source: 'ngrok_mobile'
                        })
                    });
                    
                    if (response.ok) {
                        console.log('Public barcode sent successfully');
                    }
                } catch (error) {
                    console.log('Backend error:', error.message);
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
                
                this.updateStatus('📷 🌐 Public camera stopped', 'info');
                this.result.classList.remove('show');
            }
            
            updateStatus(message, type = 'info') {
                this.status.textContent = message;
                this.status.className = `status ${type}`;
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            new NgrokMobileBarcodeScanner();
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
            <title>🌐 Public Barcode Scanner Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }}
                .ngrok-badge {{ background: #ff6b6b; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }}
                .stats {{ background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                .barcode {{ background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff6b6b; }}
                .type {{ font-weight: bold; color: #ff6b6b; }}
                .data {{ font-family: monospace; background: white; padding: 5px; border-radius: 3px; margin: 5px 0; }}
                .meta {{ font-size: 0.9em; color: #666; }}
                .refresh {{ background: #ff6b6b; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="ngrok-badge">
                    🌐 Public Mobile Barcode Scanner Status
                </div>
                
                <div class="stats">
                    <h3>📊 Statistics</h3>
                    <p><strong>Total Detections:</strong> {stats['total_detections']}</p>
                    <p><strong>Linear Barcodes:</strong> {stats['linear_barcodes']}</p>
                    <p><strong>2D Barcodes:</strong> {stats['matrix_barcodes']}</p>
                </div>
                
                <h3>🔍 Recent Public Detections</h3>
        """
        
        recent_detections = self.detector.detected_barcodes[-10:]
        if recent_detections:
            for barcode in reversed(recent_detections):
                html += f"""
                <div class="barcode">
                    <div class="type">🌐 {barcode['type']}</div>
                    <div class="data">{barcode['data']}</div>
                    <div class="meta">
                        Source: {barcode.get('source', 'unknown')} | 
                        Time: {barcode['timestamp']}
                    </div>
                </div>
                """
        else:
            html += "<p>No public barcodes detected yet.</p>"
        
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
                'source': data.get('source', 'ngrok_mobile')
            }
            
            self.detector.detected_barcodes.append(barcode_info)
            
            print(f"\n📱 🌐 NGROK MOBILE BARCODE DETECTED!")
            print(f"   Type: {barcode_info['type']}")
            print(f"   Data: {barcode_info['data']}")
            print(f"   Source: {barcode_info['source']}")
            print(f"   Time: {barcode_info['timestamp']}")
            
            self.detector.save_detection(barcode_info, 'ngrok_mobile_detections.json')
            
            response = {
                'status': 'success',
                'message': 'Public barcode received',
                'barcode': barcode_info
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error handling ngrok barcode POST: {e}")
            
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


def start_ngrok_tunnel(port):
    """Start ngrok tunnel and return public URL"""
    try:
        print("🌐 Starting ngrok tunnel...")
        
        # Start ngrok process
        ngrok_process = subprocess.Popen([
            'ngrok', 'http', str(port)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for ngrok to start
        time.sleep(3)
        
        # Get public URL from ngrok API
        try:
            response = requests.get('http://localhost:4040/api/tunnels')
            tunnels = response.json()['tunnels']
            
            for tunnel in tunnels:
                if tunnel['config']['addr'] == f'http://localhost:{port}':
                    public_url = tunnel['public_url']
                    if public_url.startswith('https://'):
                        print(f"✅ Ngrok tunnel created: {public_url}")
                        return public_url, ngrok_process
            
        except Exception as e:
            print(f"⚠️  Could not get ngrok URL from API: {e}")
        
        return None, ngrok_process
        
    except FileNotFoundError:
        print("❌ Ngrok not found!")
        print("💡 Install ngrok:")
        print("   1. Download from https://ngrok.com/download")
        print("   2. Extract and add to PATH")
        print("   3. Sign up for free account")
        print("   4. Run: ngrok authtoken YOUR_TOKEN")
        return None, None
    except Exception as e:
        print(f"❌ Error starting ngrok: {e}")
        return None, None


def generate_ngrok_qr(public_url):
    """Generate QR code for ngrok public URL"""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(public_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("ngrok_mobile_qr.png")
        
        print(f"🌐 Ngrok QR code generated: ngrok_mobile_qr.png")
        print(f"📱 Public URL: {public_url}")
        
        return True
        
    except Exception as e:
        print(f"⚠️  Could not generate ngrok QR code: {e}")
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Ngrok Mobile Barcode Scanner Server')
    parser.add_argument('--port', '-p', type=int, default=8000,
                       help='Local port number (default: 8000)')
    
    args = parser.parse_args()
    
    print("🌐 Ngrok Mobile Barcode Scanner Server")
    print("=" * 50)
    
    # Start local server first
    detector = BarcodeDetector()
    
    def handler(*args, **kwargs):
        return NgrokMobileBarcodeHandler(*args, detector=detector, **kwargs)
    
    httpd = socketserver.TCPServer(('localhost', args.port), handler)
    
    # Start server in background thread
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    
    print(f"📡 Local server started on http://localhost:{args.port}")
    
    # Start ngrok tunnel
    public_url, ngrok_process = start_ngrok_tunnel(args.port)
    
    if not public_url:
        print("❌ Could not create ngrok tunnel")
        print("💡 Falling back to local server only")
        httpd.serve_forever()
        return
    
    # Generate QR code for public URL
    generate_ngrok_qr(public_url)
    
    print(f"🌐 Public server: {public_url}")
    print(f"📊 Status: {public_url}/status")
    print(f"🔗 QR Code: ngrok_mobile_qr.png")
    
    print("\n💡 Ngrok Instructions:")
    print("1. Scan the ngrok QR code with your phone")
    print("2. No security warnings needed!")
    print("3. Allow camera permissions")
    print("4. Start scanning barcodes from anywhere!")
    
    print("\n🌐 Benefits:")
    print("- Works from any network")
    print("- No firewall issues")
    print("- Proper HTTPS certificate")
    print("- Share with others easily")
    
    print("\nPress Ctrl+C to stop server")
    print("=" * 50)
    
    try:
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Stopping ngrok tunnel and server...")
        if ngrok_process:
            ngrok_process.terminate()
        httpd.shutdown()


if __name__ == "__main__":
    main()
