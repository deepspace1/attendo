# Test Images Directory

This directory contains test barcode images for the Python Barcode Scanner.

## Generated Images

Run the barcode generator to create test images:

```bash
# Generate attendance system barcodes
python barcode_generator.py --attendance

# Generate test set
python barcode_generator.py --test-set

# Generate custom barcode
python barcode_generator.py --text "YOUR TEXT"
```

## Image Formats Supported

- PNG (recommended)
- JPG/JPEG
- BMP
- TIFF/TIF

## Testing

Use these images to test the batch scanner:

```bash
python batch_scanner.py --input test_images/ --output results.json
```
