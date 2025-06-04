#!/usr/bin/env python3
"""
Test All Barcode Formats
Generate and test detection of all supported barcode types

Usage:
    python test_all_formats.py
"""

import os
import sys
import subprocess

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from barcode_generator import BarcodeGenerator
from utils.detector import BarcodeDetector
import cv2


def test_barcode_detection():
    """Test barcode detection on generated images"""
    print("🧪 Testing Universal Barcode Detection")
    print("=" * 50)
    
    # Initialize components
    generator = BarcodeGenerator()
    detector = BarcodeDetector()
    
    # Test data for different formats
    test_cases = [
        ("Code39", "HELLO123"),
        ("Code39", "STUDENT001"),
        ("Code128", "Hello World!"),
        ("Code128", "Test-123-ABC"),
        ("QR", "https://example.com"),
        ("QR", "Mobile Scanner Test"),
        ("Code39", "SCAN-ME"),
        ("Code128", "Mixed Case 789")
    ]
    
    print(f"📊 Generating {len(test_cases)} test barcodes...")
    
    # Generate test barcodes
    generated_files = []
    for i, (barcode_type, text) in enumerate(test_cases, 1):
        print(f"   [{i:2d}/{len(test_cases)}] {barcode_type}: {text}")
        
        filename = f"test_{i:02d}_{barcode_type}_{text.replace(' ', '_').replace('!', '').replace('/', '_')[:15]}"
        
        if barcode_type == "Code39":
            file_path = generator.generate_code39(text, filename)
        elif barcode_type == "Code128":
            file_path = generator.generate_code128(text, filename)
        elif barcode_type == "QR":
            file_path = generator.generate_qr_code(text, filename)
        
        if file_path:
            generated_files.append((file_path, barcode_type, text))
    
    print(f"\n🔍 Testing detection on {len(generated_files)} images...")
    
    # Test detection
    successful_detections = 0
    failed_detections = 0
    
    for file_path, expected_type, expected_data in generated_files:
        try:
            # Load image
            image = cv2.imread(file_path)
            if image is None:
                print(f"❌ Could not load: {file_path}")
                failed_detections += 1
                continue
            
            # Detect barcodes
            barcodes = detector.detect_barcodes(image)
            
            if barcodes:
                detected = False
                for barcode in barcodes:
                    barcode_info = detector.process_barcode(barcode)
                    
                    if detector.is_supported_barcode(barcode_info):
                        if detector.validate_barcode_data(barcode_info):
                            print(f"✅ {expected_type}: '{expected_data}' → Detected as {barcode_info['type']}: '{barcode_info['data']}'")
                            successful_detections += 1
                            detected = True
                            break
                
                if not detected:
                    print(f"⚠️  {expected_type}: '{expected_data}' → Detected but validation failed")
                    failed_detections += 1
            else:
                print(f"❌ {expected_type}: '{expected_data}' → No detection")
                failed_detections += 1
                
        except Exception as e:
            print(f"❌ Error testing {file_path}: {e}")
            failed_detections += 1
    
    # Print results
    print("\n" + "=" * 50)
    print("🧪 DETECTION TEST RESULTS")
    print("=" * 50)
    print(f"✅ Successful detections: {successful_detections}")
    print(f"❌ Failed detections: {failed_detections}")
    print(f"📊 Success rate: {successful_detections/(successful_detections+failed_detections)*100:.1f}%")
    
    if successful_detections > 0:
        print("\n🎉 Universal barcode detection is working!")
        print("📱 Ready to scan with CLI, GUI, or mobile interface")
    else:
        print("\n⚠️  Detection issues found. Check dependencies:")
        print("   pip install opencv-python pyzbar")
    
    print("=" * 50)
    
    return successful_detections > 0


def run_demo():
    """Run a quick demo of all scanners"""
    print("\n🚀 Quick Demo Options")
    print("=" * 30)
    print("1. CLI Scanner")
    print("2. GUI Scanner") 
    print("3. Mobile Server")
    print("4. Batch Processing")
    print("5. Exit")
    
    try:
        choice = input("\nChoose demo (1-5): ").strip()
        
        if choice == '1':
            print("\n🔍 Starting CLI Scanner...")
            print("Press 'q' to quit when window opens")
            os.system(f"{sys.executable} barcode_scanner.py")
            
        elif choice == '2':
            print("\n🖥️  Starting GUI Scanner...")
            os.system(f"{sys.executable} gui_scanner.py")
            
        elif choice == '3':
            print("\n📱 Starting Mobile Server...")
            print("Open the displayed URL on your mobile device")
            os.system(f"{sys.executable} mobile_server.py")
            
        elif choice == '4':
            print("\n📁 Running Batch Processing...")
            os.system(f"{sys.executable} batch_scanner.py --input test_images/ --output test_results.json")
            
        elif choice == '5':
            print("\n👋 Goodbye!")
            
        else:
            print("❌ Invalid choice")
            
    except KeyboardInterrupt:
        print("\n\n👋 Demo interrupted")


def main():
    """Main test function"""
    print("🔍 Python Universal Barcode Scanner - Test Suite")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('barcode_scanner.py'):
        print("❌ Please run this script from the python-barcode-scanner directory")
        sys.exit(1)
    
    # Test barcode detection
    detection_works = test_barcode_detection()
    
    if detection_works:
        # Run demo if detection works
        run_demo()
    else:
        print("\n💡 Try installing dependencies:")
        print("   pip install -r requirements.txt")
        print("   python install.py")


if __name__ == "__main__":
    main()
