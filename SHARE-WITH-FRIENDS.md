# 🎓 Attendance System - Share with Friends

## 🚀 Super Quick Setup (1 Command)

### **Windows Users:**
1. **Install Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Download and run:** [quick-setup-windows.bat](https://raw.githubusercontent.com/deepspace1/attendo/master/quick-setup-windows.bat)
3. **Double-click** the downloaded file
4. **Wait 3-5 minutes** for setup to complete
5. **Open browser:** http://localhost

### **Mac/Linux Users:**
1. **Install Docker Desktop:** https://www.docker.com/products/docker-desktop/
2. **Run this command** in Terminal:
```bash
curl -s https://raw.githubusercontent.com/deepspace1/attendo/master/quick-setup-unix.sh | bash
```
3. **Wait 3-5 minutes** for setup to complete
4. **Open browser:** http://localhost

## 🔑 Login Details

- **Username:** `teacher`
- **Password:** `password123`

## 🌐 What You Get

| URL | What It Does |
|-----|--------------|
| http://localhost | Main attendance system |
| http://localhost/native-camera.html | Barcode scanner |

## 📱 Features

- ✅ **Take attendance** with barcode scanning
- ✅ **View attendance reports** by date/class
- ✅ **Student management**
- ✅ **Mobile-friendly** interface
- ✅ **Real-time** attendance tracking
- ✅ **Cloud database** (no setup needed)

## 🛠 Quick Commands

```bash
# Check if running
docker ps

# Stop system
docker-compose down

# Start again
docker-compose up -d

# Update to latest version
docker-compose pull && docker-compose up -d
```

## 🆘 Need Help?

1. **Make sure Docker Desktop is running**
2. **Wait 3-5 minutes** after starting
3. **Try:** http://127.0.0.1 if localhost doesn't work
4. **Check logs:** `docker-compose logs`

## 📞 Contact

If you have issues, send me:
- Screenshot of any error
- Your operating system (Windows/Mac/Linux)
- Output of `docker --version`

---

**That's it! Enjoy the attendance system!** 🎉
