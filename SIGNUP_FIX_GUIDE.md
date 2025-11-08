# 🔧 Signup/Login Fix Guide

## ❌ Problem
Getting "Signup failed - network error" when trying to sign up or login

## ✅ Root Cause
The issue occurs when opening `dashboard.html` directly as a **file:///** instead of through an **HTTP server**. Modern browsers block cross-origin requests from file:// to http://localhost:3000 for security reasons (CORS policy).

## 🔍 Diagnosis Steps

### 1. **Test the API Connection**
Open this URL in your browser:
```
http://localhost:5500/test-signup.html
```

Click "Test Signup API" and check the debug log. This will show if:
- ✅ Backend is reachable
- ✅ CORS is configured correctly
- ✅ Signup endpoint is working

### 2. **Check Backend is Running**
```powershell
curl http://localhost:3000/health
```

You should see:
```json
{"status":"Vidhi Saarathi AI Backend is healthy","version":"4.3.0",...}
```

### 3. **Check Frontend Server is Running**
```powershell
Get-Process -Name python
```

Should show Python processes running on port 5500.

## ✅ Solutions

### **Solution 1: Use HTTP Server (REQUIRED)**

**❌ WRONG WAY** (will cause network errors):
- Double-clicking `dashboard.html`
- Opening file from File Explorer
- File path shows: `file:///C:/Users/...`

**✅ CORRECT WAY** (will work):
1. Open in browser: `http://localhost:5500/dashboard.html`
2. Or from VS Code: Right-click `dashboard.html` → "Open with Live Server"

### **Solution 2: Start Frontend Server**

If port 5500 is not accessible:

```powershell
# From project root directory
cd C:\Users\darsh\OneDrive\Desktop\Vidhi_Saarathi_AI
python -m http.server 5500 --directory frontend
```

Then open: `http://localhost:5500/dashboard.html`

### **Solution 3: Use Live Server Extension (Recommended)**

1. Install "Live Server" extension in VS Code
2. Right-click `dashboard.html`
3. Select "Open with Live Server"
4. It will open at `http://127.0.0.1:5500/dashboard.html`

## 🧪 Quick Test

1. **Backend Test:**
   ```
   http://localhost:3000/health
   ```
   Expected: JSON response with "healthy" status

2. **Frontend Test:**
   ```
   http://localhost:5500/test-signup.html
   ```
   Expected: Test form with signup button

3. **Full Test:**
   ```
   http://localhost:5500/dashboard.html
   ```
   Try to sign up with:
   - Email: test@example.com
   - Password: test12345
   - Fill all required fields

## 🐛 Common Errors & Fixes

### Error: "Network error"
**Cause:** Opening HTML file directly (file://)
**Fix:** Use `http://localhost:5500/dashboard.html`

### Error: "CORS policy"
**Cause:** Backend not configured for your origin
**Fix:** Check backend CORS settings include `http://localhost:5500`

### Error: "Failed to fetch"
**Cause:** Backend server not running
**Fix:** 
```powershell
cd backend
npm start
```

### Error: "Connection refused"
**Cause:** Wrong port or server not started
**Fix:** Check both servers are running:
- Backend: `http://localhost:3000/health`
- Frontend: `http://localhost:5500/dashboard.html`

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend served via HTTP (not file://)
- [ ] Opening `http://localhost:5500/dashboard.html`
- [ ] Test signup form with valid data
- [ ] Check browser console for errors (F12)
- [ ] Try test page first: `http://localhost:5500/test-signup.html`

## 📝 Current Status

✅ Backend: Running (v4.1.0)
✅ Frontend Server: Running on port 5500
✅ CORS: Configured for localhost:5500
✅ Test Page: Available at http://localhost:5500/test-signup.html

## 🎯 Next Steps

1. Close any `file:///` tabs of dashboard.html
2. Open: `http://localhost:5500/dashboard.html`
3. Try signing up again
4. If still failing, check test-signup.html for detailed error log

## 🆘 Still Having Issues?

Check browser console (F12 → Console tab) and look for:
- Red error messages
- Failed network requests
- CORS errors
- Any JavaScript exceptions

Share the exact error message from the console for further help.
