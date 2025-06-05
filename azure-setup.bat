@echo off
echo 🚀 Azure Deployment Setup for Attendance System
echo ==============================================
echo.

REM Check if Azure CLI is installed
echo 🔍 Checking if Azure CLI is installed...
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Azure CLI is not installed or not found in PATH!
    echo.
    echo 📥 Please install Azure CLI first:
    echo 1. Download from: https://aka.ms/installazurecliwindows
    echo 2. Run the installer as Administrator
    echo 3. Restart your computer
    echo 4. Run this script again
    echo.
    echo 🔄 Alternative installation methods:
    echo - PowerShell: winget install Microsoft.AzureCLI
    echo - Or download MSI installer from the link above
    echo.
    echo Press any key to open the download page...
    pause >nul
    start https://aka.ms/installazurecliwindows
    echo.
    echo After installation, restart your computer and run this script again.
    echo.
    pause
    exit /b 1
)
echo ✅ Azure CLI is installed!
echo.

REM Login to Azure
echo 🔑 Starting Azure login...
az login
if %errorlevel% neq 0 (
    echo ❌ Azure login failed with error code %errorlevel%
    pause
    exit /b 1
)
echo ✅ Successfully logged into Azure!
echo.

REM List subscriptions
echo 📋 Fetching Azure subscriptions...
az account list --output table
echo.

set /p SUBSCRIPTION="Enter your subscription name or ID (press Enter for default): "
if not "%SUBSCRIPTION%"=="" (
    echo Setting subscription to %SUBSCRIPTION%...
    az account set --subscription "%SUBSCRIPTION%"
    if %errorlevel% neq 0 (
        echo ❌ Failed to set subscription! Error code: %errorlevel%
        pause
        exit /b 1
    )
    echo ✅ Subscription set to: %SUBSCRIPTION%
)

REM Define constants
set RESOURCE_GROUP=attendoo-rg
set LOCATION=eastus
set BACKEND_NAME=attendoo-backend
set FRONTEND_NAME=attendoo-frontend

echo 🏗️ Starting resource group creation...
az group create --name %RESOURCE_GROUP% --location %LOCATION%
if %errorlevel% neq 0 (
    echo ❌ Resource group creation failed! Error code: %errorlevel%
    pause
    exit /b 1
)
echo ✅ Resource group created!

REM Create Service Principal
echo 🔐 Creating service principal...
for /f "delims=" %%i in ('az account show --query id --output tsv') do set SUBSCRIPTION_ID=%%i

az ad sp create-for-rbac --name "attendoo-github-actions" --role contributor --scopes /subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%RESOURCE_GROUP% --sdk-auth > sp-output.json
if %errorlevel% neq 0 (
    echo ❌ Service principal creation failed! Error code: %errorlevel%
    pause
    exit /b 1
)
echo ✅ Service principal created! Output saved to sp-output.json
type sp-output.json
echo 👉 Add this to GitHub secrets as AZURE_CREDENTIALS

REM Deploy backend
echo 🚀 Deploying backend container...
for /f %%i in ('powershell -command "Get-Date -UFormat %%s"') do set TIMESTAMP=%%i
set BACKEND_DNS=attendoo-backend-%TIMESTAMP%

az container create ^
  --resource-group %RESOURCE_GROUP% ^
  --name %BACKEND_NAME% ^
  --image kumarharsh001/attendoo:backend-latest ^
  --dns-name-label %BACKEND_DNS% ^
  --ports 5000 ^
  --environment-variables ^
    MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" ^
    PORT=5000 ^
    NODE_ENV=production ^
  --cpu 1 ^
  --memory 1.5

if %errorlevel% neq 0 (
    echo ❌ Backend container deployment failed! Error code: %errorlevel%
    pause
    exit /b 1
)
echo ✅ Backend container deployed!

REM Get backend URL
timeout /t 30 /nobreak >nul
for /f "delims=" %%i in ('az container show --resource-group %RESOURCE_GROUP% --name %BACKEND_NAME% --query ipAddress.fqdn --output tsv') do set BACKEND_FQDN=%%i
set BACKEND_URL=http://%BACKEND_FQDN%:5000
echo Backend URL: %BACKEND_URL%

REM Deploy frontend
echo 🌐 Deploying frontend container...
for /f %%i in ('powershell -command "Get-Date -UFormat %%s"') do set TIMESTAMP=%%i
set FRONTEND_DNS=attendoo-frontend-%TIMESTAMP%

az container create ^
  --resource-group %RESOURCE_GROUP% ^
  --name %FRONTEND_NAME% ^
  --image kumarharsh001/attendoo:frontend-latest ^
  --dns-name-label %FRONTEND_DNS% ^
  --ports 80 ^
  --environment-variables ^
    REACT_APP_API_BASE_URL=%BACKEND_URL% ^
  --cpu 0.5 ^
  --memory 1

if %errorlevel% neq 0 (
    echo ❌ Frontend container deployment failed! Error code: %errorlevel%
    pause
    exit /b 1
)
echo ✅ Frontend container deployed!

REM Get frontend URL
timeout /t 30 /nobreak >nul
for /f "delims=" %%i in ('az container show --resource-group %RESOURCE_GROUP% --name %FRONTEND_NAME% --query ipAddress.fqdn --output tsv') do set FRONTEND_FQDN=%%i
set FRONTEND_URL=http://%FRONTEND_FQDN%

echo 🎉 Deployment Complete!
echo Frontend: %FRONTEND_URL%
echo Backend: %BACKEND_URL%
echo Health Check: %BACKEND_URL%/api/health
echo Scanner: %FRONTEND_URL%/native-camera.html
echo Username: teacher
echo Password: password123
echo.
pause
