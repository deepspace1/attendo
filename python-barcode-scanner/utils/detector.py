"""
Barcode Detection Utilities
Core logic for detecting and decoding Code 39 barcodes
"""

import cv2
import numpy as np
from pyzbar import pyzbar
from datetime import datetime
import json


class BarcodeDetector:
    def __init__(self):
        self.detected_barcodes = []
        self.last_detection_time = None
        
    def detect_barcodes(self, frame):
        """
        Detect barcodes in a frame with enhanced preprocessing

        Args:
            frame: OpenCV image frame

        Returns:
            list: List of detected barcode objects
        """
        # Convert to grayscale for better detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Try multiple preprocessing techniques for better detection
        barcodes = []

        # Method 1: Original image
        barcodes.extend(pyzbar.decode(gray))

        # Method 2: Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        barcodes.extend(pyzbar.decode(blurred))

        # Method 3: Adaptive threshold
        adaptive_thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        barcodes.extend(pyzbar.decode(adaptive_thresh))

        # Method 4: Morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
        barcodes.extend(pyzbar.decode(morph))

        # Method 5: Edge detection
        edges = cv2.Canny(gray, 50, 150)
        barcodes.extend(pyzbar.decode(edges))

        # Method 6: Histogram equalization
        equalized = cv2.equalizeHist(gray)
        barcodes.extend(pyzbar.decode(equalized))

        # Remove duplicates based on data and position
        unique_barcodes = []
        seen = set()

        for barcode in barcodes:
            # Create unique identifier based on data and approximate position
            identifier = (barcode.data, barcode.type,
                         barcode.rect.left // 10, barcode.rect.top // 10)
            if identifier not in seen:
                seen.add(identifier)
                unique_barcodes.append(barcode)

        return unique_barcodes
    
    def process_barcode(self, barcode):
        """
        Process a detected barcode and extract information
        
        Args:
            barcode: pyzbar barcode object
            
        Returns:
            dict: Processed barcode information
        """
        # Extract barcode data
        barcode_data = barcode.data.decode('utf-8')
        barcode_type = barcode.type
        
        # Get bounding box coordinates
        (x, y, w, h) = barcode.rect
        
        # Create barcode info dictionary
        barcode_info = {
            'data': barcode_data,
            'type': barcode_type,
            'rect': (x, y, w, h),
            'polygon': barcode.polygon,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'confidence': self._calculate_confidence(barcode)
        }
        
        return barcode_info
    
    def _calculate_confidence(self, barcode):
        """
        Calculate confidence score for barcode detection

        Args:
            barcode: pyzbar barcode object

        Returns:
            float: Confidence score (0-100)
        """
        if len(barcode.data) == 0:
            return 0

        # Base confidence on data length
        data_length = len(barcode.data)
        base_confidence = min(70, data_length * 5)

        # Bonus points for different barcode types
        type_bonus = {
            'CODE39': 15,
            'CODE128': 20,
            'EAN13': 25,
            'EAN8': 20,
            'UPCA': 25,
            'UPCE': 20,
            'QRCODE': 30,
            'DATAMATRIX': 25,
            'PDF417': 20,
            'AZTEC': 25,
            'CODABAR': 15,
            'ITF': 15,
            'CODE93': 15
        }.get(barcode.type, 10)

        # Bonus for rectangle quality (aspect ratio and size)
        rect_bonus = 0
        if hasattr(barcode, 'rect'):
            width, height = barcode.rect.width, barcode.rect.height
            if width > 50 and height > 20:  # Reasonable size
                rect_bonus = 10
            if 0.1 <= height/width <= 0.5:  # Good aspect ratio for linear barcodes
                rect_bonus += 5

        total_confidence = min(100, base_confidence + type_bonus + rect_bonus)
        return total_confidence
    
    def draw_barcode_overlay(self, frame, barcode_info):
        """
        Draw barcode detection overlay on frame
        
        Args:
            frame: OpenCV image frame
            barcode_info: Processed barcode information
            
        Returns:
            frame: Frame with overlay drawn
        """
        x, y, w, h = barcode_info['rect']
        
        # Draw bounding rectangle
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Draw barcode type and data
        text = f"{barcode_info['type']}: {barcode_info['data']}"
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.6, (0, 255, 0), 2)
        
        # Draw confidence
        confidence_text = f"Confidence: {barcode_info['confidence']:.1f}%"
        cv2.putText(frame, confidence_text, (x, y + h + 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        # Draw timestamp
        time_text = f"Time: {barcode_info['timestamp']}"
        cv2.putText(frame, time_text, (x, y + h + 40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        return frame
    
    def save_detection(self, barcode_info, filename='detected_barcodes.json'):
        """
        Save detected barcode to file
        
        Args:
            barcode_info: Processed barcode information
            filename: Output filename
        """
        self.detected_barcodes.append(barcode_info)
        
        try:
            with open(filename, 'w') as f:
                json.dump(self.detected_barcodes, f, indent=2)
        except Exception as e:
            print(f"Error saving detection: {e}")
    
    def is_supported_barcode(self, barcode_info):
        """
        Check if detected barcode is a supported format

        Args:
            barcode_info: Processed barcode information

        Returns:
            bool: True if supported, False otherwise
        """
        supported_types = {
            'CODE39', 'CODE128', 'EAN13', 'EAN8', 'UPCA', 'UPCE',
            'QRCODE', 'DATAMATRIX', 'PDF417', 'AZTEC', 'CODABAR',
            'ITF', 'CODE93', 'CODE11', 'MSI', 'PHARMACODE'
        }
        return barcode_info['type'] in supported_types

    def validate_barcode_data(self, barcode_info):
        """
        Validate barcode data based on its type

        Args:
            barcode_info: Processed barcode information

        Returns:
            bool: True if valid, False otherwise
        """
        barcode_type = barcode_info['type']
        data = barcode_info['data']

        if barcode_type == 'CODE39':
            return self._validate_code39(data)
        elif barcode_type == 'CODE128':
            return self._validate_code128(data)
        elif barcode_type in ['EAN13', 'EAN8', 'UPCA', 'UPCE']:
            return self._validate_ean_upc(data)
        elif barcode_type in ['QRCODE', 'DATAMATRIX', 'PDF417', 'AZTEC']:
            return self._validate_2d_barcode(data)
        else:
            # For other types, just check if data exists
            return len(data) > 0

    def _validate_code39(self, data):
        """Validate Code 39 barcode data"""
        valid_chars = set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*')
        return all(c in valid_chars for c in data.upper())

    def _validate_code128(self, data):
        """Validate Code 128 barcode data"""
        # Code 128 can contain any ASCII character
        try:
            data.encode('ascii')
            return True
        except UnicodeEncodeError:
            return False

    def _validate_ean_upc(self, data):
        """Validate EAN/UPC barcode data"""
        # Should be numeric and correct length
        if not data.isdigit():
            return False
        return len(data) in [8, 12, 13, 14]  # Common EAN/UPC lengths

    def _validate_2d_barcode(self, data):
        """Validate 2D barcode data (QR, DataMatrix, etc.)"""
        # 2D barcodes can contain almost any data
        return len(data) > 0
    
    def get_detection_stats(self):
        """
        Get detection statistics

        Returns:
            dict: Detection statistics
        """
        total_detections = len(self.detected_barcodes)

        # Count by barcode type
        type_counts = {}
        for barcode in self.detected_barcodes:
            barcode_type = barcode['type']
            type_counts[barcode_type] = type_counts.get(barcode_type, 0) + 1

        # Get most common types
        linear_types = {'CODE39', 'CODE128', 'EAN13', 'EAN8', 'UPCA', 'UPCE', 'CODABAR', 'ITF', 'CODE93'}
        matrix_types = {'QRCODE', 'DATAMATRIX', 'PDF417', 'AZTEC'}

        linear_count = sum(type_counts.get(t, 0) for t in linear_types)
        matrix_count = sum(type_counts.get(t, 0) for t in matrix_types)

        return {
            'total_detections': total_detections,
            'linear_barcodes': linear_count,
            'matrix_barcodes': matrix_count,
            'type_breakdown': type_counts,
            'last_detection': self.detected_barcodes[-1] if self.detected_barcodes else None
        }
