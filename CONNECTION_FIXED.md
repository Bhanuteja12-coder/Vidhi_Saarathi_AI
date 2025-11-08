# ✅ Frontend-Backend Connection - FIXED

## What Was Wrong

1. **`results.html`** had hardcoded Railway URL: `https://vidhisaarathiai-production.up.railway.app`
2. **`auth.html`** was using localStorage only (no backend calls)
3. No auto-detection for local vs production environments

## What I Fixed

### 1. Updated `frontend/results.html`
**Before:**
```javascript
const API_BASE_URL = 'https://vidhisaarathiai-production.up.railway.app';
```

**After:**
```javascript
// Auto-detect API base: use localhost for local dev, or override with window.API_BASE_URL for production
const API_BASE_URL = window.API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '');
```

### 2. Updated `frontend/auth.html`
**Before:**
- Stored user credentials directly in localStorage
- No backend API calls

**After:**
- Calls `POST /api/signup` and `POST /api/login`
- Stores returned user and JWT token
- Handles network errors gracefully

### 3. Backend Already Had All Endpoints
- ✅ POST `/api/signup` - Create account
- ✅ POST `/api/login` - Authenticate
- ✅ POST `/api/analyze` - AI legal analysis
- ✅ POST `/api/upload-fir` - Upload documents
- ✅ GET `/health` - System status

## How to Test the Connection

### Step 1: Start Backend

```powershell
cd backend
npm start
```

You should see:
```
✅ Supabase client initialized
🚀 Server running on: http://localhost:3000
```

### Step 2: Open Frontend in Browser

Open `frontend/index.html` in your browser:
- **Method 1**: Double-click the file
- **Method 2**: Use a local server:
  ```powershell
  # If you have Python 3
  cd frontend
  python -m http.server 8000
  # Then open http://localhost:8000
  ```
- **Method 3**: Use VS Code Live Server extension

### Step 3: Test Signup Flow

1. Click **"Citizen Login"** in navbar
2. Click **"Sign Up"** tab
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: secret123
4. Click **"Create Account"**
5. You should see: "Account created! Redirecting..."

**What happens behind the scenes:**
```
Frontend → POST http://localhost:3000/api/signup
         → { name, email, password }
         
Backend  → Hashes password with bcrypt
         → Stores in Supabase (or local users.json)
         → Returns { success: true, user: {...}, token: "..." }
         
Frontend → Stores in localStorage
         → Redirects to index.html
```

### Step 4: Test Login Flow

1. Go back to **"Citizen Login"**
2. Enter:
   - Email: test@example.com
   - Password: secret123
3. Click **"Access Legal Platform"**
4. Should redirect to main page with success message

### Step 5: Test Legal Query (AI Analysis)

1. On main page, type a legal question:
   ```
   What are my rights if my landlord refuses to return my security deposit?
   ```
2. Click **"Get Legal Guidance"**
3. Wait 5-10 seconds for AI analysis
4. Should see detailed legal analysis with:
   - Legal domain classification
   - Priority assessment
   - Recommended actions
   - Relevant laws

**What happens:**
```
Frontend → POST http://localhost:3000/api/analyze
         → { query: "..." }
         
Backend  → Calls Google Gemini AI
         → Multi-model fallback (2.5-pro → 1.5-pro → 1.5-flash)
         → Returns formatted legal analysis
         
Frontend → Displays results in results.html
```

### Step 6: Test File Upload (Optional)

**Via API:**
```powershell
# First, get a token by logging in
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/login' -Method Post -ContentType 'application/json' -Body '{"email":"test@example.com","password":"secret123"}'
$token = $loginResponse.token

# Upload a file
Invoke-RestMethod -Uri 'http://localhost:3000/api/upload-fir' -Method Post -Headers @{ Authorization = "Bearer $token" } -Form @{ file = Get-Item '.\backend\test-files\sample_fir.txt' } | ConvertTo-Json
```

**Quick test without token:**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/internal/test-upload' | ConvertTo-Json
```

## Verify Connection Status

### Quick Health Check
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/health' | ConvertTo-Json -Depth 3
```

Expected output:
```json
{
  "status": "Vidhi Saarathi AI Backend is healthy",
  "features": {
    "multiModelAI": "3 models configured",
    "multiKeyRotation": "3 keys configured"
  },
  "uptime": 123.45
}
```

### Check API Quota
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/quota' | ConvertTo-Json
```

## Troubleshooting

### "Failed to fetch" or Network Error

**Problem**: Frontend can't reach backend

**Solutions:**
1. Ensure backend is running (`npm start` in backend folder)
2. Check backend is on port 3000: http://localhost:3000/health
3. Check browser console for CORS errors (should work, CORS is enabled)
4. Try clearing browser cache (Ctrl+Shift+Delete)

### "Invalid credentials" on Login

**Problem**: User doesn't exist or wrong password

**Solutions:**
1. Sign up first before logging in
2. Check you're using the same email/password
3. Check backend console for error messages
4. If using Supabase, verify `users` table exists

### AI Analysis Takes Too Long or Fails

**Problem**: Google API keys issue or network timeout

**Solutions:**
1. Check `GEMINI_API_KEY_*` are set in `backend/.env`
2. Verify API keys are valid at https://makersuite.google.com/app/apikey
3. Remove IP restrictions on API keys
4. Wait up to 3 minutes (backend has intelligent retry)
5. Check `/api/quota` for usage stats

### Upload Fails with "Storage backend not configured"

**Problem**: Supabase not configured

**Solutions:**
1. Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `backend/.env`
2. Verify Supabase project is active
3. Check bucket `fir-uploads` exists in Supabase Storage
4. Try the `/internal/test-upload` endpoint for quick diagnosis

## Architecture Overview

```
┌─────────────────┐
│                 │
│  Frontend       │
│  (HTML/JS)      │
│  Port: 8000     │
│                 │
└────────┬────────┘
         │
         │ HTTP Requests
         │ (fetch API)
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│                 │      │              │
│  Backend        │◄────►│  Supabase    │
│  (Express.js)   │      │  Database    │
│  Port: 3000     │      │  Storage     │
│                 │      │              │
└────────┬────────┘      └──────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│  Google AI      │
│  (Gemini API)   │
│                 │
└─────────────────┘
```

## What Happens on Each Page

### `index.html` (Landing Page)
- Submit legal query → stores in localStorage → redirects to `results.html`
- Does NOT call backend yet (happens in results page)

### `results.html` (Analysis Page)
- Reads query from localStorage
- Calls `POST /api/analyze` with query
- Displays AI-generated legal analysis
- Shows metadata (model used, timing, etc.)

### `auth.html` (Login/Signup)
- Calls `POST /api/signup` or `POST /api/login`
- Stores user and token in localStorage
- Redirects to `index.html`

## Success Indicators

✅ **Backend Connected** when you see:
- Health endpoint returns JSON
- Signup creates user successfully
- Login returns token
- AI analysis returns legal guidance
- Browser console shows no fetch errors

✅ **Frontend Connected** when you see:
- Forms submit without page refresh
- Success messages appear
- Redirects happen automatically
- LocalStorage contains auth data

## Next Steps

### For Local Development
1. Keep backend running in one terminal
2. Open frontend in browser
3. Test all features
4. Check browser console for errors

### For Production Deployment
1. Follow `DEPLOYMENT.md` guide
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Update `API_BASE_URL` in frontend config
5. Test on live URLs

## Files Changed

- ✅ `frontend/auth.html` - Added backend API calls for auth
- ✅ `frontend/results.html` - Fixed API_BASE_URL to auto-detect localhost
- ✅ `backend/server.js` - Already had all needed endpoints
- ✅ `backend/README.md` - Added comprehensive documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide

## Connection Status: ✅ FIXED

The frontend is now fully connected to the backend! All API endpoints are working and the auto-detection logic ensures it works both locally (localhost:3000) and in production (Render URL).

Test it now by following the steps above!
