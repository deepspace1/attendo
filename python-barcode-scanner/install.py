#!/usr/bin/env python3
"""
Installation Script for Python Barcode Scanner
Checks dependencies and sets up the environment
"""

import subprocess
import sys
import os
import importlib


class BarcodeScannerInstaller:
    def __init__(self):
        self.required_packages = [
            'opencv-python',
            'pyzbar',
            'Pillow',
            'numpy',
            'python-barcode',
            'qrcode'
        ]
        
        self.system_dependencies = {
            'linux': ['libzbar0'],
            'darwin': ['zbar'],  # macOS
            'win32': []  # Windows - usually works without additional deps
        }
    
    def check_python_version(self):
        """Check if Python version is compatible"""
        print("🐍 Checking Python version...")
        
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 7):
            print(f"❌ Python 3.7+ required. Current version: {version.major}.{version.minor}")
            return False
        
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    
    def check_package_installed(self, package_name):
        """Check if a Python package is installed"""
        try:
            importlib.import_module(package_name.replace('-', '_'))
            return True
        except ImportError:
            return False
    
    def install_package(self, package_name):
        """Install a Python package using pip"""
        try:
            print(f"📦 Installing {package_name}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package_name])
            print(f"✅ {package_name} installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package_name}: {e}")
            return False
    
    def install_requirements(self):
        """Install all required packages"""
        print("\n📋 Checking and installing Python packages...")
        
        failed_packages = []
        
        for package in self.required_packages:
            # Map package names to import names
            import_name = package
            if package == 'opencv-python':
                import_name = 'cv2'
            elif package == 'python-barcode':
                import_name = 'barcode'
            elif package == 'Pillow':
                import_name = 'PIL'
            
            if self.check_package_installed(import_name):
                print(f"✅ {package} - Already installed")
            else:
                if not self.install_package(package):
                    failed_packages.append(package)
        
        return len(failed_packages) == 0
    
    def check_system_dependencies(self):
        """Check system-level dependencies"""
        platform = sys.platform
        
        if platform not in self.system_dependencies:
            print(f"⚠️  Unknown platform: {platform}")
            return True
        
        deps = self.system_dependencies[platform]
        if not deps:
            print("✅ No additional system dependencies required")
            return True
        
        print(f"\n🔧 System dependencies for {platform}:")
        for dep in deps:
            print(f"   - {dep}")
        
        if platform == 'linux':
            print("\n💡 Install with: sudo apt-get install libzbar0")
        elif platform == 'darwin':
            print("\n💡 Install with: brew install zbar")
        
        return True
    
    def test_installation(self):
        """Test if installation works"""
        print("\n🧪 Testing installation...")
        
        try:
            import cv2
            print(f"✅ OpenCV {cv2.__version__}")
        except ImportError as e:
            print(f"❌ OpenCV import failed: {e}")
            return False
        
        try:
            from pyzbar import pyzbar
            print("✅ pyzbar")
        except ImportError as e:
            print(f"❌ pyzbar import failed: {e}")
            return False
        
        try:
            from PIL import Image
            print("✅ Pillow (PIL)")
        except ImportError as e:
            print(f"❌ Pillow import failed: {e}")
            return False
        
        try:
            import numpy as np
            print(f"✅ NumPy {np.__version__}")
        except ImportError as e:
            print(f"❌ NumPy import failed: {e}")
            return False
        
        try:
            from barcode import Code39
            print("✅ python-barcode")
        except ImportError as e:
            print(f"❌ python-barcode import failed: {e}")
            return False
        
        print("✅ All packages imported successfully!")
        return True
    
    def create_test_directories(self):
        """Create necessary directories"""
        print("\n📁 Creating directories...")
        
        directories = ['test_images', 'output']
        
        for directory in directories:
            if not os.path.exists(directory):
                os.makedirs(directory)
                print(f"✅ Created: {directory}/")
            else:
                print(f"✅ Exists: {directory}/")
    
    def run_installation(self):
        """Run complete installation process"""
        print("🔧 Python Barcode Scanner Installation")
        print("=" * 50)
        
        # Check Python version
        if not self.check_python_version():
            return False
        
        # Check system dependencies
        self.check_system_dependencies()
        
        # Install Python packages
        if not self.install_requirements():
            print("\n❌ Some packages failed to install")
            return False
        
        # Test installation
        if not self.test_installation():
            print("\n❌ Installation test failed")
            return False
        
        # Create directories
        self.create_test_directories()
        
        print("\n" + "=" * 50)
        print("🎉 Installation completed successfully!")
        print("\n📚 Usage:")
        print("   python barcode_scanner.py          # CLI scanner")
        print("   python gui_scanner.py              # GUI scanner")
        print("   python barcode_generator.py        # Generate test barcodes")
        print("   python batch_scanner.py --help     # Batch processing")
        print("\n💡 Generate test barcodes first:")
        print("   python barcode_generator.py --attendance")
        print("=" * 50)
        
        return True


def main():
    """Main installation function"""
    installer = BarcodeScannerInstaller()
    
    try:
        success = installer.run_installation()
        if not success:
            print("\n❌ Installation failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Installation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during installation: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
