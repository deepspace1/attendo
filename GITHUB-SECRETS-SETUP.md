# 🔐 GitHub Secrets Setup Guide

## 📋 Required Secrets

Go to **GitHub → Your Repository → Settings → Secrets and variables → Actions**

Add these secrets:

### **1. AZURE_CREDENTIALS**
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret", 
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

**How to get this:**
1. Run the Azure setup script first
2. Copy the JSON output from service principal creation
3. Paste it as the value for AZURE_CREDENTIALS

### **2. MONGODB_URI**
```
mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0
```

### **3. DOCKER_USERNAME**
```
kumarharsh001
```

### **4. DOCKER_PASSWORD**
```
Thisisdocker@123
```

## 🚀 How to Add Secrets

1. **Go to GitHub Repository**
2. **Click Settings** (top menu)
3. **Click Secrets and variables** (left sidebar)
4. **Click Actions**
5. **Click "New repository secret"**
6. **Add each secret** with exact names above

## ✅ Verification

After adding secrets, you should see:
- ✅ AZURE_CREDENTIALS
- ✅ MONGODB_URI  
- ✅ DOCKER_USERNAME
- ✅ DOCKER_PASSWORD

## 🔄 Automatic Deployment

Once secrets are added:
1. **Push any code** to master branch
2. **GitHub Actions** will automatically:
   - Build Docker images
   - Push to Docker Hub
   - Deploy to Azure
   - Provide live URLs

## 🌐 Expected Results

After successful deployment:
- **Frontend**: `https://attendoo-frontend-webapp.azurewebsites.net`
- **Backend**: `http://attendoo-backend-xxxxx.eastus.azurecontainer.io:5000`
- **Scanner**: `https://attendoo-frontend-webapp.azurewebsites.net/native-camera.html`

## 🎯 Login Details

- **Username**: `teacher`
- **Password**: `password123`

## 📞 Troubleshooting

If deployment fails:
1. **Check GitHub Actions** logs
2. **Verify all secrets** are added correctly
3. **Check Azure resource** quotas
4. **Ensure Azure providers** are registered

**Your automated deployment will be ready once secrets are configured!** 🚀
