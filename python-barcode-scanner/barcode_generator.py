#!/usr/bin/env python3
"""
Barcode Generator - Code 39
Generate Code 39 barcodes for testing the scanner

Usage:
    python barcode_generator.py --text "HELLO123" --output test_barcode.png
"""

import argparse
import os
from barcode import Code39, Code128, EAN13, EAN8, UPCA
from barcode.writer import ImageWriter
from PIL import Image, ImageDraw, ImageFont
import qrcode


class BarcodeGenerator:
    def __init__(self):
        self.output_dir = "test_images"
        self.ensure_output_dir()
    
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            print(f"Created output directory: {self.output_dir}")
    
    def generate_code39(self, text, filename=None, add_checksum=False):
        """
        Generate Code 39 barcode
        
        Args:
            text: Text to encode
            filename: Output filename (optional)
            add_checksum: Whether to add checksum
            
        Returns:
            str: Path to generated image
        """
        # Clean text for Code 39 (uppercase, valid characters only)
        clean_text = self.clean_text_for_code39(text)
        
        if not filename:
            filename = f"code39_{clean_text.replace(' ', '_')}"
        
        # Remove extension if provided
        if filename.endswith('.png'):
            filename = filename[:-4]
        
        output_path = os.path.join(self.output_dir, filename)
        
        try:
            # Create Code 39 barcode
            code39 = Code39(clean_text, writer=ImageWriter(), add_checksum=add_checksum)
            
            # Save barcode
            full_path = code39.save(output_path)
            
            print(f"✅ Generated Code 39 barcode: {full_path}")
            print(f"   Text: {clean_text}")
            print(f"   Checksum: {'Yes' if add_checksum else 'No'}")
            
            return full_path
            
        except Exception as e:
            print(f"❌ Error generating barcode: {e}")
            return None
    
    def clean_text_for_code39(self, text):
        """
        Clean text to be compatible with Code 39
        
        Args:
            text: Input text
            
        Returns:
            str: Cleaned text
        """
        # Code 39 valid characters
        valid_chars = set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%')
        
        # Convert to uppercase and filter valid characters
        cleaned = ''.join(c for c in text.upper() if c in valid_chars)
        
        if not cleaned:
            cleaned = "SAMPLE"
            print(f"⚠️  Invalid characters removed. Using: {cleaned}")
        
        return cleaned
    
    def generate_qr_code(self, text, filename=None):
        """Generate QR Code"""
        if not filename:
            filename = f"qr_{text.replace(' ', '_')[:20]}"

        output_path = os.path.join(self.output_dir, f"{filename}.png")

        try:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(text)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            img.save(output_path)

            print(f"✅ Generated QR Code: {output_path}")
            print(f"   Text: {text}")
            return output_path

        except Exception as e:
            print(f"❌ Error generating QR code: {e}")
            return None

    def generate_code128(self, text, filename=None):
        """Generate Code 128 barcode"""
        if not filename:
            filename = f"code128_{text.replace(' ', '_')[:20]}"

        output_path = os.path.join(self.output_dir, filename)

        try:
            code128 = Code128(text, writer=ImageWriter())
            full_path = code128.save(output_path)

            print(f"✅ Generated Code 128 barcode: {full_path}")
            print(f"   Text: {text}")
            return full_path

        except Exception as e:
            print(f"❌ Error generating Code 128: {e}")
            return None

    def generate_test_set(self):
        """Generate a comprehensive set of test barcodes"""
        test_data = [
            ("Code39", "HELLO123"),
            ("Code39", "STUDENT001"),
            ("Code128", "Hello World 123"),
            ("Code128", "Test-Barcode-456"),
            ("QR", "https://example.com"),
            ("QR", "Sample QR Code Data"),
            ("Code39", "ATTENDANCE"),
            ("Code39", "SCAN-ME"),
            ("Code128", "Mixed Case Text 789"),
            ("QR", "Mobile Scanner Test")
        ]

        print("🔧 Generating comprehensive test barcode set...")
        generated_files = []

        for i, (barcode_type, text) in enumerate(test_data, 1):
            filename = f"test_{i:02d}_{barcode_type}_{text.replace(' ', '_').replace('-', '_')[:15]}"

            if barcode_type == "Code39":
                file_path = self.generate_code39(text, filename)
            elif barcode_type == "Code128":
                file_path = self.generate_code128(text, filename)
            elif barcode_type == "QR":
                file_path = self.generate_qr_code(text, filename)
            else:
                continue

            if file_path:
                generated_files.append(file_path)

        print(f"\n✅ Generated {len(generated_files)} test barcodes in '{self.output_dir}' folder")
        print("📊 Types generated: Code 39, Code 128, QR Code")
        return generated_files
    
    def create_barcode_sheet(self, texts, sheet_filename="barcode_sheet.png"):
        """
        Create a sheet with multiple barcodes
        
        Args:
            texts: List of texts to encode
            sheet_filename: Output filename for the sheet
        """
        print(f"📄 Creating barcode sheet with {len(texts)} barcodes...")
        
        # Generate individual barcodes first
        barcode_files = []
        for text in texts:
            filename = f"temp_{text.replace(' ', '_')}"
            file_path = self.generate_code39(text, filename)
            if file_path:
                barcode_files.append(file_path)
        
        if not barcode_files:
            print("❌ No barcodes generated for sheet")
            return None
        
        # Create sheet
        try:
            # Load first barcode to get dimensions
            first_img = Image.open(barcode_files[0])
            barcode_width, barcode_height = first_img.size
            
            # Calculate sheet dimensions
            cols = 2
            rows = (len(barcode_files) + cols - 1) // cols
            
            sheet_width = cols * barcode_width + (cols + 1) * 20  # 20px margin
            sheet_height = rows * (barcode_height + 40) + 40  # 40px for text + margins
            
            # Create sheet image
            sheet = Image.new('RGB', (sheet_width, sheet_height), 'white')
            draw = ImageDraw.Draw(sheet)
            
            # Try to load a font
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            # Place barcodes on sheet
            for i, (barcode_file, text) in enumerate(zip(barcode_files, texts)):
                row = i // cols
                col = i % cols
                
                x = col * (barcode_width + 20) + 20
                y = row * (barcode_height + 40) + 20
                
                # Load and paste barcode
                barcode_img = Image.open(barcode_file)
                sheet.paste(barcode_img, (x, y))
                
                # Add text label
                text_y = y + barcode_height + 5
                draw.text((x, text_y), text, fill='black', font=font)
            
            # Save sheet
            sheet_path = os.path.join(self.output_dir, sheet_filename)
            sheet.save(sheet_path)
            
            print(f"✅ Barcode sheet saved: {sheet_path}")
            
            # Clean up temporary files
            for temp_file in barcode_files:
                if "temp_" in temp_file:
                    try:
                        os.remove(temp_file)
                    except:
                        pass
            
            return sheet_path
            
        except Exception as e:
            print(f"❌ Error creating barcode sheet: {e}")
            return None
    
    def generate_attendance_barcodes(self):
        """Generate barcodes for attendance system testing"""
        attendance_data = [
            "123456789",  # John Doe
            "987654321",  # Jane Smith
            "456789123",  # Mike Johnson
            "789123456",  # Sarah Wilson
            "321654987",  # David Brown
        ]
        
        print("🎓 Generating attendance system test barcodes...")
        
        for barcode_id in attendance_data:
            filename = f"attendance_{barcode_id}"
            self.generate_code39(barcode_id, filename)
        
        # Create a sheet for easy printing
        self.create_barcode_sheet(attendance_data, "attendance_barcodes.png")
        
        print("✅ Attendance barcodes generated!")
        print("   Use these with your attendance system:")
        for barcode_id in attendance_data:
            print(f"   - {barcode_id}")


def main():
    """Main function with argument parsing"""
    parser = argparse.ArgumentParser(description='Code 39 Barcode Generator')
    parser.add_argument('--text', '-t', type=str, 
                       help='Text to encode in barcode')
    parser.add_argument('--output', '-o', type=str, 
                       help='Output filename')
    parser.add_argument('--checksum', '-c', action='store_true',
                       help='Add checksum to barcode')
    parser.add_argument('--test-set', action='store_true',
                       help='Generate test set of barcodes')
    parser.add_argument('--attendance', action='store_true',
                       help='Generate attendance system test barcodes')
    parser.add_argument('--sheet', nargs='+', 
                       help='Create barcode sheet with multiple texts')
    
    args = parser.parse_args()
    
    generator = BarcodeGenerator()
    
    if args.attendance:
        generator.generate_attendance_barcodes()
    elif args.test_set:
        generator.generate_test_set()
    elif args.sheet:
        generator.create_barcode_sheet(args.sheet)
    elif args.text:
        generator.generate_code39(args.text, args.output, args.checksum)
    else:
        # Interactive mode
        print("🔧 Code 39 Barcode Generator")
        print("=" * 40)
        
        while True:
            print("\nOptions:")
            print("1. Generate single barcode")
            print("2. Generate test set")
            print("3. Generate attendance barcodes")
            print("4. Create barcode sheet")
            print("5. Exit")
            
            choice = input("\nEnter choice (1-5): ").strip()
            
            if choice == '1':
                text = input("Enter text to encode: ").strip()
                if text:
                    generator.generate_code39(text)
            elif choice == '2':
                generator.generate_test_set()
            elif choice == '3':
                generator.generate_attendance_barcodes()
            elif choice == '4':
                texts = input("Enter texts separated by commas: ").strip().split(',')
                texts = [t.strip() for t in texts if t.strip()]
                if texts:
                    generator.create_barcode_sheet(texts)
            elif choice == '5':
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice")


if __name__ == "__main__":
    main()
