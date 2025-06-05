# 🎓 Attendance System - Setup Guide for Friends

## 📋 What You Need

1. **Docker Desktop** installed on your computer
2. **Internet connection** (to download images and connect to database)
3. **5 minutes** of your time

## 🔧 Step 1: Install Docker Desktop

### **Windows:**
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Open Docker Desktop and wait for it to start

### **Mac:**
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and open Docker Desktop
3. Wait for Docker to start (whale icon in menu bar)

### **Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and log back in
```

## 🚀 Step 2: Run the Attendance System

### **Option A: One-Command Setup (Easiest)**

**Windows (PowerShell or Command Prompt):**
```cmd
curl -o docker-compose.yml https://raw.githubusercontent.com/deepspace1/attendo/master/docker-compose.yml && docker-compose up -d
```

**Mac/Linux (Terminal):**
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/deepspace1/attendo/master/docker-compose.yml && docker-compose up -d
```

### **Option B: Manual Setup**

1. **Create a folder** on your desktop called `attendance-system`
2. **Open terminal/command prompt** in that folder
3. **Download the setup file:**
   ```bash
   curl -o docker-compose.yml https://raw.githubusercontent.com/deepspace1/attendo/master/docker-compose.yml
   ```
4. **Start the system:**
   ```bash
   docker-compose up -d
   ```

### **Option C: Copy-Paste Setup**

1. **Create a file** called `docker-compose.yml`
2. **Copy this content** into the file:

```yaml
version: '3.8'

services:
  # Backend Service
  backend:
    image: kumarharsh001/attendoo:backend-latest
    container_name: attendoo-backend
    environment:
      - MONGODB_URI=mongodb+srv://harshkumar170604:ThisismongoDB1234@cluster0.kezwcrd.mongodb.net/attend?retryWrites=true&w=majority&appName=Cluster0
      - PORT=5000
      - NODE_ENV=production
    ports:
      - "5000:5000"
    networks:
      - attendoo-network
    restart: unless-stopped

  # Frontend Service
  frontend:
    image: kumarharsh001/attendoo:frontend-latest
    container_name: attendoo-frontend
    environment:
      - REACT_APP_API_BASE_URL=http://backend:5000
    ports:
      - "80:80"
    networks:
      - attendoo-network
    depends_on:
      - backend
    restart: unless-stopped

networks:
  attendoo-network:
    driver: bridge
    name: attendoo-network
```

3. **Open terminal** in the same folder
4. **Run:** `docker-compose up -d`

## 🌐 Step 3: Access the System

After running the commands, wait 2-3 minutes for everything to start, then open your browser:

| Service | URL | What It Does |
|---------|-----|--------------|
| **Main App** | http://localhost | Complete attendance system |
| **API** | http://localhost:5000 | Backend API (for testing) |
| **Scanner** | http://localhost/native-camera.html | Barcode scanner |

## 👤 Step 4: Login

**Default Login:**
- **Username:** `teacher`
- **Password:** `password123`

## 📱 Step 5: Using the System

1. **Go to:** http://localhost
2. **Login** with the credentials above
3. **Take Attendance** → Start a new session
4. **Use the scanner** at http://localhost/native-camera.html
5. **View reports** in the View Attendance section

## 🛠 Managing the System

### **Check if it's running:**
```bash
docker ps
```
You should see `attendoo-backend` and `attendoo-frontend` containers.

### **Stop the system:**
```bash
docker-compose down
```

### **Start again:**
```bash
docker-compose up -d
```

### **Update to latest version:**
```bash
docker-compose pull
docker-compose up -d
```

### **View logs (if something's wrong):**
```bash
docker-compose logs
```

## 🔧 Troubleshooting

### **"Port already in use" error:**
If port 80 is busy, change the frontend port in docker-compose.yml:
```yaml
ports:
  - "3000:80"  # Use port 3000 instead
```
Then access at: http://localhost:3000

### **Docker not starting:**
1. Make sure Docker Desktop is running
2. Restart Docker Desktop
3. Try running as administrator (Windows)

### **Can't access the website:**
1. Wait 3-5 minutes for containers to fully start
2. Check if containers are running: `docker ps`
3. Try: http://127.0.0.1 instead of http://localhost

### **Database connection issues:**
The system uses a cloud database, so you need internet connection. If it's not working:
1. Check your internet connection
2. Try restarting the containers: `docker-compose restart`

## 📞 Need Help?

If something doesn't work:
1. **Check Docker Desktop** is running
2. **Try the troubleshooting steps** above
3. **Send a screenshot** of any error messages
4. **Share the output** of `docker-compose logs`

## 🎯 What You Get

- ✅ **Complete attendance system**
- ✅ **Barcode scanner** for student IDs
- ✅ **Reports and analytics**
- ✅ **Teacher login system**
- ✅ **Mobile-friendly interface**
- ✅ **Cloud database** (no local setup needed)

## 🔄 Updating

To get the latest version:
```bash
docker-compose pull
docker-compose up -d
```

This will download and run the newest version automatically!

---

**That's it! You now have a complete attendance system running on your computer!** 🎉

**Questions?** Just ask! The system is designed to be simple and user-friendly.
