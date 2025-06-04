#!/usr/bin/env python3
"""
Mobile Barcode Scanner Server
Web server to receive barcode data from mobile devices

Usage:
    python mobile_server.py [--port 8000] [--host 0.0.0.0]
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
from datetime import datetime

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector


class MobileBarcodeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, detector=None, **kwargs):
        self.detector = detector or BarcodeDetector()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            # Serve the mobile scanner HTML
            self.serve_mobile_scanner()
        elif self.path == '/status':
            # Serve status page
            self.serve_status_page()
        elif self.path.startswith('/api/'):
            # Handle API requests
            self.handle_api_get()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/barcode':
            self.handle_barcode_post()
        else:
            self.send_error(404, "Not Found")
    
    def serve_mobile_scanner(self):
        """Serve the mobile scanner HTML page"""
        try:
            with open('mobile_scanner.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except FileNotFoundError:
            self.send_error(404, "Mobile scanner HTML not found")
    
    def serve_status_page(self):
        """Serve a status page showing detected barcodes"""
        stats = self.detector.get_detection_stats()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Barcode Scanner Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }}
                .stats {{ background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                .barcode {{ background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }}
                .type {{ font-weight: bold; color: #007bff; }}
                .data {{ font-family: monospace; background: white; padding: 5px; border-radius: 3px; margin: 5px 0; }}
                .meta {{ font-size: 0.9em; color: #666; }}
                .refresh {{ background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 Mobile Barcode Scanner Status</h1>
                
                <div class="stats">
                    <h3>📊 Statistics</h3>
                    <p><strong>Total Detections:</strong> {stats['total_detections']}</p>
                    <p><strong>Linear Barcodes:</strong> {stats['linear_barcodes']}</p>
                    <p><strong>2D Barcodes:</strong> {stats['matrix_barcodes']}</p>
                </div>
                
                <h3>🔍 Recent Detections</h3>
        """
        
        # Add recent detections
        recent_detections = self.detector.detected_barcodes[-10:]  # Last 10
        if recent_detections:
            for barcode in reversed(recent_detections):
                html += f"""
                <div class="barcode">
                    <div class="type">{barcode['type']}</div>
                    <div class="data">{barcode['data']}</div>
                    <div class="meta">
                        Confidence: {barcode['confidence']:.1f}% | 
                        Time: {barcode['timestamp']}
                    </div>
                </div>
                """
        else:
            html += "<p>No barcodes detected yet.</p>"
        
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
            # Read POST data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            # Create barcode info object
            barcode_info = {
                'data': data.get('data', ''),
                'type': data.get('format', 'UNKNOWN'),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'confidence': 95.0,  # Mobile detection is usually reliable
                'source': 'mobile'
            }
            
            # Add to detector
            self.detector.detected_barcodes.append(barcode_info)
            
            # Print to console
            print(f"\n📱 MOBILE BARCODE DETECTED!")
            print(f"   Type: {barcode_info['type']}")
            print(f"   Data: {barcode_info['data']}")
            print(f"   Time: {barcode_info['timestamp']}")
            
            # Save to file
            self.detector.save_detection(barcode_info, 'mobile_detections.json')
            
            # Send success response
            response = {
                'status': 'success',
                'message': 'Barcode received successfully',
                'barcode': barcode_info
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error handling barcode POST: {e}")
            
            error_response = {
                'status': 'error',
                'message': str(e)
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def handle_api_get(self):
        """Handle API GET requests"""
        if self.path == '/api/stats':
            stats = self.detector.get_detection_stats()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode('utf-8'))
            
        elif self.path == '/api/detections':
            detections = self.detector.detected_barcodes
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(detections).encode('utf-8'))
            
        else:
            self.send_error(404, "API endpoint not found")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


class MobileBarcodeServer:
    def __init__(self, host='0.0.0.0', port=8000):
        self.host = host
        self.port = port
        self.detector = BarcodeDetector()
        self.server = None
        
    def create_handler(self):
        """Create handler with detector instance"""
        def handler(*args, **kwargs):
            return MobileBarcodeHandler(*args, detector=self.detector, **kwargs)
        return handler

    def generate_qr_code(self):
        """Generate QR code for mobile access"""
        try:
            local_ip = get_local_ip()
            mobile_url = f"http://{local_ip}:{self.port}"

            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )

            qr.add_data(mobile_url)
            qr.make(fit=True)

            # Create QR code image
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_img.save("mobile_scanner_qr.png")

            print(f"📱 QR code generated: mobile_scanner_qr.png")
            print(f"🔗 Mobile URL: {mobile_url}")

        except Exception as e:
            print(f"⚠️  Could not generate QR code: {e}")
            print("💡 Install qrcode: pip install qrcode[pil]")
    
    def start_server(self):
        """Start the web server"""
        try:
            # Generate QR code for mobile access
            self.generate_qr_code()

            handler = self.create_handler()
            self.server = socketserver.TCPServer((self.host, self.port), handler)

            local_ip = get_local_ip()

            print(f"\n🌐 Mobile Barcode Scanner Server")
            print("=" * 50)
            print(f"📡 Server running on http://{self.host}:{self.port}")
            print(f"📱 Mobile scanner: http://{local_ip}:{self.port}/")
            print(f"📊 Status page: http://{local_ip}:{self.port}/status")
            print(f"🔗 QR Code: mobile_scanner_qr.png")
            print("\n💡 Instructions:")
            print("1. Scan the QR code with your phone camera")
            print("2. Tap the notification to open mobile scanner")
            print("3. Allow camera permissions")
            print("4. Point camera at barcodes")
            print("5. View results on status page")
            print("\nPress Ctrl+C to stop server")
            print("=" * 50)

            # Open browser automatically
            threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{self.port}')).start()

            # Start server
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Server stopped by user")
            self.stop_server()
        except Exception as e:
            print(f"\n❌ Server error: {e}")
    
    def stop_server(self):
        """Stop the web server"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            print("👋 Server stopped")


def get_local_ip():
    """Get local IP address for mobile access"""
    import socket
    try:
        # Connect to a remote address to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "localhost"


def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Mobile Barcode Scanner Server')
    parser.add_argument('--host', '-H', type=str, default='0.0.0.0',
                       help='Host address (default: 0.0.0.0)')
    parser.add_argument('--port', '-p', type=int, default=8000,
                       help='Port number (default: 8000)')
    parser.add_argument('--open', '-o', action='store_true',
                       help='Open browser automatically')
    
    args = parser.parse_args()
    
    # Get local IP for mobile access
    local_ip = get_local_ip()
    
    print(f"\n📱 Mobile Access URLs:")
    print(f"   Local: http://localhost:{args.port}")
    print(f"   Network: http://{local_ip}:{args.port}")
    print(f"   Use the network URL on your mobile device")
    
    # Create and start server
    server = MobileBarcodeServer(host=args.host, port=args.port)
    server.start_server()


if __name__ == "__main__":
    main()
