"""
Display Utilities
Helper functions for displaying barcode detection results
"""

import cv2
import numpy as np
from datetime import datetime


class DisplayManager:
    def __init__(self):
        self.window_name = "Barcode Scanner"
        self.info_panel_height = 150
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.font_scale = 0.6
        self.font_thickness = 2
        
    def create_info_panel(self, width, detected_barcodes):
        """
        Create information panel showing detection results
        
        Args:
            width: Panel width
            detected_barcodes: List of detected barcode info
            
        Returns:
            numpy.ndarray: Info panel image
        """
        panel = np.zeros((self.info_panel_height, width, 3), dtype=np.uint8)
        panel.fill(50)  # Dark gray background
        
        # Title
        cv2.putText(panel, "BARCODE SCANNER - CODE 39 DETECTOR", 
                   (10, 25), self.font, 0.7, (255, 255, 255), 2)
        
        # Instructions
        cv2.putText(panel, "Press 'q' to quit, 's' to save, 'c' to clear", 
                   (10, 50), self.font, 0.5, (200, 200, 200), 1)
        
        # Detection count
        count_text = f"Detections: {len(detected_barcodes)}"
        cv2.putText(panel, count_text, (10, 75), self.font, 0.5, (0, 255, 0), 1)
        
        # Current time
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cv2.putText(panel, f"Time: {current_time}", (10, 100), self.font, 0.5, (255, 255, 0), 1)
        
        # Last detection
        if detected_barcodes:
            last_detection = detected_barcodes[-1]
            last_text = f"Last: {last_detection['data'][:30]}..."
            cv2.putText(panel, last_text, (10, 125), self.font, 0.5, (0, 255, 255), 1)
        
        return panel
    
    def draw_detection_overlay(self, frame, barcode_info):
        """
        Draw comprehensive detection overlay
        
        Args:
            frame: OpenCV image frame
            barcode_info: Detected barcode information
            
        Returns:
            frame: Frame with overlay
        """
        x, y, w, h = barcode_info['rect']
        
        # Draw main bounding box
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)
        
        # Draw corner markers
        corner_size = 20
        corner_thickness = 3
        
        # Top-left corner
        cv2.line(frame, (x, y), (x + corner_size, y), (255, 0, 0), corner_thickness)
        cv2.line(frame, (x, y), (x, y + corner_size), (255, 0, 0), corner_thickness)
        
        # Top-right corner
        cv2.line(frame, (x + w, y), (x + w - corner_size, y), (255, 0, 0), corner_thickness)
        cv2.line(frame, (x + w, y), (x + w, y + corner_size), (255, 0, 0), corner_thickness)
        
        # Bottom-left corner
        cv2.line(frame, (x, y + h), (x + corner_size, y + h), (255, 0, 0), corner_thickness)
        cv2.line(frame, (x, y + h), (x, y + h - corner_size), (255, 0, 0), corner_thickness)
        
        # Bottom-right corner
        cv2.line(frame, (x + w, y + h), (x + w - corner_size, y + h), (255, 0, 0), corner_thickness)
        cv2.line(frame, (x + w, y + h), (x + w, y + h - corner_size), (255, 0, 0), corner_thickness)
        
        # Create info box background
        info_box_height = 80
        info_y = max(0, y - info_box_height - 10)
        
        # Semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(overlay, (x, info_y), (x + max(w, 300), info_y + info_box_height), 
                     (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Barcode type and data
        type_text = f"Type: {barcode_info['type']}"
        cv2.putText(frame, type_text, (x + 5, info_y + 20), 
                   self.font, 0.6, (255, 255, 255), 2)
        
        data_text = f"Data: {barcode_info['data']}"
        cv2.putText(frame, data_text, (x + 5, info_y + 40), 
                   self.font, 0.6, (0, 255, 255), 2)
        
        # Confidence and timestamp
        conf_text = f"Confidence: {barcode_info['confidence']:.1f}%"
        cv2.putText(frame, conf_text, (x + 5, info_y + 60), 
                   self.font, 0.5, (255, 255, 0), 1)
        
        return frame
    
    def create_status_display(self, frame, stats):
        """
        Create status display overlay
        
        Args:
            frame: OpenCV image frame
            stats: Detection statistics
            
        Returns:
            frame: Frame with status overlay
        """
        height, width = frame.shape[:2]
        
        # Status box dimensions
        status_width = 250
        status_height = 100
        status_x = width - status_width - 10
        status_y = 10
        
        # Semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(overlay, (status_x, status_y), 
                     (status_x + status_width, status_y + status_height), 
                     (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Status text
        cv2.putText(frame, "DETECTION STATUS", (status_x + 5, status_y + 20), 
                   self.font, 0.5, (255, 255, 255), 1)
        
        cv2.putText(frame, f"Total: {stats['total_detections']}", 
                   (status_x + 5, status_y + 40), self.font, 0.5, (0, 255, 0), 1)
        
        cv2.putText(frame, f"Code 39: {stats['code39_detections']}", 
                   (status_x + 5, status_y + 60), self.font, 0.5, (0, 255, 255), 1)
        
        cv2.putText(frame, f"Others: {stats['other_detections']}", 
                   (status_x + 5, status_y + 80), self.font, 0.5, (255, 255, 0), 1)
        
        return frame
    
    def show_frame(self, frame, info_panel=None):
        """
        Display frame with optional info panel
        
        Args:
            frame: Main camera frame
            info_panel: Optional info panel
        """
        if info_panel is not None:
            # Combine frame and info panel
            combined = np.vstack((frame, info_panel))
            cv2.imshow(self.window_name, combined)
        else:
            cv2.imshow(self.window_name, frame)
    
    def cleanup(self):
        """Clean up display resources"""
        cv2.destroyAllWindows()
    
    def print_detection_summary(self, detected_barcodes):
        """
        Print detection summary to console
        
        Args:
            detected_barcodes: List of detected barcode info
        """
        print("\n" + "="*50)
        print("BARCODE DETECTION SUMMARY")
        print("="*50)
        
        if not detected_barcodes:
            print("No barcodes detected.")
            return
        
        print(f"Total detections: {len(detected_barcodes)}")
        print("\nDetected barcodes:")
        print("-" * 50)
        
        for i, barcode in enumerate(detected_barcodes, 1):
            print(f"{i:2d}. Type: {barcode['type']:10s} | "
                  f"Data: {barcode['data']:20s} | "
                  f"Confidence: {barcode['confidence']:5.1f}% | "
                  f"Time: {barcode['timestamp']}")
        
        # Statistics
        code39_count = sum(1 for b in detected_barcodes if b['type'] == 'CODE39')
        print(f"\nCode 39 barcodes: {code39_count}")
        print(f"Other formats: {len(detected_barcodes) - code39_count}")
        print("="*50)
