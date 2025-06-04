#!/usr/bin/env python3
"""
Mobile Camera Setup - Complete Solution
Fixes camera access issues and provides multiple access methods

Usage:
    python mobile_camera_setup.py
"""

import os
import sys
import subprocess
import webbrowser
import time


def check_dependencies():
    """Check and install required dependencies"""
    print("📦 Checking dependencies...")
    
    required_packages = [
        'qrcode[pil]',
        'cryptography', 
        'requests',
        'opencv-python',
        'pyzbar'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'qrcode[pil]':
                import qrcode
            elif package == 'cryptography':
                import cryptography
            elif package == 'requests':
                import requests
            elif package == 'opencv-python':
                import cv2
            elif package == 'pyzbar':
                from pyzbar import pyzbar
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"⚠️  Missing packages: {', '.join(missing_packages)}")
        print("💡 Installing missing packages...")
        
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install'
            ] + missing_packages)
            print("✅ All packages installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install packages: {e}")
            return False
    else:
        print("✅ All dependencies are installed!")
    
    return True


def show_camera_access_solutions():
    """Display camera access solutions"""
    print("\n📱 MOBILE CAMERA ACCESS SOLUTIONS")
    print("=" * 60)
    print("The camera access issue occurs because browsers require")
    print("HTTPS for camera access on non-localhost domains.")
    print("\nHere are 3 solutions to fix this:")
    print()
    
    print("🔒 SOLUTION 1: HTTPS with Self-Signed Certificate")
    print("   ✅ Camera works reliably")
    print("   ⚠️  Security warning (normal for self-signed)")
    print("   📱 Same WiFi network required")
    print("   🚀 Command: python https_mobile_server.py")
    print()
    
    print("🌐 SOLUTION 2: Ngrok Public Tunnel (RECOMMENDED)")
    print("   ✅ Camera works perfectly")
    print("   ✅ Real HTTPS certificate")
    print("   ✅ Works from anywhere")
    print("   ✅ No firewall issues")
    print("   📱 Requires ngrok installation")
    print("   🚀 Command: python ngrok_mobile_server.py")
    print()
    
    print("🏠 SOLUTION 3: Local Network (Limited)")
    print("   ❌ Camera may not work (HTTP limitation)")
    print("   ✅ Simple setup")
    print("   📱 Same WiFi network required")
    print("   🚀 Command: python mobile_server.py")
    print()


def generate_all_qr_codes():
    """Generate QR codes for all access methods"""
    print("🔧 Generating QR codes for all access methods...")
    
    try:
        result = subprocess.run([
            sys.executable, 'link_generator.py', '--service', 'all'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ QR codes generated successfully!")
            return True
        else:
            print(f"⚠️  QR generation warning: {result.stderr}")
            return False
    
    except subprocess.TimeoutExpired:
        print("⚠️  QR generation timed out")
        return False
    except Exception as e:
        print(f"⚠️  QR generation failed: {e}")
        return False


def check_ngrok_installation():
    """Check if ngrok is installed"""
    try:
        result = subprocess.run(['ngrok', 'version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ngrok is installed")
            return True
        else:
            print("❌ Ngrok not working properly")
            return False
    except FileNotFoundError:
        print("❌ Ngrok not found")
        return False


def show_ngrok_setup():
    """Show ngrok setup instructions"""
    print("\n🌐 NGROK SETUP (Recommended for best camera access)")
    print("=" * 60)
    print("Ngrok creates a secure public tunnel to your local server.")
    print("This solves all camera access issues!")
    print()
    print("📋 Setup Steps:")
    print("1. Go to https://ngrok.com/download")
    print("2. Download ngrok for your operating system")
    print("3. Extract and add to your PATH")
    print("4. Sign up for free account at https://ngrok.com")
    print("5. Get your auth token from dashboard")
    print("6. Run: ngrok authtoken YOUR_AUTH_TOKEN")
    print("7. Run: python ngrok_mobile_server.py")
    print()
    print("💡 Benefits:")
    print("   ✅ Camera works perfectly on mobile")
    print("   ✅ Real HTTPS certificate")
    print("   ✅ Works from any network")
    print("   ✅ Easy to share with others")
    print()


def interactive_setup():
    """Interactive setup wizard"""
    print("\n🧙‍♂️ INTERACTIVE SETUP WIZARD")
    print("=" * 40)
    
    while True:
        print("\nChoose your preferred solution:")
        print("1. 🔒 HTTPS Server (self-signed certificate)")
        print("2. 🌐 Ngrok Tunnel (recommended)")
        print("3. 🏠 Local Network (may have camera issues)")
        print("4. 📱 Generate all QR codes")
        print("5. 📖 View comparison page")
        print("6. ❓ Help with ngrok setup")
        print("7. 🚪 Exit")
        
        try:
            choice = input("\nEnter your choice (1-7): ").strip()
            
            if choice == '1':
                print("\n🔒 Starting HTTPS server...")
                print("You'll see a security warning on mobile - this is normal!")
                print("Click 'Advanced' → 'Proceed to [IP] (unsafe)' to continue")
                os.system(f"{sys.executable} https_mobile_server.py")
                
            elif choice == '2':
                if check_ngrok_installation():
                    print("\n🌐 Starting ngrok tunnel...")
                    os.system(f"{sys.executable} ngrok_mobile_server.py")
                else:
                    show_ngrok_setup()
                    
            elif choice == '3':
                print("\n🏠 Starting local network server...")
                print("⚠️  Camera may not work due to HTTP limitations")
                os.system(f"{sys.executable} mobile_server.py")
                
            elif choice == '4':
                generate_all_qr_codes()
                
            elif choice == '5':
                if os.path.exists('mobile_scanner_options.html'):
                    webbrowser.open('mobile_scanner_options.html')
                    print("🌐 Opened comparison page in browser")
                else:
                    print("⚠️  Comparison page not found. Generating...")
                    generate_all_qr_codes()
                    if os.path.exists('mobile_scanner_options.html'):
                        webbrowser.open('mobile_scanner_options.html')
                
            elif choice == '6':
                show_ngrok_setup()
                
            elif choice == '7':
                print("\n👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid choice. Please enter 1-7.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Setup interrupted by user")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")


def main():
    """Main setup function"""
    print("📱 MOBILE CAMERA ACCESS SETUP")
    print("=" * 50)
    print("This script fixes camera access issues for mobile barcode scanning")
    print()
    
    # Check if we're in the right directory
    if not os.path.exists('mobile_server.py'):
        print("❌ Please run this script from the python-barcode-scanner directory")
        print("💡 Make sure mobile_server.py exists in the current directory")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency installation failed")
        print("💡 Try running: pip install -r requirements.txt")
        sys.exit(1)
    
    # Show solutions
    show_camera_access_solutions()
    
    # Generate QR codes
    generate_all_qr_codes()
    
    # Check ngrok
    ngrok_available = check_ngrok_installation()
    if not ngrok_available:
        print("\n💡 For best camera access, consider installing ngrok")
    
    # Interactive setup
    interactive_setup()


if __name__ == "__main__":
    main()
