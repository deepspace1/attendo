@echo off
echo Checking Docker Desktop Status...
echo ================================

echo.
echo 1. Checking if Docker is installed...
docker --version 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
) else (
    echo SUCCESS: Docker is installed
)

echo.
echo 2. Checking if Docker Desktop is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running
    echo Please start Docker Desktop and wait for it to fully load
    echo Look for the Docker whale icon in your system tray
    pause
    exit /b 1
) else (
    echo SUCCESS: Docker Desktop is running
)

echo.
echo 3. Checking Docker Compose...
docker-compose --version 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    pause
    exit /b 1
) else (
    echo SUCCESS: Docker Compose is available
)

echo.
echo ================================
echo All Docker checks passed!
echo You can now run: npm run docker:build
echo ================================
pause
