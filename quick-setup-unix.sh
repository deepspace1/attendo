#!/bin/bash

echo "🎓 Attendance System - Quick Setup for Mac/Linux"
echo "================================================"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo
    echo "Please install Docker first:"
    echo "Mac: https://www.docker.com/products/docker-desktop/"
    echo "Linux: sudo apt install docker.io docker-compose"
    echo
    echo "After installation, run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo
    echo "Please start Docker Desktop (Mac) or Docker service (Linux):"
    echo "Mac: Open Docker Desktop application"
    echo "Linux: sudo systemctl start docker"
    echo
    echo "Then run this script again."
    exit 1
fi

echo "✅ Docker is installed and running!"
echo

# Create directory for the project
mkdir -p attendance-system
cd attendance-system

echo "📥 Downloading configuration file..."
if curl -s -o docker-compose.yml https://raw.githubusercontent.com/deepspace1/attendo/master/docker-compose.yml; then
    echo "✅ Configuration downloaded successfully!"
else
    echo "❌ Failed to download configuration file."
    echo "Please check your internet connection and try again."
    exit 1
fi

echo
echo "🚀 Starting Attendance System..."
echo "This may take a few minutes to download and start..."
echo

if docker-compose up -d; then
    echo
    echo "⏳ Waiting for system to start..."
    sleep 30
    
    echo
    echo "✅ Attendance System is now running!"
    echo
    echo "🌐 Open your browser and go to:"
    echo "   http://localhost"
    echo
    echo "👤 Login with:"
    echo "   Username: teacher"
    echo "   Password: password123"
    echo
    echo "📱 Barcode Scanner:"
    echo "   http://localhost/native-camera.html"
    echo
    echo "🛠 To stop the system later, run:"
    echo "   docker-compose down"
    echo
    echo "🔄 To start again later, run:"
    echo "   docker-compose up -d"
    echo
    echo "📊 To check status, run:"
    echo "   docker-compose ps"
    echo
    echo "Happy attendance tracking! 🎉"
else
    echo "❌ Failed to start the system."
    echo "Please make sure Docker is running and try again."
    exit 1
fi
