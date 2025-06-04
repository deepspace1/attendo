#!/usr/bin/env python3
"""
Generate QR Code for Mobile Scanner Access
Creates a QR code with your network IP for easy mobile access

Usage:
    python generate_mobile_qr.py [--port 8000]
"""

import socket
import qrcode
import argparse
from PIL import Image, ImageDraw, ImageFont
import os


def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "192.168.1.100"  # Fallback IP


def generate_mobile_access_qr(port=8000):
    """Generate QR code for mobile scanner access"""
    
    # Get local IP
    local_ip = get_local_ip()
    mobile_url = f"http://{local_ip}:{port}"
    
    print(f"🌐 Generating QR code for mobile access...")
    print(f"📱 Mobile URL: {mobile_url}")
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    qr.add_data(mobile_url)
    qr.make(fit=True)
    
    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Create a larger image with instructions
    img_width = 600
    img_height = 700
    
    # Create white background
    final_img = Image.new('RGB', (img_width, img_height), 'white')
    
    # Paste QR code in center
    qr_size = 400
    qr_img = qr_img.resize((qr_size, qr_size))
    qr_x = (img_width - qr_size) // 2
    qr_y = 80
    final_img.paste(qr_img, (qr_x, qr_y))
    
    # Add text instructions
    draw = ImageDraw.Draw(final_img)
    
    # Try to load a font, fallback to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 24)
        text_font = ImageFont.truetype("arial.ttf", 16)
        url_font = ImageFont.truetype("arial.ttf", 14)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        url_font = ImageFont.load_default()
    
    # Title
    title = "📱 Mobile Barcode Scanner"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (img_width - title_width) // 2
    draw.text((title_x, 20), title, fill="black", font=title_font)
    
    # Instructions
    instructions = [
        "1. Scan this QR code with your phone",
        "2. Allow camera permissions",
        "3. Point camera at barcodes to scan",
        "4. Results will appear on screen"
    ]
    
    y_pos = qr_y + qr_size + 30
    for instruction in instructions:
        bbox = draw.textbbox((0, 0), instruction, font=text_font)
        text_width = bbox[2] - bbox[0]
        text_x = (img_width - text_width) // 2
        draw.text((text_x, y_pos), instruction, fill="black", font=text_font)
        y_pos += 30
    
    # URL at bottom
    url_text = f"URL: {mobile_url}"
    url_bbox = draw.textbbox((0, 0), url_text, font=url_font)
    url_width = url_bbox[2] - url_bbox[0]
    url_x = (img_width - url_width) // 2
    draw.text((url_x, img_height - 40), url_text, fill="gray", font=url_font)
    
    # Save the image
    output_path = "mobile_scanner_qr.png"
    final_img.save(output_path)
    
    print(f"✅ QR code saved as: {output_path}")
    print(f"📱 Scan this QR code with your phone to access the mobile scanner!")
    
    return output_path, mobile_url


def create_simple_html_page(mobile_url, port=8000):
    """Create a simple HTML page with QR code and instructions"""
    
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile Scanner Setup</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }}
        .container {{
            background: white;
            color: black;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }}
        .qr-code {{
            margin: 20px 0;
        }}
        .qr-code img {{
            max-width: 100%;
            height: auto;
            border: 2px solid #ddd;
            border-radius: 10px;
        }}
        .instructions {{
            text-align: left;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }}
        .instructions h3 {{
            margin-top: 0;
            color: #333;
        }}
        .instructions ol {{
            padding-left: 20px;
        }}
        .instructions li {{
            margin: 10px 0;
            color: #555;
        }}
        .url-box {{
            background: #e7f3ff;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }}
        .url-box code {{
            font-family: monospace;
            background: white;
            padding: 5px 10px;
            border-radius: 5px;
            color: #007bff;
        }}
        .button {{
            background: #007bff;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }}
        .button:hover {{
            background: #0056b3;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Mobile Barcode Scanner Setup</h1>
        
        <div class="qr-code">
            <img src="mobile_scanner_qr.png" alt="QR Code for Mobile Scanner">
        </div>
        
        <div class="instructions">
            <h3>🚀 How to Use:</h3>
            <ol>
                <li><strong>Scan the QR code above</strong> with your phone's camera app</li>
                <li><strong>Tap the notification</strong> to open the mobile scanner</li>
                <li><strong>Allow camera permissions</strong> when prompted</li>
                <li><strong>Point your camera at barcodes</strong> to scan them</li>
                <li><strong>View results</strong> instantly on your phone screen</li>
            </ol>
        </div>
        
        <div class="url-box">
            <strong>📡 Mobile URL:</strong><br>
            <code>{mobile_url}</code>
        </div>
        
        <p><strong>💡 Tip:</strong> Make sure your phone and computer are on the same WiFi network!</p>
        
        <a href="{mobile_url}" class="button">🔗 Open Mobile Scanner</a>
        <a href="/status" class="button">📊 View Status</a>
    </div>
</body>
</html>
"""
    
    # Save HTML file
    html_path = "mobile_setup.html"
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Setup page saved as: {html_path}")
    return html_path


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Generate QR code for mobile scanner access')
    parser.add_argument('--port', '-p', type=int, default=8000,
                       help='Port number for mobile server (default: 8000)')
    
    args = parser.parse_args()
    
    print("📱 Mobile Scanner QR Code Generator")
    print("=" * 40)
    
    # Generate QR code
    qr_path, mobile_url = generate_mobile_access_qr(args.port)
    
    # Create HTML setup page
    html_path = create_simple_html_page(mobile_url, args.port)
    
    print("\n" + "=" * 40)
    print("🎉 Mobile Scanner Setup Complete!")
    print("=" * 40)
    print(f"📱 QR Code: {qr_path}")
    print(f"🌐 Setup Page: {html_path}")
    print(f"📡 Mobile URL: {mobile_url}")
    
    print("\n📋 Next Steps:")
    print("1. Start the mobile server:")
    print(f"   python mobile_server.py --port {args.port}")
    print("2. Scan the QR code with your phone")
    print("3. Allow camera permissions")
    print("4. Start scanning barcodes!")
    
    print("\n💡 Troubleshooting:")
    print("- Make sure phone and computer are on same WiFi")
    print("- Check firewall settings if connection fails")
    print("- Try different port if 8000 is busy")


if __name__ == "__main__":
    main()
