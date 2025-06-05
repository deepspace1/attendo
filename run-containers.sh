#!/bin/bash

# Attendance System - Docker Container Setup Script
# This script runs the frontend and backend containers with proper networking

echo "🚀 Starting Attendance System Containers..."

# Create custom network if it doesn't exist
echo "📡 Creating Docker network..."
docker network create attendoo-network 2>/dev/null || echo "Network already exists"

# Stop and remove existing containers if they exist
echo "🧹 Cleaning up existing containers..."
docker stop attendoo-backend attendoo-frontend 2>/dev/null || true
docker rm attendoo-backend attendoo-frontend 2>/dev/null || true

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker pull kumarharsh001/attendoo:backend-latest
docker pull kumarharsh001/attendoo:frontend-latest

# Start backend container
echo "🔧 Starting backend container..."
docker run -d \
  --name attendoo-backend \
  --network attendoo-network \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" \
  -e PORT=5000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  kumarharsh001/attendoo:backend-latest

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Start frontend container
echo "🌐 Starting frontend container..."
docker run -d \
  --name attendoo-frontend \
  --network attendoo-network \
  -p 80:80 \
  -e REACT_APP_API_BASE_URL=http://backend:5000 \
  -e BACKEND_URL=http://backend:5000 \
  --restart unless-stopped \
  kumarharsh001/attendoo:frontend-latest

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check container status
echo "📊 Container Status:"
docker ps --filter "name=attendoo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Attendance System is now running!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:5000"
echo "🏥 Frontend Health: http://localhost/health"
echo "🏥 Backend Health: http://localhost:5000/api/health"
echo ""
echo "📱 Third-party scanner input field is ready at: http://localhost/take-attendance"
echo ""
echo "To stop the containers, run:"
echo "docker stop attendoo-frontend attendoo-backend"
echo ""
echo "To view logs:"
echo "docker logs attendoo-frontend"
echo "docker logs attendoo-backend"
