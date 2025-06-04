#!/usr/bin/env python3
"""
Python Universal Barcode Scanner
Real-time detection of all barcode types using OpenCV and pyzbar

Supported formats: Code 39, Code 128, EAN-13, EAN-8, UPC-A, UPC-E,
QR Code, DataMatrix, PDF417, Aztec, Codabar, ITF, Code 93, and more!

Usage:
    python barcode_scanner.py [--camera 0] [--save] [--output filename]
"""

import cv2
import argparse
import sys
import os
from datetime import datetime

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector
from utils.display import DisplayManager


class BarcodeScanner:
    def __init__(self, camera_index=0, save_detections=False, output_file=None):
        self.camera_index = camera_index
        self.save_detections = save_detections
        self.output_file = output_file or f"detections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Initialize components
        self.detector = BarcodeDetector()
        self.display = DisplayManager()
        self.cap = None
        
        # Detection tracking
        self.detected_barcodes = []
        self.last_detected_data = None
        self.detection_cooldown = 0
        
    def initialize_camera(self):
        """Initialize camera capture"""
        print(f"Initializing camera {self.camera_index}...")
        
        self.cap = cv2.VideoCapture(self.camera_index)
        
        if not self.cap.isOpened():
            print(f"Error: Could not open camera {self.camera_index}")
            return False
        
        # Set camera properties for better performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        print("Camera initialized successfully!")
        return True
    
    def process_frame(self, frame):
        """
        Process a single frame for barcode detection
        
        Args:
            frame: OpenCV image frame
            
        Returns:
            tuple: (processed_frame, detected_barcodes_info)
        """
        # Detect barcodes in frame
        barcodes = self.detector.detect_barcodes(frame)
        detected_info = []
        
        # Process each detected barcode
        for barcode in barcodes:
            barcode_info = self.detector.process_barcode(barcode)

            # Process all supported barcode types
            if self.detector.is_supported_barcode(barcode_info):
                # Validate barcode data
                if self.detector.validate_barcode_data(barcode_info):
                    # Avoid duplicate detections
                    if (self.last_detected_data != barcode_info['data'] or
                        self.detection_cooldown <= 0):

                        detected_info.append(barcode_info)
                        self.detected_barcodes.append(barcode_info)
                        self.last_detected_data = barcode_info['data']
                        self.detection_cooldown = 30  # 30 frames cooldown

                        # Print detection to console
                        print(f"\n🔍 BARCODE DETECTED!")
                        print(f"   Type: {barcode_info['type']}")
                        print(f"   Data: {barcode_info['data']}")
                        print(f"   Confidence: {barcode_info['confidence']:.1f}%")
                        print(f"   Time: {barcode_info['timestamp']}")

                        # Save if enabled
                        if self.save_detections:
                            self.detector.save_detection(barcode_info, self.output_file)
                            print(f"   Saved to: {self.output_file}")

                    # Draw overlay for all detected barcodes
                    frame = self.display.draw_detection_overlay(frame, barcode_info)
        
        # Decrease cooldown
        if self.detection_cooldown > 0:
            self.detection_cooldown -= 1
        
        return frame, detected_info
    
    def run(self):
        """Main scanner loop"""
        if not self.initialize_camera():
            return False
        
        print("\n" + "="*60)
        print("🔍 PYTHON UNIVERSAL BARCODE SCANNER")
        print("="*60)
        print("📷 Camera feed started")
        print("🎯 Detecting ALL barcode types:")
        print("   📊 Linear: Code 39, Code 128, EAN-13, UPC-A, etc.")
        print("   📱 2D: QR Code, DataMatrix, PDF417, Aztec, etc.")
        print("\nControls:")
        print("  'q' - Quit scanner")
        print("  's' - Save current detections")
        print("  'c' - Clear detection history")
        print("  'r' - Reset camera")
        print("="*60)
        
        try:
            while True:
                # Read frame from camera
                ret, frame = self.cap.read()
                
                if not ret:
                    print("Error: Could not read frame from camera")
                    break
                
                # Process frame for barcode detection
                processed_frame, detected_info = self.process_frame(frame)
                
                # Get detection statistics
                stats = self.detector.get_detection_stats()
                
                # Add status overlay
                processed_frame = self.display.create_status_display(processed_frame, stats)
                
                # Create info panel
                info_panel = self.display.create_info_panel(
                    processed_frame.shape[1], self.detected_barcodes
                )
                
                # Display frame
                self.display.show_frame(processed_frame, info_panel)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n👋 Quitting scanner...")
                    break
                elif key == ord('s'):
                    self.save_detections_manual()
                elif key == ord('c'):
                    self.clear_detections()
                elif key == ord('r'):
                    self.reset_camera()
                
        except KeyboardInterrupt:
            print("\n\n⚠️  Scanner interrupted by user")
        
        finally:
            self.cleanup()
        
        return True
    
    def save_detections_manual(self):
        """Manually save detections"""
        if self.detected_barcodes:
            filename = f"manual_save_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            self.detector.save_detection(self.detected_barcodes[-1], filename)
            print(f"\n💾 Detections saved to: {filename}")
        else:
            print("\n⚠️  No detections to save")
    
    def clear_detections(self):
        """Clear detection history"""
        self.detected_barcodes.clear()
        self.detector.detected_barcodes.clear()
        self.last_detected_data = None
        print("\n🗑️  Detection history cleared")
    
    def reset_camera(self):
        """Reset camera connection"""
        print("\n🔄 Resetting camera...")
        if self.cap:
            self.cap.release()
        self.initialize_camera()
    
    def cleanup(self):
        """Clean up resources"""
        if self.cap:
            self.cap.release()
        self.display.cleanup()
        
        # Print final summary
        self.display.print_detection_summary(self.detected_barcodes)
        
        if self.save_detections and self.detected_barcodes:
            print(f"\n💾 All detections saved to: {self.output_file}")


def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Python Barcode Scanner - Code 39 Detector')
    parser.add_argument('--camera', '-c', type=int, default=0, 
                       help='Camera index (default: 0)')
    parser.add_argument('--save', '-s', action='store_true', 
                       help='Save detections to file')
    parser.add_argument('--output', '-o', type=str, 
                       help='Output filename for detections')
    
    args = parser.parse_args()
    
    # Create and run scanner
    scanner = BarcodeScanner(
        camera_index=args.camera,
        save_detections=args.save,
        output_file=args.output
    )
    
    success = scanner.run()
    
    if success:
        print("\n✅ Scanner completed successfully!")
    else:
        print("\n❌ Scanner failed to start")
        sys.exit(1)


if __name__ == "__main__":
    main()
