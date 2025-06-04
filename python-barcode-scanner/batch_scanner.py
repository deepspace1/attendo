#!/usr/bin/env python3
"""
Batch Barcode Scanner - Code 39 Detector
Process multiple images for barcode detection

Usage:
    python batch_scanner.py --input images/ --output results.txt
    python batch_scanner.py --file image.png
"""

import argparse
import os
import sys
import json
import csv
from datetime import datetime
import cv2

# Add utils to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.detector import BarcodeDetector
from utils.display import DisplayManager


class BatchBarcodeScanner:
    def __init__(self, output_format='json'):
        self.detector = BarcodeDetector()
        self.display = DisplayManager()
        self.output_format = output_format
        self.results = []
        
    def scan_image(self, image_path):
        """
        Scan a single image for barcodes
        
        Args:
            image_path: Path to image file
            
        Returns:
            dict: Scan results
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return {
                    'file': image_path,
                    'status': 'error',
                    'error': 'Could not load image',
                    'barcodes': []
                }
            
            # Detect barcodes
            barcodes = self.detector.detect_barcodes(image)
            
            # Process detected barcodes
            detected_barcodes = []
            for barcode in barcodes:
                barcode_info = self.detector.process_barcode(barcode)
                detected_barcodes.append(barcode_info)
            
            # Filter for Code 39 if needed
            code39_barcodes = [b for b in detected_barcodes if b['type'] == 'CODE39']
            
            result = {
                'file': image_path,
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'total_barcodes': len(detected_barcodes),
                'code39_barcodes': len(code39_barcodes),
                'barcodes': detected_barcodes
            }
            
            return result
            
        except Exception as e:
            return {
                'file': image_path,
                'status': 'error',
                'error': str(e),
                'barcodes': []
            }
    
    def scan_directory(self, directory_path):
        """
        Scan all images in a directory
        
        Args:
            directory_path: Path to directory containing images
            
        Returns:
            list: List of scan results
        """
        if not os.path.exists(directory_path):
            print(f"❌ Directory not found: {directory_path}")
            return []
        
        # Supported image extensions
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
        
        # Find all image files
        image_files = []
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_files.append(os.path.join(root, file))
        
        if not image_files:
            print(f"⚠️  No image files found in: {directory_path}")
            return []
        
        print(f"🔍 Found {len(image_files)} image files")
        print("📊 Processing images...")
        
        results = []
        for i, image_file in enumerate(image_files, 1):
            print(f"   [{i:3d}/{len(image_files)}] {os.path.basename(image_file)}", end=" ... ")
            
            result = self.scan_image(image_file)
            results.append(result)
            
            if result['status'] == 'success':
                barcode_count = result['total_barcodes']
                code39_count = result['code39_barcodes']
                print(f"✅ {barcode_count} barcodes ({code39_count} Code 39)")
            else:
                print(f"❌ {result.get('error', 'Unknown error')}")
        
        return results
    
    def save_results(self, results, output_file):
        """
        Save scan results to file
        
        Args:
            results: List of scan results
            output_file: Output file path
        """
        try:
            if self.output_format.lower() == 'json':
                self.save_json_results(results, output_file)
            elif self.output_format.lower() == 'csv':
                self.save_csv_results(results, output_file)
            elif self.output_format.lower() == 'txt':
                self.save_text_results(results, output_file)
            else:
                print(f"❌ Unsupported output format: {self.output_format}")
                
        except Exception as e:
            print(f"❌ Error saving results: {e}")
    
    def save_json_results(self, results, output_file):
        """Save results as JSON"""
        with open(output_file, 'w') as f:
            json.dump({
                'scan_summary': self.get_summary(results),
                'results': results
            }, f, indent=2)
        print(f"💾 Results saved to JSON: {output_file}")
    
    def save_csv_results(self, results, output_file):
        """Save results as CSV"""
        with open(output_file, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow(['File', 'Status', 'Total Barcodes', 'Code 39 Barcodes', 
                           'Barcode Data', 'Barcode Type', 'Confidence'])
            
            # Data
            for result in results:
                if result['barcodes']:
                    for barcode in result['barcodes']:
                        writer.writerow([
                            result['file'],
                            result['status'],
                            result['total_barcodes'],
                            result['code39_barcodes'],
                            barcode['data'],
                            barcode['type'],
                            barcode['confidence']
                        ])
                else:
                    writer.writerow([
                        result['file'],
                        result['status'],
                        result.get('total_barcodes', 0),
                        result.get('code39_barcodes', 0),
                        '',
                        '',
                        ''
                    ])
        
        print(f"💾 Results saved to CSV: {output_file}")
    
    def save_text_results(self, results, output_file):
        """Save results as text"""
        with open(output_file, 'w') as f:
            f.write("BATCH BARCODE SCAN RESULTS\n")
            f.write("=" * 50 + "\n\n")
            
            # Summary
            summary = self.get_summary(results)
            f.write("SUMMARY:\n")
            f.write(f"  Total files processed: {summary['total_files']}\n")
            f.write(f"  Successful scans: {summary['successful_scans']}\n")
            f.write(f"  Failed scans: {summary['failed_scans']}\n")
            f.write(f"  Total barcodes found: {summary['total_barcodes']}\n")
            f.write(f"  Code 39 barcodes: {summary['code39_barcodes']}\n\n")
            
            # Detailed results
            f.write("DETAILED RESULTS:\n")
            f.write("-" * 50 + "\n")
            
            for result in results:
                f.write(f"\nFile: {result['file']}\n")
                f.write(f"Status: {result['status']}\n")
                
                if result['status'] == 'success':
                    f.write(f"Barcodes found: {result['total_barcodes']}\n")
                    
                    for i, barcode in enumerate(result['barcodes'], 1):
                        f.write(f"  {i}. Type: {barcode['type']}\n")
                        f.write(f"     Data: {barcode['data']}\n")
                        f.write(f"     Confidence: {barcode['confidence']:.1f}%\n")
                else:
                    f.write(f"Error: {result.get('error', 'Unknown error')}\n")
                
                f.write("-" * 30 + "\n")
        
        print(f"💾 Results saved to text: {output_file}")
    
    def get_summary(self, results):
        """
        Get summary statistics
        
        Args:
            results: List of scan results
            
        Returns:
            dict: Summary statistics
        """
        total_files = len(results)
        successful_scans = sum(1 for r in results if r['status'] == 'success')
        failed_scans = total_files - successful_scans
        total_barcodes = sum(r.get('total_barcodes', 0) for r in results)
        code39_barcodes = sum(r.get('code39_barcodes', 0) for r in results)
        
        return {
            'total_files': total_files,
            'successful_scans': successful_scans,
            'failed_scans': failed_scans,
            'total_barcodes': total_barcodes,
            'code39_barcodes': code39_barcodes,
            'other_barcodes': total_barcodes - code39_barcodes
        }
    
    def print_summary(self, results):
        """Print summary to console"""
        summary = self.get_summary(results)
        
        print("\n" + "=" * 50)
        print("BATCH SCAN SUMMARY")
        print("=" * 50)
        print(f"📁 Total files processed: {summary['total_files']}")
        print(f"✅ Successful scans: {summary['successful_scans']}")
        print(f"❌ Failed scans: {summary['failed_scans']}")
        print(f"🔍 Total barcodes found: {summary['total_barcodes']}")
        print(f"📊 Code 39 barcodes: {summary['code39_barcodes']}")
        print(f"📊 Other formats: {summary['other_barcodes']}")
        print("=" * 50)


def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Batch Barcode Scanner - Code 39 Detector')
    parser.add_argument('--input', '-i', type=str, 
                       help='Input directory containing images')
    parser.add_argument('--file', '-f', type=str, 
                       help='Single image file to process')
    parser.add_argument('--output', '-o', type=str, 
                       help='Output file for results')
    parser.add_argument('--format', choices=['json', 'csv', 'txt'], default='json',
                       help='Output format (default: json)')
    
    args = parser.parse_args()
    
    if not args.input and not args.file:
        print("❌ Please specify either --input directory or --file")
        sys.exit(1)
    
    # Create scanner
    scanner = BatchBarcodeScanner(output_format=args.format)
    
    # Process input
    if args.file:
        print(f"🔍 Processing single file: {args.file}")
        results = [scanner.scan_image(args.file)]
    else:
        print(f"🔍 Processing directory: {args.input}")
        results = scanner.scan_directory(args.input)
    
    if not results:
        print("❌ No results to process")
        sys.exit(1)
    
    # Print summary
    scanner.print_summary(results)
    
    # Save results if output specified
    if args.output:
        scanner.save_results(results, args.output)
    else:
        # Default output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        default_output = f"batch_scan_results_{timestamp}.{args.format}"
        scanner.save_results(results, default_output)


if __name__ == "__main__":
    main()
