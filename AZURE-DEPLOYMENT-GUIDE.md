# 🚀 Azure Deployment Guide - Student Account

## 📋 Prerequisites

1. **Azure Student Account** (you have this ✅)
2. **Azure CLI** installed
3. **Docker images** on Docker Hub (you have this ✅)
4. **GitHub repository** (you have this ✅)

## 🔧 Step 1: Install Azure CLI

### **Windows:**
1. Download from: https://aka.ms/installazurecliwindows
2. Run the installer
3. Restart your terminal/PowerShell

### **Mac:**
```bash
brew install azure-cli
```

### **Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### **Verify Installation:**
```bash
az --version
```

## 🔑 Step 2: Login to Azure

```bash
# Login with your student account
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your-Subscription-Name"
```

## 🏗️ Step 3: Create Azure Resources

### **Create Resource Group:**
```bash
az group create \
  --name attendoo-rg \
  --location eastus
```

### **Create Container Registry (Optional - for private images):**
```bash
az acr create \
  --resource-group attendoo-rg \
  --name attendooregistry \
  --sku Basic \
  --admin-enabled true
```

## 🚀 Step 4: Deploy Using Container Instances

### **Deploy Backend Container:**
```bash
az container create \
  --resource-group attendoo-rg \
  --name attendoo-backend \
  --image kumarharsh001/attendoo:backend-latest \
  --dns-name-label attendoo-backend-$(date +%s) \
  --ports 5000 \
  --environment-variables \
    MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" \
    PORT=5000 \
    NODE_ENV=production \
  --cpu 1 \
  --memory 1.5
```

### **Get Backend URL:**
```bash
az container show \
  --resource-group attendoo-rg \
  --name attendoo-backend \
  --query ipAddress.fqdn \
  --output tsv
```

### **Deploy Frontend Container:**
```bash
# Replace BACKEND_URL with the URL from previous command
az container create \
  --resource-group attendoo-rg \
  --name attendoo-frontend \
  --image kumarharsh001/attendoo:frontend-latest \
  --dns-name-label attendoo-frontend-$(date +%s) \
  --ports 80 \
  --environment-variables \
    REACT_APP_API_BASE_URL=http://BACKEND_URL:5000 \
  --cpu 0.5 \
  --memory 1
```

## 🌐 Step 5: Get Your URLs

```bash
# Backend URL
echo "Backend: http://$(az container show --resource-group attendoo-rg --name attendoo-backend --query ipAddress.fqdn --output tsv):5000"

# Frontend URL  
echo "Frontend: http://$(az container show --resource-group attendoo-rg --name attendoo-frontend --query ipAddress.fqdn --output tsv)"
```

## 🔄 Step 6: Setup GitHub Actions for Auto-Deployment

### **Create Service Principal:**
```bash
az ad sp create-for-rbac \
  --name "attendoo-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id --output tsv)/resourceGroups/attendoo-rg \
  --sdk-auth
```

**Save the output JSON** - you'll need it for GitHub secrets!

### **Add GitHub Secrets:**
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- **`AZURE_CREDENTIALS`**: The JSON output from service principal creation
- **`DOCKER_USERNAME`**: Your Docker Hub username
- **`DOCKER_PASSWORD`**: Your Docker Hub password

## 📊 Alternative: App Service Deployment

### **Create App Service Plan:**
```bash
az appservice plan create \
  --name attendoo-plan \
  --resource-group attendoo-rg \
  --sku B1 \
  --is-linux
```

### **Create Backend Web App:**
```bash
az webapp create \
  --resource-group attendoo-rg \
  --plan attendoo-plan \
  --name attendoo-backend-app \
  --deployment-container-image-name kumarharsh001/attendoo:backend-latest
```

### **Configure Backend Environment:**
```bash
az webapp config appsettings set \
  --resource-group attendoo-rg \
  --name attendoo-backend-app \
  --settings \
    MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" \
    PORT=80 \
    NODE_ENV=production \
    WEBSITES_PORT=5000
```

### **Create Frontend Web App:**
```bash
az webapp create \
  --resource-group attendoo-rg \
  --plan attendoo-plan \
  --name attendoo-frontend-app \
  --deployment-container-image-name kumarharsh001/attendoo:frontend-latest
```

### **Configure Frontend Environment:**
```bash
az webapp config appsettings set \
  --resource-group attendoo-rg \
  --name attendoo-frontend-app \
  --settings \
    REACT_APP_API_BASE_URL=https://attendoo-backend-app.azurewebsites.net
```

## 🎯 Your URLs (App Service)

- **Frontend**: https://attendoo-frontend-app.azurewebsites.net
- **Backend**: https://attendoo-backend-app.azurewebsites.net

## 🛠️ Management Commands

### **Check Status:**
```bash
# Container Instances
az container show --resource-group attendoo-rg --name attendoo-backend --query instanceView.state
az container show --resource-group attendoo-rg --name attendoo-frontend --query instanceView.state

# App Services
az webapp show --resource-group attendoo-rg --name attendoo-backend-app --query state
az webapp show --resource-group attendoo-rg --name attendoo-frontend-app --query state
```

### **View Logs:**
```bash
# Container Instances
az container logs --resource-group attendoo-rg --name attendoo-backend
az container logs --resource-group attendoo-rg --name attendoo-frontend

# App Services
az webapp log tail --resource-group attendoo-rg --name attendoo-backend-app
az webapp log tail --resource-group attendoo-rg --name attendoo-frontend-app
```

### **Restart Services:**
```bash
# Container Instances
az container restart --resource-group attendoo-rg --name attendoo-backend
az container restart --resource-group attendoo-rg --name attendoo-frontend

# App Services
az webapp restart --resource-group attendoo-rg --name attendoo-backend-app
az webapp restart --resource-group attendoo-rg --name attendoo-frontend-app
```

### **Clean Up (Delete Everything):**
```bash
az group delete --name attendoo-rg --yes --no-wait
```

## 💰 Cost Optimization (Student Account)

- **Container Instances**: Pay per second, good for testing
- **App Service B1**: ~$13/month, includes both apps
- **Free Tier**: App Service has free tier (F1) with limitations

### **Switch to Free Tier:**
```bash
az appservice plan update \
  --name attendoo-plan \
  --resource-group attendoo-rg \
  --sku FREE
```

## 🔧 Troubleshooting

### **Common Issues:**
1. **Container won't start**: Check logs with `az container logs`
2. **Can't access website**: Check if ports are correct (80 for frontend, 5000 for backend)
3. **Database connection**: Ensure MongoDB URI is correct in environment variables
4. **CORS errors**: Make sure frontend has correct backend URL

### **Useful Commands:**
```bash
# Get all resources in group
az resource list --resource-group attendoo-rg --output table

# Check container details
az container show --resource-group attendoo-rg --name attendoo-backend

# Update container image
az container create --resource-group attendoo-rg --name attendoo-backend --image kumarharsh001/attendoo:backend-latest
```

## 🎯 Next Steps

1. **Choose deployment method** (Container Instances or App Service)
2. **Deploy manually** first to test
3. **Set up GitHub Actions** for automatic deployment
4. **Configure custom domain** (optional)
5. **Set up monitoring** and alerts

**Ready to deploy!** 🚀
