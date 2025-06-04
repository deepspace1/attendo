# Attendance Management System

A web application for teachers to manage student attendance using barcode scanning.

## Features
- Barcode-based student attendance tracking
- Real-time attendance marking
- Class and subject management
- Student record management
- Automatic absent marking for non-scanned students

## Project Structure
- `/backend` - Node.js/Express backend server
- `/frontend` - React frontend application

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Technologies Used
- Backend: Node.js, Express.js
- Frontend: React.js
- Database: MongoDB Atlas (Cloud)
- Barcode Scanner: Web-based barcode scanning
- Containerization: Docker & Docker Compose
- Web Server: Nginx (for production frontend)

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### CI/CD Workflow

#### Backend CI/CD ✅ ENHANCED
- **Testing**: Automated tests, linting, MongoDB connection validation
- **Docker Build**: Builds backend Docker image
- **Docker Push**: Pushes to Docker Hub registry
- **Azure Deployment**: Ready for Azure Container Instances
- **Triggered**: On push/PR to master branch

#### Frontend CI/CD ✅ ENHANCED
- **Docker Build**: Builds frontend Docker image with Nginx
- **Docker Push**: Pushes to Docker Hub registry
- **Multi-stage Build**: Optimized production builds
- **Azure Ready**: Configured for Azure deployment

### 🚀 Deployment Workflow
1. **Code Push** → GitHub Actions triggered
2. **Run Tests** → Validate code quality and functionality
3. **Build Docker Images** → Create containerized applications
4. **Push to Docker Hub** → Store images in registry
5. **Deploy to Azure** → Automatic deployment to cloud

### 🔧 Setup Instructions

**See [DEPLOYMENT-SETUP.md](DEPLOYMENT-SETUP.md) for complete setup guide**

**Quick Setup:**
1. **GitHub Secrets**: Add `DOCKER_USERNAME` and `DOCKER_PASSWORD`
2. **Docker Hub**: Create repository `kumarharsh001/attendoo`
3. **Push Code**: Trigger automatic build and push
4. **Azure Setup**: Configure Azure Container Instances (next phase)

## Docker Deployment ✅ COMPLETED

This project is **fully containerized** using Docker with production-ready configurations.

### 🚀 Quick Start (One Command)

```bash
# Run the automated test script
test-docker.bat
```

This will build, start, and test your entire application stack!

### 📋 What You Get

- **3 Containers**: Frontend (Nginx), Backend (Node.js), Database (MongoDB)
- **Production Ready**: Multi-stage builds, health checks, security best practices
- **Easy Management**: Simple npm scripts for all operations
- **Data Persistence**: MongoDB data survives container restarts
- **Automated Testing**: Built-in health checks and connectivity tests

### 🎯 Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 🛠️ Management Commands

```bash
# Start everything
npm run docker:up

# View logs
npm run docker:logs

# Stop everything
npm run docker:down

# Clean restart
npm run docker:clean && npm run docker:up
```

### 📚 Documentation

- **Quick Start**: [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)
- **Detailed Guide**: [DOCKER.md](DOCKER.md)

### ✅ DevOps Tools Implemented

1. **Git/GitHub** - Version Control
2. **GitHub Actions** - CI/CD Pipeline
3. **Docker** - Containerization
4. **Docker Compose** - Container Orchestration
5. **Nginx** - Web Server & Reverse Proxy