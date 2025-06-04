# Output Directory

This directory stores the output files from barcode scanning operations.

## File Types

- **JSON files** - Detailed scan results with metadata
- **CSV files** - Tabular data for spreadsheet analysis  
- **TXT files** - Human-readable scan reports

## Generated Files

- `detections_YYYYMMDD_HHMMSS.json` - Automatic saves from CLI scanner
- `manual_save_YYYYMMDD_HHMMSS.json` - Manual saves (press 's' in scanner)
- `batch_scan_results_YYYYMMDD_HHMMSS.*` - Batch processing results

## Example Usage

```bash
# CLI scanner with auto-save
python barcode_scanner.py --save --output my_scan.json

# Batch processing with CSV output
python batch_scanner.py --input test_images/ --output results.csv --format csv
```
