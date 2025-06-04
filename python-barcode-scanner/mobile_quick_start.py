#!/usr/bin/env python3
"""
Mobile Quick Start - One-Click Mobile Scanner Setup
Generates QR code and starts mobile server automatically

Usage:
    python mobile_quick_start.py
"""

import os
import sys
import subprocess
import socket
import time
import webbrowser
import threading


def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "192.168.1.100"


def check_dependencies():
    """Check if required packages are installed"""
    required_packages = ['qrcode', 'opencv-python', 'pyzbar']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'opencv-python':
                import cv2
            elif package == 'qrcode':
                import qrcode
            elif package == 'pyzbar':
                from pyzbar import pyzbar
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Install with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True


def generate_qr_and_start_server(port=8000):
    """Generate QR code and start mobile server"""
    
    print("📱 Mobile Barcode Scanner - Quick Start")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    # Get local IP
    local_ip = get_local_ip()
    mobile_url = f"http://{local_ip}:{port}"
    
    print(f"🌐 Network IP: {local_ip}")
    print(f"📱 Mobile URL: {mobile_url}")
    
    # Generate QR code
    try:
        print("🔧 Generating QR code...")
        result = subprocess.run([
            sys.executable, 'generate_mobile_qr.py', '--port', str(port)
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ QR code generated successfully!")
        else:
            print(f"⚠️  QR code generation warning: {result.stderr}")
    
    except subprocess.TimeoutExpired:
        print("⚠️  QR code generation timed out, continuing...")
    except Exception as e:
        print(f"⚠️  QR code generation failed: {e}")
    
    # Display instructions
    print("\n" + "=" * 50)
    print("📱 MOBILE SCANNER READY!")
    print("=" * 50)
    print("📋 Instructions:")
    print("1. Look for 'mobile_scanner_qr.png' file")
    print("2. Scan the QR code with your phone camera")
    print("3. Tap the notification to open mobile scanner")
    print("4. Allow camera permissions when prompted")
    print("5. Point camera at barcodes to scan!")
    
    print(f"\n🔗 Manual URL (if QR doesn't work):")
    print(f"   {mobile_url}")
    
    print("\n💡 Troubleshooting:")
    print("- Make sure phone and computer are on same WiFi")
    print("- Check Windows Firewall settings")
    print("- Try a different port if connection fails")
    
    # Start server
    print("\n🚀 Starting mobile server...")
    print("Press Ctrl+C to stop server")
    print("=" * 50)
    
    try:
        # Start the mobile server
        subprocess.run([
            sys.executable, 'mobile_server.py', '--port', str(port), '--host', '0.0.0.0'
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
    
    return True


def create_simple_qr_fallback(port=8000):
    """Create a simple QR code if the main generator fails"""
    try:
        import qrcode
        
        local_ip = get_local_ip()
        mobile_url = f"http://{local_ip}:{port}"
        
        # Create simple QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(mobile_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("simple_mobile_qr.png")
        
        print(f"✅ Simple QR code created: simple_mobile_qr.png")
        print(f"📱 URL: {mobile_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Could not create QR code: {e}")
        return False


def open_qr_image():
    """Try to open the QR code image"""
    qr_files = ["mobile_scanner_qr.png", "simple_mobile_qr.png"]
    
    for qr_file in qr_files:
        if os.path.exists(qr_file):
            try:
                if sys.platform.startswith('win'):
                    os.startfile(qr_file)
                elif sys.platform.startswith('darwin'):
                    subprocess.run(['open', qr_file])
                else:
                    subprocess.run(['xdg-open', qr_file])
                print(f"📱 Opened QR code: {qr_file}")
                return True
            except Exception as e:
                print(f"⚠️  Could not open {qr_file}: {e}")
    
    return False


def main():
    """Main function"""
    
    # Check if we're in the right directory
    if not os.path.exists('mobile_server.py'):
        print("❌ Please run this script from the python-barcode-scanner directory")
        print("💡 Make sure mobile_server.py exists in the current directory")
        sys.exit(1)
    
    port = 8000
    
    # Try to generate QR and start server
    print("🚀 Starting Mobile Barcode Scanner Setup...")
    
    # Create fallback QR code first
    if not create_simple_qr_fallback(port):
        print("⚠️  Could not create QR code. You'll need to type the URL manually.")
    
    # Try to open QR code image
    threading.Timer(2.0, open_qr_image).start()
    
    # Start the main process
    success = generate_qr_and_start_server(port)
    
    if not success:
        print("\n❌ Setup failed. Please check dependencies and try again.")
        print("💡 Run: pip install qrcode opencv-python pyzbar")
        sys.exit(1)


if __name__ == "__main__":
    main()
