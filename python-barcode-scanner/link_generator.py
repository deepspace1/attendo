#!/usr/bin/env python3
"""
Mobile Link Generator
Creates shareable links and QR codes for mobile barcode scanner access

Usage:
    python link_generator.py [--service ngrok|https|local]
"""

import socket
import qrcode
import argparse
import webbrowser
import os
from PIL import Image, ImageDraw, ImageFont


def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "192.168.1.100"


def create_enhanced_qr(url, title, filename, color="#007bff"):
    """Create enhanced QR code with title and instructions"""
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR code image
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Create enhanced image with instructions
    img_width = 600
    img_height = 750
    
    # Create white background
    final_img = Image.new('RGB', (img_width, img_height), 'white')
    
    # Paste QR code
    qr_size = 350
    qr_img = qr_img.resize((qr_size, qr_size))
    qr_x = (img_width - qr_size) // 2
    qr_y = 120
    final_img.paste(qr_img, (qr_x, qr_y))
    
    # Add text
    draw = ImageDraw.Draw(final_img)
    
    # Try to load fonts
    try:
        title_font = ImageFont.truetype("arial.ttf", 28)
        subtitle_font = ImageFont.truetype("arial.ttf", 18)
        text_font = ImageFont.truetype("arial.ttf", 16)
        url_font = ImageFont.truetype("arial.ttf", 12)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        url_font = ImageFont.load_default()
    
    # Title
    title_text = f"📱 {title}"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (img_width - title_width) // 2
    draw.text((title_x, 30), title_text, fill=color, font=title_font)
    
    # Subtitle
    subtitle = "Universal Barcode Scanner"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (img_width - subtitle_width) // 2
    draw.text((subtitle_x, 70), subtitle, fill="gray", font=subtitle_font)
    
    # Instructions
    instructions = [
        "1. Scan this QR code with your phone camera",
        "2. Tap the notification to open the scanner",
        "3. Allow camera permissions when prompted",
        "4. Point camera at barcodes to scan them",
        "5. View results instantly on your screen!"
    ]
    
    y_pos = qr_y + qr_size + 40
    for instruction in instructions:
        bbox = draw.textbbox((0, 0), instruction, font=text_font)
        text_width = bbox[2] - bbox[0]
        text_x = (img_width - text_width) // 2
        draw.text((text_x, y_pos), instruction, fill="black", font=text_font)
        y_pos += 25
    
    # URL at bottom
    url_text = f"URL: {url}"
    url_bbox = draw.textbbox((0, 0), url_text, font=url_font)
    url_width = url_bbox[2] - url_bbox[0]
    url_x = (img_width - url_width) // 2
    draw.text((url_x, img_height - 50), url_text, fill="gray", font=url_font)
    
    # Save image
    final_img.save(filename)
    return filename


def generate_local_link(port=8000):
    """Generate local network link"""
    local_ip = get_local_ip()
    local_url = f"http://{local_ip}:{port}"
    
    print(f"🏠 Local Network Access")
    print(f"📱 URL: {local_url}")
    print("⚠️  Note: Camera may not work due to HTTP (not HTTPS)")
    
    # Create QR code
    qr_file = create_enhanced_qr(
        local_url, 
        "Local Network Scanner", 
        "local_network_qr.png",
        "#6c757d"
    )
    
    print(f"🔗 QR Code: {qr_file}")
    
    return local_url, qr_file


def generate_https_link(port=8443):
    """Generate HTTPS link with self-signed certificate"""
    local_ip = get_local_ip()
    https_url = f"https://{local_ip}:{port}"
    
    print(f"🔒 HTTPS Local Access")
    print(f"📱 URL: {https_url}")
    print("✅ Camera will work (after accepting security warning)")
    
    # Create QR code
    qr_file = create_enhanced_qr(
        https_url, 
        "HTTPS Secure Scanner", 
        "https_secure_qr.png",
        "#28a745"
    )
    
    print(f"🔗 QR Code: {qr_file}")
    print("\n💡 Setup Instructions:")
    print("1. Run: python https_mobile_server.py")
    print("2. Scan the QR code")
    print("3. Accept security warning on phone")
    print("4. Allow camera permissions")
    
    return https_url, qr_file


def generate_ngrok_link():
    """Generate ngrok public link"""
    print(f"🌐 Ngrok Public Access")
    print("📱 URL: Will be generated when ngrok starts")
    print("✅ Camera works perfectly (real HTTPS)")
    
    # Create placeholder QR code
    placeholder_url = "https://your-ngrok-url.ngrok.io"
    qr_file = create_enhanced_qr(
        placeholder_url, 
        "Ngrok Public Scanner", 
        "ngrok_public_qr.png",
        "#ff6b6b"
    )
    
    print(f"🔗 Placeholder QR: {qr_file}")
    print("\n💡 Setup Instructions:")
    print("1. Install ngrok: https://ngrok.com/download")
    print("2. Run: python ngrok_mobile_server.py")
    print("3. Scan the generated QR code")
    print("4. Works from anywhere with internet!")
    
    return placeholder_url, qr_file


def create_comparison_page():
    """Create HTML page comparing all options"""
    
    local_ip = get_local_ip()
    
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📱 Mobile Barcode Scanner Options</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }}
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }}
        .options {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }}
        .option {{
            border: 2px solid #ddd;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            transition: all 0.3s ease;
        }}
        .option:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }}
        .option.local {{ border-color: #6c757d; }}
        .option.https {{ border-color: #28a745; }}
        .option.ngrok {{ border-color: #ff6b6b; }}
        .option h3 {{
            margin-top: 0;
            font-size: 1.5rem;
        }}
        .option.local h3 {{ color: #6c757d; }}
        .option.https h3 {{ color: #28a745; }}
        .option.ngrok h3 {{ color: #ff6b6b; }}
        .qr-code {{
            margin: 20px 0;
        }}
        .qr-code img {{
            max-width: 200px;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 10px;
        }}
        .pros {{
            background: #d4edda;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: left;
        }}
        .cons {{
            background: #f8d7da;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: left;
        }}
        .command {{
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
            border-left: 4px solid #007bff;
        }}
        .url {{
            background: #e7f3ff;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
            word-break: break-all;
        }}
        .recommended {{
            position: relative;
            overflow: hidden;
        }}
        .recommended::before {{
            content: "RECOMMENDED";
            position: absolute;
            top: 10px;
            right: -30px;
            background: #ff6b6b;
            color: white;
            padding: 5px 40px;
            transform: rotate(45deg);
            font-size: 0.8rem;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Mobile Barcode Scanner Access Options</h1>
        <p style="text-align: center; color: #666; font-size: 1.1rem;">
            Choose the best method to access the barcode scanner on your mobile device
        </p>
        
        <div class="options">
            <!-- Local Network Option -->
            <div class="option local">
                <h3>🏠 Local Network</h3>
                <div class="qr-code">
                    <img src="local_network_qr.png" alt="Local Network QR Code">
                </div>
                <div class="url">http://{local_ip}:8000</div>
                <div class="command">python mobile_server.py</div>
                
                <div class="pros">
                    <strong>✅ Pros:</strong>
                    <ul>
                        <li>Simple setup</li>
                        <li>No additional software needed</li>
                        <li>Fast local connection</li>
                    </ul>
                </div>
                
                <div class="cons">
                    <strong>❌ Cons:</strong>
                    <ul>
                        <li>Camera may not work (HTTP limitation)</li>
                        <li>Same WiFi network required</li>
                        <li>Firewall issues possible</li>
                    </ul>
                </div>
            </div>
            
            <!-- HTTPS Option -->
            <div class="option https">
                <h3>🔒 HTTPS Secure</h3>
                <div class="qr-code">
                    <img src="https_secure_qr.png" alt="HTTPS Secure QR Code">
                </div>
                <div class="url">https://{local_ip}:8443</div>
                <div class="command">python https_mobile_server.py</div>
                
                <div class="pros">
                    <strong>✅ Pros:</strong>
                    <ul>
                        <li>Camera works reliably</li>
                        <li>Secure HTTPS connection</li>
                        <li>No external dependencies</li>
                    </ul>
                </div>
                
                <div class="cons">
                    <strong>❌ Cons:</strong>
                    <ul>
                        <li>Security warning (self-signed cert)</li>
                        <li>Same WiFi network required</li>
                        <li>Requires certificate setup</li>
                    </ul>
                </div>
            </div>
            
            <!-- Ngrok Option -->
            <div class="option ngrok recommended">
                <h3>🌐 Ngrok Public</h3>
                <div class="qr-code">
                    <img src="ngrok_public_qr.png" alt="Ngrok Public QR Code">
                </div>
                <div class="url">https://random-url.ngrok.io</div>
                <div class="command">python ngrok_mobile_server.py</div>
                
                <div class="pros">
                    <strong>✅ Pros:</strong>
                    <ul>
                        <li>Camera works perfectly</li>
                        <li>Real HTTPS certificate</li>
                        <li>Works from anywhere</li>
                        <li>No firewall issues</li>
                        <li>Easy sharing</li>
                    </ul>
                </div>
                
                <div class="cons">
                    <strong>❌ Cons:</strong>
                    <ul>
                        <li>Requires ngrok installation</li>
                        <li>Free account needed</li>
                        <li>URL changes each restart</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3>🚀 Quick Start Recommendations</h3>
            <ol>
                <li><strong>For best experience:</strong> Use Ngrok (install from ngrok.com)</li>
                <li><strong>For local testing:</strong> Use HTTPS option</li>
                <li><strong>For simple setup:</strong> Try local network first</li>
            </ol>
            
            <h3>📱 Camera Access Requirements</h3>
            <p>Modern browsers require <strong>HTTPS</strong> for camera access on mobile devices. 
            The local HTTP option may not work for camera access, but the HTTPS and Ngrok options will work perfectly.</p>
        </div>
    </div>
</body>
</html>
    """
    
    # Save HTML file
    html_file = "mobile_scanner_options.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return html_file


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Mobile Barcode Scanner Link Generator')
    parser.add_argument('--service', '-s', choices=['local', 'https', 'ngrok', 'all'], 
                       default='all', help='Service type to generate links for')
    parser.add_argument('--port', '-p', type=int, default=8000,
                       help='Port number (default: 8000)')
    
    args = parser.parse_args()
    
    print("📱 Mobile Barcode Scanner Link Generator")
    print("=" * 50)
    
    generated_files = []
    
    if args.service in ['local', 'all']:
        print("\n🏠 Generating Local Network Access...")
        url, qr_file = generate_local_link(args.port)
        generated_files.append(qr_file)
    
    if args.service in ['https', 'all']:
        print("\n🔒 Generating HTTPS Secure Access...")
        url, qr_file = generate_https_link(8443)
        generated_files.append(qr_file)
    
    if args.service in ['ngrok', 'all']:
        print("\n🌐 Generating Ngrok Public Access...")
        url, qr_file = generate_ngrok_link()
        generated_files.append(qr_file)
    
    if args.service == 'all':
        print("\n📄 Creating comparison page...")
        html_file = create_comparison_page()
        generated_files.append(html_file)
        
        print(f"✅ Comparison page: {html_file}")
        
        # Open comparison page
        try:
            webbrowser.open(html_file)
            print("🌐 Opened comparison page in browser")
        except:
            print("⚠️  Could not open browser automatically")
    
    print("\n" + "=" * 50)
    print("🎉 Link Generation Complete!")
    print("=" * 50)
    
    print(f"📁 Generated files:")
    for file in generated_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} (failed)")
    
    print("\n💡 Next Steps:")
    print("1. Choose your preferred access method")
    print("2. Run the corresponding Python server")
    print("3. Scan the QR code with your phone")
    print("4. Allow camera permissions")
    print("5. Start scanning barcodes!")
    
    print("\n🏆 Recommended: Use Ngrok for best camera compatibility")


if __name__ == "__main__":
    main()
