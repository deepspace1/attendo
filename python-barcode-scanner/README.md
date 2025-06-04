# Python Universal Barcode Scanner

A complete Python application for detecting and displaying ALL barcode types using computer vision and mobile devices.

## Features

- **Universal barcode detection** - supports ALL major formats
- **Real-time scanning** using OpenCV and mobile cameras
- **Multiple interfaces** - CLI, GUI, and mobile web app
- **Live camera feed** with professional overlay graphics
- **Mobile camera support** - scan with your phone camera
- **Cross-platform** - works on Windows, Mac, Linux, mobile
- **Export options** - JSON, CSV, TXT formats
- **Batch processing** - scan multiple images at once

## Requirements

- Python 3.7+
- OpenCV (cv2)
- pyzbar
- tkinter (usually included with Python)
- PIL (Pillow)

## Installation

1. **Clone or download this folder**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the scanner:**
   ```bash
   python barcode_scanner.py
   ```

## Supported Barcode Formats

### Linear Barcodes
- **Code 39** - Alphanumeric, widely used
- **Code 128** - High density, ASCII support
- **EAN-13** - European Article Number
- **EAN-8** - Short version of EAN-13
- **UPC-A** - Universal Product Code
- **UPC-E** - Compressed UPC-A
- **Codabar** - Numeric with special characters
- **ITF** - Interleaved 2 of 5
- **Code 93** - Improved Code 39

### 2D Barcodes
- **QR Code** - Quick Response, high capacity
- **DataMatrix** - Compact 2D format
- **PDF417** - Portable Data File
- **Aztec** - High density 2D format

## Usage

### Quick Start
```bash
python quick_start.py
```

### Command Line Scanner
```bash
python barcode_scanner.py --save --camera 0
```

### GUI Scanner
```bash
python gui_scanner.py
```

### Mobile Scanner
```bash
python mobile_server.py
# Then open http://your-ip:8000 on your mobile
```

### Batch Image Processing
```bash
python batch_scanner.py --input images/ --output results.csv --format csv
```

## File Structure

```
python-barcode-scanner/
├── README.md
├── requirements.txt
├── barcode_scanner.py      # Main CLI scanner
├── gui_scanner.py          # GUI version
├── batch_scanner.py        # Batch processing
├── barcode_generator.py    # Generate test barcodes
├── utils/
│   ├── __init__.py
│   ├── detector.py         # Core detection logic
│   └── display.py          # Display utilities
├── test_images/            # Sample barcode images
└── output/                 # Saved results
```

## Code 39 Barcode Format

Code 39 is a variable-length, discrete barcode symbology that can encode:
- Numbers (0-9)
- Letters (A-Z)
- Special characters (-, ., $, /, +, %, space)
- Start/stop character (*)

Example: `*HELLO123*`

## Output

The scanner will display:
- Live camera feed with detected barcodes highlighted
- Decoded barcode text
- Timestamp of detection
- Confidence level
- Barcode type and format

## Troubleshooting

### Camera Issues
- Check camera permissions
- Try different camera indices (0, 1, 2...)
- Ensure good lighting conditions

### Detection Issues
- Ensure barcode is Code 39 format
- Check barcode quality and size
- Adjust camera distance and angle
- Verify barcode is not damaged

### Performance Issues
- Reduce camera resolution
- Adjust detection parameters
- Close other camera applications
