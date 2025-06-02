# Docker Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

## Quick Start (3 Steps)

### 1. Run the Test Script
```bash
test-docker.bat
```

This script will:
- Check Docker installation
- Build all containers
- Start all services
- Test connectivity
- Show you the results

### 2. Access Your Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 3. Manage Your Containers

**Start services:**
```bash
npm run docker:up
# or
docker-compose up -d
```

**Stop services:**
```bash
npm run docker:down
# or
docker-compose down
```

**View logs:**
```bash
npm run docker:logs
# or
docker-compose logs
```

**Restart services:**
```bash
npm run docker:restart
# or
docker-compose restart
```

## Troubleshooting

### If containers won't start:
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Rebuild containers
docker-compose build --no-cache
```

### If you get port conflicts:
Edit `docker-compose.yml` and change the ports:
```yaml
ports:
  - "8080:80"    # Frontend (change from 80:80)
  - "5001:5000"  # Backend (change from 5000:5000)
```

### Clean everything and start fresh:
```bash
docker-compose down -v --rmi all
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

## What's Running

When everything is working, you'll have:

1. **MongoDB Container**: Database server
2. **Backend Container**: Node.js API server
3. **Frontend Container**: React app served by Nginx

All containers are connected via a Docker network and can communicate with each other.

## Success Indicators

✅ All containers show "Up" status in `docker-compose ps`
✅ Frontend loads at http://localhost
✅ Backend responds at http://localhost:5000/api/health
✅ You can create students and take attendance through the web interface
✅ Data persists when you restart containers
