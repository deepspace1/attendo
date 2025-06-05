#!/bin/bash

echo "🚀 Azure Deployment Setup for Attendance System"
echo "=============================================="
echo

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed!"
    echo
    echo "Please install Azure CLI first:"
    echo "Windows: https://aka.ms/installazurecliwindows"
    echo "Mac: brew install azure-cli"
    echo "Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    echo
    exit 1
fi

echo "✅ Azure CLI is installed!"
echo

# Login to Azure
echo "🔑 Logging into Azure..."
echo "Please login with your student account in the browser window that opens."
az login

if [ $? -ne 0 ]; then
    echo "❌ Azure login failed!"
    exit 1
fi

echo "✅ Successfully logged into Azure!"
echo

# List subscriptions
echo "📋 Available subscriptions:"
az account list --output table

echo
read -p "Enter your subscription name or ID (press Enter for default): " SUBSCRIPTION
if [ ! -z "$SUBSCRIPTION" ]; then
    az account set --subscription "$SUBSCRIPTION"
    echo "✅ Subscription set to: $SUBSCRIPTION"
fi

echo

# Set variables
RESOURCE_GROUP="attendoo-rg"
LOCATION="eastus"
BACKEND_NAME="attendoo-backend"
FRONTEND_NAME="attendoo-frontend"

echo "🏗️ Creating Azure resources..."
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo

# Create resource group
echo "Creating resource group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

if [ $? -eq 0 ]; then
    echo "✅ Resource group created successfully!"
else
    echo "❌ Failed to create resource group!"
    exit 1
fi

echo

# Create service principal for GitHub Actions
echo "🔐 Creating service principal for GitHub Actions..."
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "attendoo-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id --output tsv)/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth)

if [ $? -eq 0 ]; then
    echo "✅ Service principal created successfully!"
    echo
    echo "🔑 IMPORTANT: Save this JSON for GitHub Secrets!"
    echo "================================================"
    echo "$SP_OUTPUT"
    echo "================================================"
    echo
    echo "📝 Add this to GitHub → Settings → Secrets and variables → Actions:"
    echo "Secret name: AZURE_CREDENTIALS"
    echo "Secret value: (the JSON above)"
    echo
else
    echo "❌ Failed to create service principal!"
    exit 1
fi

# Deploy backend container
echo "🚀 Deploying backend container..."
BACKEND_DNS="attendoo-backend-$(date +%s)"

az container create \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --image kumarharsh001/attendoo:backend-latest \
  --dns-name-label $BACKEND_DNS \
  --ports 5000 \
  --environment-variables \
    MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" \
    PORT=5000 \
    NODE_ENV=production \
  --cpu 1 \
  --memory 1.5

if [ $? -eq 0 ]; then
    echo "✅ Backend container deployed successfully!"
else
    echo "❌ Failed to deploy backend container!"
    exit 1
fi

# Get backend URL
echo "⏳ Getting backend URL..."
sleep 30  # Wait for container to start

BACKEND_FQDN=$(az container show \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --query ipAddress.fqdn \
  --output tsv)

BACKEND_URL="http://${BACKEND_FQDN}:5000"
echo "Backend URL: $BACKEND_URL"

# Deploy frontend container
echo "🌐 Deploying frontend container..."
FRONTEND_DNS="attendoo-frontend-$(date +%s)"

az container create \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --image kumarharsh001/attendoo:frontend-latest \
  --dns-name-label $FRONTEND_DNS \
  --ports 80 \
  --environment-variables \
    REACT_APP_API_BASE_URL=$BACKEND_URL \
  --cpu 0.5 \
  --memory 1

if [ $? -eq 0 ]; then
    echo "✅ Frontend container deployed successfully!"
else
    echo "❌ Failed to deploy frontend container!"
    exit 1
fi

# Get frontend URL
echo "⏳ Getting frontend URL..."
sleep 30  # Wait for container to start

FRONTEND_FQDN=$(az container show \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --query ipAddress.fqdn \
  --output tsv)

FRONTEND_URL="http://${FRONTEND_FQDN}"

echo
echo "🎉 Deployment Complete!"
echo "======================"
echo
echo "🌐 Your URLs:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "Health Check: $BACKEND_URL/api/health"
echo "Scanner: $FRONTEND_URL/native-camera.html"
echo
echo "👤 Login Details:"
echo "Username: teacher"
echo "Password: password123"
echo
echo "🔧 Management Commands:"
echo "Check status: az container show --resource-group $RESOURCE_GROUP --name $BACKEND_NAME --query instanceView.state"
echo "View logs: az container logs --resource-group $RESOURCE_GROUP --name $BACKEND_NAME"
echo "Restart: az container restart --resource-group $RESOURCE_GROUP --name $BACKEND_NAME"
echo "Delete all: az group delete --name $RESOURCE_GROUP --yes"
echo
echo "📝 Next Steps:"
echo "1. Test your application at: $FRONTEND_URL"
echo "2. Add the service principal JSON to GitHub Secrets (AZURE_CREDENTIALS)"
echo "3. Add MONGODB_URI to GitHub Secrets"
echo "4. Push code to trigger automatic deployment"
echo
echo "🎯 GitHub Secrets to add:"
echo "- AZURE_CREDENTIALS: (the JSON shown above)"
echo "- MONGODB_URI: mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0"
echo "- DOCKER_USERNAME: kumarharsh001"
echo "- DOCKER_PASSWORD: (your Docker Hub password)"
echo

# Test the deployment
echo "🧪 Testing deployment..."
echo "Testing backend health..."
for i in {1..5}; do
    if curl -f "$BACKEND_URL/api/health" &>/dev/null; then
        echo "✅ Backend is healthy!"
        break
    else
        echo "⏳ Waiting for backend... (attempt $i/5)"
        sleep 30
    fi
done

echo "Testing frontend..."
if curl -f "$FRONTEND_URL" &>/dev/null; then
    echo "✅ Frontend is accessible!"
else
    echo "⚠️ Frontend might still be starting. Try accessing it in a few minutes."
fi

echo
echo "🎉 Setup complete! Your attendance system is now running on Azure!"
