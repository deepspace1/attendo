@echo off
echo 🚀 Azure Deployment Setup for Attendance System
echo ==============================================
echo.

REM Check if Azure CLI is installed
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure CLI is not installed!
    echo.
    echo Please install Azure CLI first:
    echo https://aka.ms/installazurecliwindows
    echo.
    pause
    exit /b 1
)

echo ✅ Azure CLI is installed!
echo.

REM Login to Azure
echo 🔑 Logging into Azure...
echo Please login with your student account in the browser window that opens.
az login

if %errorlevel% neq 0 (
    echo ❌ Azure login failed!
    pause
    exit /b 1
)

echo ✅ Successfully logged into Azure!
echo.

REM List subscriptions
echo 📋 Available subscriptions:
az account list --output table

echo.
set /p SUBSCRIPTION="Enter your subscription name or ID (press Enter for default): "
if not "%SUBSCRIPTION%"=="" (
    az account set --subscription "%SUBSCRIPTION%"
    echo ✅ Subscription set to: %SUBSCRIPTION%
)

echo.

REM Set variables
set RESOURCE_GROUP=attendoo-rg
set LOCATION=eastus
set BACKEND_NAME=attendoo-backend
set FRONTEND_NAME=attendoo-frontend

echo 🏗️ Creating Azure resources...
echo Resource Group: %RESOURCE_GROUP%
echo Location: %LOCATION%
echo.

REM Create resource group
echo Creating resource group...
az group create --name %RESOURCE_GROUP% --location %LOCATION%

if %errorlevel% neq 0 (
    echo ❌ Failed to create resource group!
    pause
    exit /b 1
)

echo ✅ Resource group created successfully!
echo.

REM Create service principal for GitHub Actions
echo 🔐 Creating service principal for GitHub Actions...
for /f "delims=" %%i in ('az account show --query id --output tsv') do set SUBSCRIPTION_ID=%%i

az ad sp create-for-rbac --name "attendoo-github-actions" --role contributor --scopes /subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%RESOURCE_GROUP% --sdk-auth > sp-output.json

if %errorlevel% neq 0 (
    echo ❌ Failed to create service principal!
    pause
    exit /b 1
)

echo ✅ Service principal created successfully!
echo.
echo 🔑 IMPORTANT: Save this JSON for GitHub Secrets!
echo ================================================
type sp-output.json
echo ================================================
echo.
echo 📝 Add this to GitHub → Settings → Secrets and variables → Actions:
echo Secret name: AZURE_CREDENTIALS
echo Secret value: (the JSON above)
echo.

REM Deploy backend container
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
    echo ❌ Failed to deploy backend container!
    pause
    exit /b 1
)

echo ✅ Backend container deployed successfully!

REM Get backend URL
echo ⏳ Getting backend URL...
timeout /t 30 /nobreak >nul

for /f "delims=" %%i in ('az container show --resource-group %RESOURCE_GROUP% --name %BACKEND_NAME% --query ipAddress.fqdn --output tsv') do set BACKEND_FQDN=%%i
set BACKEND_URL=http://%BACKEND_FQDN%:5000
echo Backend URL: %BACKEND_URL%

REM Deploy frontend container
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
    echo ❌ Failed to deploy frontend container!
    pause
    exit /b 1
)

echo ✅ Frontend container deployed successfully!

REM Get frontend URL
echo ⏳ Getting frontend URL...
timeout /t 30 /nobreak >nul

for /f "delims=" %%i in ('az container show --resource-group %RESOURCE_GROUP% --name %FRONTEND_NAME% --query ipAddress.fqdn --output tsv') do set FRONTEND_FQDN=%%i
set FRONTEND_URL=http://%FRONTEND_FQDN%

echo.
echo 🎉 Deployment Complete!
echo ======================
echo.
echo 🌐 Your URLs:
echo Frontend: %FRONTEND_URL%
echo Backend: %BACKEND_URL%
echo Health Check: %BACKEND_URL%/api/health
echo Scanner: %FRONTEND_URL%/native-camera.html
echo.
echo 👤 Login Details:
echo Username: teacher
echo Password: password123
echo.
echo 🔧 Management Commands:
echo Check status: az container show --resource-group %RESOURCE_GROUP% --name %BACKEND_NAME% --query instanceView.state
echo View logs: az container logs --resource-group %RESOURCE_GROUP% --name %BACKEND_NAME%
echo Restart: az container restart --resource-group %RESOURCE_GROUP% --name %BACKEND_NAME%
echo Delete all: az group delete --name %RESOURCE_GROUP% --yes
echo.
echo 📝 Next Steps:
echo 1. Test your application at: %FRONTEND_URL%
echo 2. Add the service principal JSON to GitHub Secrets (AZURE_CREDENTIALS)
echo 3. Add MONGODB_URI to GitHub Secrets
echo 4. Push code to trigger automatic deployment
echo.
echo 🎯 GitHub Secrets to add:
echo - AZURE_CREDENTIALS: (the JSON in sp-output.json)
echo - MONGODB_URI: mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0
echo - DOCKER_USERNAME: kumarharsh001
echo - DOCKER_PASSWORD: (your Docker Hub password)
echo.
echo 🎉 Setup complete! Your attendance system is now running on Azure!
echo.
pause
