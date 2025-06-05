# 🚀 Azure Quick Start - Fix Installation Issue

## 🔧 Problem: Script Closes Immediately

This happens because **Azure CLI is not installed**. Here's how to fix it:

## ✅ Step 1: Install Azure CLI

### **Method 1: Download Installer (Recommended)**
1. **Download**: https://aka.ms/installazurecliwindows
2. **Run as Administrator**
3. **Restart your computer**
4. **Test**: Open Command Prompt and run `az --version`

### **Method 2: Using PowerShell**
Open **PowerShell as Administrator** and run:
```powershell
winget install Microsoft.AzureCLI
```

### **Method 3: Manual Download**
1. Go to: https://github.com/Azure/azure-cli/releases
2. Download the latest `.msi` file
3. Install and restart

## ✅ Step 2: Verify Installation

Open **Command Prompt** and run:
```cmd
az --version
```

You should see something like:
```
azure-cli                         2.x.x
```

## ✅ Step 3: Run Azure Setup

After Azure CLI is installed, run the script again:
```cmd
azure-setup.bat
```

## 🎯 Alternative: Manual Azure Setup

If the script still doesn't work, follow these manual steps:

### **1. Login to Azure**
```cmd
az login
```

### **2. Create Resource Group**
```cmd
az group create --name attendoo-rg --location eastus
```

### **3. Deploy Backend**
```cmd
az container create ^
  --resource-group attendoo-rg ^
  --name attendoo-backend ^
  --image kumarharsh001/attendoo:backend-latest ^
  --dns-name-label attendoo-backend-12345 ^
  --ports 5000 ^
  --environment-variables ^
    MONGODB_URI="mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0" ^
    PORT=5000 ^
    NODE_ENV=production ^
  --cpu 1 ^
  --memory 1.5
```

### **4. Get Backend URL**
```cmd
az container show --resource-group attendoo-rg --name attendoo-backend --query ipAddress.fqdn --output tsv
```

### **5. Deploy Frontend**
Replace `BACKEND_URL` with the URL from step 4:
```cmd
az container create ^
  --resource-group attendoo-rg ^
  --name attendoo-frontend ^
  --image kumarharsh001/attendoo:frontend-latest ^
  --dns-name-label attendoo-frontend-12345 ^
  --ports 80 ^
  --environment-variables ^
    REACT_APP_API_BASE_URL=http://BACKEND_URL:5000 ^
  --cpu 0.5 ^
  --memory 1
```

### **6. Get Frontend URL**
```cmd
az container show --resource-group attendoo-rg --name attendoo-frontend --query ipAddress.fqdn --output tsv
```

## 🌐 Access Your Application

After deployment, you'll get URLs like:
- **Frontend**: `http://attendoo-frontend-12345.eastus.azurecontainer.io`
- **Backend**: `http://attendoo-backend-12345.eastus.azurecontainer.io:5000`

## 🔧 Troubleshooting

### **"az is not recognized"**
- Azure CLI is not installed or not in PATH
- Restart your computer after installation
- Try running from a new Command Prompt window

### **"Access Denied"**
- Run Command Prompt as Administrator
- Make sure you're logged into Azure: `az login`

### **"Subscription not found"**
- Check your subscriptions: `az account list`
- Set the correct subscription: `az account set --subscription "Your-Subscription-Name"`

### **Container deployment fails**
- Check if resource group exists: `az group list`
- Verify your subscription has enough quota
- Try a different location: `--location westus2`

## 💰 Cost Management

### **Check costs:**
```cmd
az consumption usage list --output table
```

### **Stop containers to save money:**
```cmd
az container stop --resource-group attendoo-rg --name attendoo-backend
az container stop --resource-group attendoo-rg --name attendoo-frontend
```

### **Start containers when needed:**
```cmd
az container start --resource-group attendoo-rg --name attendoo-backend
az container start --resource-group attendoo-rg --name attendoo-frontend
```

### **Delete everything:**
```cmd
az group delete --name attendoo-rg --yes
```

## 📞 Need Help?

If you're still having issues:

1. **Check Azure CLI version**: `az --version`
2. **Check if logged in**: `az account show`
3. **Try Azure Portal**: https://portal.azure.com (manual deployment)
4. **Share error messages** with exact text

## 🎯 Next Steps

Once your containers are deployed:
1. **Test the URLs** in your browser
2. **Set up GitHub secrets** for automatic deployment
3. **Configure custom domain** (optional)

**The key is getting Azure CLI installed properly first!** 🔑
