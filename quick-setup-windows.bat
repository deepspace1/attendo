@echo off
echo 🎓 Attendance System - Quick Setup for Windows
echo ================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo After installation, restart your computer and run this script again.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running!
echo.

REM Create directory for the project
if not exist "attendance-system" mkdir attendance-system
cd attendance-system

echo 📥 Downloading configuration file...
curl -s -o docker-compose.yml https://raw.githubusercontent.com/deepspace1/attendo/master/docker-compose.yml

if %errorlevel% neq 0 (
    echo ❌ Failed to download configuration file.
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo ✅ Configuration downloaded successfully!
echo.

echo 🚀 Starting Attendance System...
echo This may take a few minutes to download and start...
echo.

docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start the system.
    echo Please make sure Docker Desktop is running and try again.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for system to start...
timeout /t 30 /nobreak >nul

echo.
echo ✅ Attendance System is now running!
echo.
echo 🌐 Open your browser and go to:
echo    http://localhost
echo.
echo 👤 Login with:
echo    Username: teacher
echo    Password: password123
echo.
echo 📱 Barcode Scanner:
echo    http://localhost/native-camera.html
echo.
echo 🛠 To stop the system later, run:
echo    docker-compose down
echo.
echo 🔄 To start again later, run:
echo    docker-compose up -d
echo.
echo 📊 To check status, run:
echo    docker-compose ps
echo.
echo Happy attendance tracking! 🎉
echo.
pause
