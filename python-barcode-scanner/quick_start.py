#!/usr/bin/env python3
"""
Quick Start Script for Python Barcode Scanner
Sets up everything and runs a demo
"""

import os
import sys
import subprocess


def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"   Output: {e.stdout}")
        if e.stderr:
            print(f"   Error: {e.stderr}")
        return False


def main():
    """Quick start setup and demo"""
    print("🚀 Python Barcode Scanner - Quick Start")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('barcode_scanner.py'):
        print("❌ Please run this script from the python-barcode-scanner directory")
        sys.exit(1)
    
    # Step 1: Install dependencies
    print("\n📦 Step 1: Installing dependencies...")
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", 
                      "Installing Python packages"):
        print("⚠️  Installation failed, but continuing...")
    
    # Step 2: Generate test barcodes
    print("\n🏷️  Step 2: Generating test barcodes...")
    if not run_command(f"{sys.executable} barcode_generator.py --attendance", 
                      "Generating attendance test barcodes"):
        print("⚠️  Barcode generation failed, but continuing...")
    
    # Step 3: Show available options
    print("\n" + "=" * 50)
    print("🎉 Quick Start Setup Complete!")
    print("=" * 50)
    
    print("\n📚 Available Commands:")
    print("   1. CLI Scanner:")
    print("      python barcode_scanner.py")
    print("      python barcode_scanner.py --save --camera 0")
    
    print("\n   2. GUI Scanner:")
    print("      python gui_scanner.py")
    
    print("\n   3. Generate More Test Barcodes:")
    print("      python barcode_generator.py --test-set")
    print("      python barcode_generator.py --text 'YOUR TEXT'")
    
    print("\n   4. Batch Process Images:")
    print("      python batch_scanner.py --input test_images/")
    
    print("\n📁 Generated Files:")
    if os.path.exists('test_images'):
        test_files = [f for f in os.listdir('test_images') if f.endswith('.png')]
        print(f"   test_images/ - {len(test_files)} test barcode images")
    
    print("\n💡 Tips:")
    print("   - Use good lighting when scanning")
    print("   - Hold barcodes steady and at proper distance")
    print("   - Code 39 barcodes work best")
    print("   - Press 'q' to quit scanners")
    
    # Ask user what to do next
    print("\n" + "=" * 50)
    print("What would you like to do?")
    print("1. Start CLI Scanner")
    print("2. Start GUI Scanner") 
    print("3. Generate more test barcodes")
    print("4. Exit")
    
    try:
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == '1':
            print("\n🔍 Starting CLI Scanner...")
            print("Press 'q' to quit when scanner window opens")
            os.system(f"{sys.executable} barcode_scanner.py")
            
        elif choice == '2':
            print("\n🖥️  Starting GUI Scanner...")
            os.system(f"{sys.executable} gui_scanner.py")
            
        elif choice == '3':
            print("\n🏷️  Generating test barcodes...")
            os.system(f"{sys.executable} barcode_generator.py")
            
        elif choice == '4':
            print("\n👋 Goodbye!")
            
        else:
            print("❌ Invalid choice")
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    main()
