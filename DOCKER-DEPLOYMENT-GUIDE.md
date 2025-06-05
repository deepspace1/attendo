# 🐳 Docker Deployment Guide

## 🎯 Problem Solved

Your Nginx configuration has been updated to handle the "host not found in upstream backend" error. The new configuration includes:

1. **Dynamic DNS resolution** for Docker container hostnames
2. **Graceful error handling** when backend is unavailable
3. **Health check endpoints** for monitoring
4. **Proper networking** setup for container communication

## 🔧 What Was Fixed

### **Nginx Configuration Improvements:**
- ✅ **Dynamic hostname resolution** using Docker's internal DNS
- ✅ **Error fallback** returns JSON error when backend is down
- ✅ **Timeout settings** prevent hanging requests
- ✅ **Health check endpoint** at `/health`
- ✅ **Upstream configuration** with failure handling

### **Docker Networking:**
- ✅ **Custom network** `attendoo-network` for container communication
- ✅ **Proper container naming** for hostname resolution
- ✅ **Health checks** for both frontend and backend
- ✅ **Restart policies** for reliability

## 🚀 How to Run

### **Option 1: Docker Compose (Recommended)**

```bash
# Start both containers with networking
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### **Option 2: Individual Docker Commands**

**Linux/Mac:**
```bash
chmod +x run-containers.sh
./run-containers.sh
```

**Windows:**
```cmd
run-containers.bat
```

**Manual Commands:**
```bash
# Create network
docker network create attendoo-network

# Start backend
docker run -d \
  --name attendoo-backend \
  --network attendoo-network \
  -p 5000:5000 \
  -e MONGODB_URI="your-mongodb-uri" \
  kumarharsh001/attendoo:backend-latest

# Start frontend
docker run -d \
  --name attendoo-frontend \
  --network attendoo-network \
  -p 80:80 \
  kumarharsh001/attendoo:frontend-latest
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **Backend API** | http://localhost:5000 | API endpoints |
| **Frontend Health** | http://localhost/health | Frontend status |
| **Backend Health** | http://localhost:5000/api/health | Backend status |
| **Scanner Input** | http://localhost/take-attendance | Third-party scanner page |

## 🔍 Error Handling

### **When Backend is Down:**
- **API calls** return JSON error: `{"error": "Backend service is currently unavailable"}`
- **Frontend** continues to work for static content
- **No more Nginx crashes** due to hostname resolution

### **Network Issues:**
- **Containers** automatically restart if they crash
- **Health checks** monitor container status
- **DNS resolution** retries every 30 seconds

## 🛠 Troubleshooting

### **Container Not Starting:**
```bash
# Check container logs
docker logs attendoo-frontend
docker logs attendoo-backend

# Check network
docker network ls
docker network inspect attendoo-network
```

### **Backend Connection Issues:**
```bash
# Test backend directly
curl http://localhost:5000/api/health

# Test from within frontend container
docker exec attendoo-frontend curl http://backend:5000/api/health
```

### **Nginx Configuration Test:**
```bash
# Test nginx config
docker exec attendoo-frontend nginx -t

# Reload nginx
docker exec attendoo-frontend nginx -s reload
```

## 📊 Container Management

### **View Status:**
```bash
docker ps --filter "name=attendoo"
```

### **Update Images:**
```bash
# Pull latest images
docker pull kumarharsh001/attendoo:backend-latest
docker pull kumarharsh001/attendoo:frontend-latest

# Restart with new images
docker-compose down
docker-compose up -d
```

### **Clean Up:**
```bash
# Stop and remove containers
docker stop attendoo-frontend attendoo-backend
docker rm attendoo-frontend attendoo-backend

# Remove network
docker network rm attendoo-network
```

## 🎯 Key Benefits

1. **No More Crashes**: Nginx won't crash if backend is unavailable
2. **Graceful Degradation**: Frontend works even when backend is down
3. **Easy Deployment**: Simple commands to run everything
4. **Health Monitoring**: Built-in health checks
5. **Auto-Recovery**: Containers restart automatically
6. **Network Isolation**: Secure container communication

## 🔄 CI/CD Integration

Your simplified CI/CD pipeline builds these images:
- `kumarharsh001/attendoo:backend-latest`
- `kumarharsh001/attendoo:frontend-latest`

The deployment scripts automatically use the latest images from Docker Hub.

## ✅ Ready to Deploy!

Your attendance system is now production-ready with robust error handling and proper Docker networking! 🎉
