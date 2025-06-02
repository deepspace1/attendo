@echo off
echo Testing Docker Implementation for Attendance System
echo ================================================

echo.
echo 1. Checking Docker installation...
docker --version
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    pause
    exit /b 1
)

echo.
echo 2. Stopping any existing containers...
docker-compose down

echo.
echo 3. Cleaning up old images...
docker system prune -f

echo.
echo 4. Building containers (no cache)...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Failed to build containers
    echo Checking logs...
    docker-compose logs
    pause
    exit /b 1
)

echo.
echo 5. Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)

echo.
echo 6. Waiting for services to start...
timeout /t 30 /nobreak > nul

echo.
echo 7. Checking container status...
docker-compose ps

echo.
echo 8. Checking container logs...
echo Backend logs:
docker-compose logs --tail=10 backend
echo.
echo Frontend logs:
docker-compose logs --tail=10 frontend
echo.
echo MongoDB logs:
docker-compose logs --tail=10 mongodb

echo.
echo 9. Testing backend health endpoint...
timeout /t 5 /nobreak > nul
curl -f http://localhost:5000/api/health 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Backend health check failed - checking if service is running...
    docker-compose ps backend
) else (
    echo SUCCESS: Backend is responding
)

echo.
echo 10. Testing frontend...
curl -f http://localhost 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Frontend might not be ready yet - checking if service is running...
    docker-compose ps frontend
) else (
    echo SUCCESS: Frontend is responding
)

echo.
echo ================================================
echo Docker Test Complete!
echo.
echo Access your application at:
echo - Frontend: http://localhost
echo - Backend API: http://localhost:5000
echo - Health Check: http://localhost:5000/api/health
echo.
echo Useful commands:
echo - View all logs: docker-compose logs
echo - View specific logs: docker-compose logs [service-name]
echo - Stop services: docker-compose down
echo - Restart services: docker-compose restart
echo ================================================

pause
