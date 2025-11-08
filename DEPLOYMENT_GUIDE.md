# 🚀 Deployment Guide - GitHub, Vercel & Render

## Complete step-by-step guide to deploy Vidhi Saarathi AI

---

## 📋 Table of Contents

1. [Push to GitHub](#1-push-to-github)
2. [Deploy Backend on Render](#2-deploy-backend-on-render)
3. [Deploy Frontend on Vercel](#3-deploy-frontend-on-vercel)
4. [Post-Deployment Configuration](#4-post-deployment-configuration)
5. [Testing](#5-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. 🔄 Push to GitHub

### Step 1.1: Initialize Git (if not already done)

Open PowerShell in your project root:

```powershell
cd C:\Users\darsh\OneDrive\Desktop\Vidhi_Saarathi_AI

# Initialize git repository
git init

# Check current status
git status
```

### Step 1.2: Create .gitignore file

Create `.gitignore` in project root:

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development
.env.production

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Build files
dist/
build/
.cache/

# Logs
logs/
*.log

# Temporary files
*.tmp
*.temp

# Backend specific
backend/data/users.json
backend/test-files/

# Don't ignore lawyers.json (we want this in repo)
!backend/data/lawyers.json
```

### Step 1.3: Stage and Commit Files

```powershell
# Add all files
git add .

# Check what will be committed
git status

# Commit with message
git commit -m "Initial commit: Vidhi Saarathi AI with lawyer recommendations"
```

### Step 1.4: Connect to GitHub Repository

**Option A: If repository already exists (Akash-N-24/Vidhi_Saarathi_AI)**

```powershell
# Add remote
git remote add origin https://github.com/Akash-N-24/Vidhi_Saarathi_AI.git

# Check remote
git remote -v

# Pull existing code (if any)
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if they occur
# Then commit the merge

# Push to GitHub
git push -u origin main
```

**Option B: If creating new repository**

1. Go to https://github.com/new
2. Create repository named `Vidhi_Saarathi_AI`
3. Don't initialize with README (we already have files)
4. Click "Create repository"
5. Run commands:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/Vidhi_Saarathi_AI.git
git branch -M main
git push -u origin main
```

### Step 1.5: Verify on GitHub

1. Go to https://github.com/Akash-N-24/Vidhi_Saarathi_AI
2. Verify all files are uploaded
3. Check that `.env` is NOT visible (should be ignored)

---

## 2. 🔧 Deploy Backend on Render

### Step 2.1: Prepare Backend for Deployment

**Check `backend/package.json` has these scripts:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

### Step 2.2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub account (recommended)
4. Authorize Render to access your GitHub

### Step 2.3: Create New Web Service

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select "Connect a repository"
   - Choose `Vidhi_Saarathi_AI`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: vidhi-saarathi-backend
   Region: Choose closest to you (e.g., Singapore for India)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan:**
   - Choose **"Free"** plan (0$/month)
   - Note: Free plan sleeps after 15 min inactivity

5. **Environment Variables:**
   Click "Advanced" → Add Environment Variables:

   ```
   SUPABASE_URL=https://clrhynfxwrirfbxhzikg.supabase.co
   SUPABASE_SERVICE_KEY=your_service_key_here
   SUPABASE_FIR_BUCKET=fir-uploads
   AUTH_SECRET=VidhiSaarathi_AI_2025_Enhanced_SecureKey
   GEMINI_API_KEY_1=your_gemini_key_1
   GEMINI_API_KEY_2=your_gemini_key_2
   GEMINI_API_KEY_3=your_gemini_key_3
   PORT=3000
   NODE_ENV=production
   ```

   **⚠️ IMPORTANT:** Get these values from your local `backend/.env` file

6. **Click "Create Web Service"**

### Step 2.4: Wait for Deployment

- Render will build and deploy (takes 2-5 minutes)
- Watch the logs in real-time
- Wait for: ✅ "Your service is live"

### Step 2.5: Get Backend URL

Your backend will be available at:
```
https://vidhi-saarathi-backend.onrender.com
```

**Test it:**
```
https://vidhi-saarathi-backend.onrender.com/health
```

Should return server health info!

---

## 3. 🌐 Deploy Frontend on Vercel

### Step 3.1: Prepare Frontend

**Create `vercel.json` in project root:**

```json
{
  "version": 2,
  "name": "vidhi-saarathi-ai",
  "builds": [
    {
      "src": "frontend/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/",
      "destination": "/frontend/index.html"
    }
  ]
}
```

### Step 3.2: Update Frontend API URLs

**Update ALL frontend files to use production backend URL:**

Files to update:
- `frontend/index.html`
- `frontend/results.html`
- `frontend/auth.html`
- `frontend/dashboard.html`
- `frontend/upload.html`

**Find and replace:**

```javascript
// OLD
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : '';

// NEW
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://vidhi-saarathi-backend.onrender.com';
```

**⚠️ IMPORTANT:** Use YOUR actual Render backend URL!

### Step 3.3: Commit Changes

```powershell
git add .
git commit -m "Update API URLs for production deployment"
git push origin main
```

### Step 3.4: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### Step 3.5: Deploy Frontend

1. **Click "Add New..." → "Project"**

2. **Import Git Repository:**
   - Find `Vidhi_Saarathi_AI`
   - Click "Import"

3. **Configure Project:**
   ```
   Project Name: vidhi-saarathi-ai
   Framework Preset: Other
   Root Directory: ./ (leave as root)
   Build Command: (leave empty)
   Output Directory: frontend
   Install Command: (leave empty - no build needed)
   ```

4. **Environment Variables:**
   Click "Environment Variables" (Optional for frontend)
   
   Add if needed:
   ```
   NEXT_PUBLIC_API_URL=https://vidhi-saarathi-backend.onrender.com
   ```

5. **Click "Deploy"**

### Step 3.6: Wait for Deployment

- Vercel will deploy (takes 1-2 minutes)
- Wait for: ✅ "Congratulations! Your deployment is ready"

### Step 3.7: Get Frontend URL

Your frontend will be available at:
```
https://vidhi-saarathi-ai.vercel.app
```

Or your custom domain if configured!

---

## 4. 🔧 Post-Deployment Configuration

### Step 4.1: Update CORS Settings (Backend)

Your backend needs to allow requests from Vercel domain.

**Edit `backend/server.js`:**

```javascript
// Update CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://vidhi-saarathi-ai.vercel.app',  // Add your Vercel URL
        'https://vidhi-saarathi-ai-*.vercel.app'  // Allow preview deployments
    ],
    credentials: true
}));
```

**Commit and push:**
```powershell
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-deploy the update!

### Step 4.2: Configure Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Under **API Settings** → **URL Configuration**:
   - Add Vercel URL to allowed origins

5. Go to **Authentication** → **URL Configuration**:
   - Add Site URL: `https://vidhi-saarathi-ai.vercel.app`
   - Add Redirect URLs:
     ```
     https://vidhi-saarathi-ai.vercel.app/auth.html
     https://vidhi-saarathi-ai.vercel.app/dashboard.html
     ```

### Step 4.3: Update Render Environment (if needed)

If you need to update environment variables:

1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add/Update variables
5. Click "Save Changes"
6. Service will redeploy automatically

---

## 5. ✅ Testing

### Test Backend (Render)

```powershell
# Test health endpoint
curl https://vidhi-saarathi-backend.onrender.com/health

# Test lawyers endpoint
curl https://vidhi-saarathi-backend.onrender.com/api/lawyers

# Test specific endpoint
curl https://vidhi-saarathi-backend.onrender.com/api/lawyers/specialization/Criminal%20Law
```

### Test Frontend (Vercel)

1. **Open in browser:**
   ```
   https://vidhi-saarathi-ai.vercel.app
   ```

2. **Test main page:**
   - Should load properly
   - Check if chatbot works

3. **Test results page:**
   ```
   https://vidhi-saarathi-ai.vercel.app/results.html
   ```
   - Enter query
   - Click Analyze
   - Should get AI response
   - Should see lawyer recommendations

4. **Test authentication:**
   ```
   https://vidhi-saarathi-ai.vercel.app/auth.html
   ```
   - Try signup
   - Try login
   - Should work with backend

5. **Test lawyer dashboard:**
   ```
   https://vidhi-saarathi-ai.vercel.app/dashboard.html
   ```
   - Should show lawyer login
   - Test signup/login

### Test End-to-End

1. Go to Vercel URL
2. Enter a criminal law query
3. Verify:
   - ✅ AI analysis appears
   - ✅ Lawyer recommendations show
   - ✅ Email/Call buttons work
   - ✅ All styling correct

---

## 6. 🐛 Troubleshooting

### Issue: Backend Not Responding

**Problem:** Render free tier sleeps after 15 min inactivity

**Solution:**
- First request wakes it up (takes 30-60 seconds)
- Add loading message: "Waking up server..."
- Consider upgrading to paid plan ($7/month)

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin` error in browser console

**Solution:**
1. Check backend CORS settings include Vercel URL
2. Make sure no trailing slashes in URLs
3. Verify both HTTP and HTTPS if needed

### Issue: Environment Variables Not Working

**Problem:** API keys not found, Supabase connection fails

**Solution:**
1. Go to Render Dashboard → Environment tab
2. Verify all variables are set
3. Click "Manual Deploy" to redeploy
4. Check logs for any errors

### Issue: Frontend Shows Old Backend URL

**Problem:** Still trying to connect to localhost

**Solution:**
1. Verify all frontend files updated with production URL
2. Clear browser cache (Ctrl+Shift+R)
3. Check Network tab in DevTools
4. Redeploy from Vercel dashboard

### Issue: Database Connection Failed

**Problem:** Supabase connection errors

**Solution:**
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_KEY` (not anon key!)
3. Check Supabase dashboard for service status
4. Verify IP restrictions are disabled for Render

### Issue: Build Failed on Render

**Problem:** Build fails with module errors

**Solution:**
1. Check `package.json` has all dependencies
2. Verify Node version compatibility
3. Check Render logs for specific error
4. Try manual deploy after fixing

### Issue: "Cannot GET /" on Vercel

**Problem:** Routes not working properly

**Solution:**
1. Verify `vercel.json` is in project root
2. Check route configuration
3. Redeploy from Vercel dashboard
4. Check Vercel logs

---

## 📝 Deployment Checklist

### Before Deployment:

- [ ] All environment variables documented
- [ ] `.gitignore` properly configured
- [ ] `.env` file NOT in git
- [ ] All dependencies in `package.json`
- [ ] Frontend API URLs updated for production
- [ ] CORS configured for production domains
- [ ] Code committed to GitHub

### Backend (Render):

- [ ] Service created and deployed
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Logs showing no errors

### Frontend (Vercel):

- [ ] Project deployed
- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] API calls working
- [ ] Styling correct
- [ ] Mobile responsive

### Post-Deployment:

- [ ] End-to-end testing complete
- [ ] Authentication working
- [ ] File uploads working (if applicable)
- [ ] Lawyer recommendations showing
- [ ] All contact buttons working
- [ ] Custom domain configured (optional)

---

## 🎉 Success!

Once everything is deployed and tested:

✅ **Backend:** `https://vidhi-saarathi-backend.onrender.com`  
✅ **Frontend:** `https://vidhi-saarathi-ai.vercel.app`

Your Vidhi Saarathi AI is now live and accessible worldwide! 🌍

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Docs:** https://docs.github.com
- **Supabase Docs:** https://supabase.com/docs

---

## 🔄 Future Updates

To update your deployed apps:

```powershell
# Make changes locally
# Test locally

# Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# Both Render and Vercel will auto-deploy!
```

---

**Created:** November 8, 2025  
**Status:** Complete Deployment Guide  
**Platforms:** GitHub → Render (Backend) + Vercel (Frontend)
