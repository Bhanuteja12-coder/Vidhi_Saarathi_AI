# Deployment Guide - Vidhi Saarathi AI

Complete guide for deploying backend to Render and frontend to Vercel.

## Prerequisites

- GitHub repository with your code
- Supabase account (free tier is fine)
- Render account (free tier available)
- Vercel account (free tier available)
- Google AI API keys (from https://makersuite.google.com/app/apikey)

## Part 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Choose a region close to your users
4. Wait for project to be ready (~2 minutes)

### 1.2 Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (for frontend if needed)
   - **service_role key** (for backend - keep secret!)

### 1.3 Create Database Tables

1. Go to **SQL Editor**
2. Run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Queries table
CREATE TABLE IF NOT EXISTS public.queries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  url text NOT NULL,
  mime text,
  size bigint,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON public.queries(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
```

### 1.4 Create Storage Bucket

1. Go to **Storage**
2. Click **New bucket**
3. Name: `fir-uploads`
4. **Public bucket**: Choose based on your security needs
   - **Private** (recommended): Files require signed URLs
   - **Public**: Files accessible via public URL
5. Click **Create**

### 1.5 Configure Storage Policies (if private)

If you made the bucket private, add this policy for authenticated access:

```sql
-- Allow service role to upload
CREATE POLICY "Service role can upload files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'fir-uploads');

-- Allow service role to read files
CREATE POLICY "Service role can read files"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'fir-uploads');
```

## Part 2: Backend Deployment (Render)

### 2.1 Prepare Repository

1. Ensure `backend/.env.example` exists (don't commit `.env`)
2. Commit and push all backend code to GitHub

### 2.2 Create Render Web Service

1. Go to https://render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `vidhi-saarathi-backend` (or your choice)
   - **Region**: Choose closest to Supabase region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 2.3 Set Environment Variables

In Render dashboard → **Environment** → **Add Environment Variable**:

```
GEMINI_API_KEY_1=your_first_key_here
GEMINI_API_KEY_2=your_second_key_here
GEMINI_API_KEY_3=your_third_key_here

AUTH_SECRET=your_very_secure_random_string_here

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_FIR_BUCKET=fir-uploads

NODE_ENV=production
LOG_LEVEL=info
```

**Important:**
- Use **strong random string** for `AUTH_SECRET` (e.g., generate with `openssl rand -base64 32`)
- Keep `SUPABASE_SERVICE_KEY` secret - never expose in frontend
- Remove IP restrictions on Google API keys (or add Render's IPs)

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment (~5 minutes)
3. Copy your backend URL: `https://your-app.onrender.com`

### 2.5 Test Backend

```powershell
# Health check
Invoke-RestMethod -Uri 'https://your-app.onrender.com/health' | ConvertTo-Json

# Test signup
Invoke-RestMethod -Uri 'https://your-app.onrender.com/api/signup' -Method Post -ContentType 'application/json' -Body '{"name":"Test","email":"test@example.com","password":"secret123"}' | ConvertTo-Json
```

## Part 3: Frontend Deployment (Vercel)

### 3.1 Update Frontend API URL

**Option A: Set at build time (recommended)**

Create `frontend/config.js`:

```javascript
window.API_BASE_URL = 'https://your-backend.onrender.com';
```

Add to `frontend/*.html` before closing `</body>`:

```html
<script src="config.js"></script>
```

**Option B: Set via environment variable**

In Vercel dashboard, set:
```
API_BASE_URL=https://your-backend.onrender.com
```

Then update frontend to read: `const API_BASE_URL = process.env.API_BASE_URL || ...`

### 3.2 Deploy to Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other (static)
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty for static)
   - **Output Directory**: `.` (current directory)

5. Click **Deploy**
6. Wait for deployment (~2 minutes)
7. Copy your frontend URL: `https://your-app.vercel.app`

### 3.3 Test Full Flow

1. Open `https://your-app.vercel.app`
2. Click **Citizen Login**
3. Sign up with test account
4. Login
5. Submit a legal query
6. Verify analysis appears

## Part 4: Post-Deployment Configuration

### 4.1 Update CORS (if needed)

If frontend on different domain, update `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 4.2 Custom Domain (Optional)

**For Render:**
1. Render Dashboard → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

**For Vercel:**
1. Vercel Dashboard → **Settings** → **Domains**
2. Add your domain
3. Update DNS records

### 4.3 SSL/HTTPS

Both Render and Vercel provide free SSL certificates automatically.

### 4.4 Monitoring

**Render:**
- Check **Logs** tab for errors
- Monitor **Metrics** for performance

**Vercel:**
- Check **Deployments** for build logs
- Use **Analytics** for traffic

## Part 5: Security Checklist

- [ ] `AUTH_SECRET` is strong random string
- [ ] `SUPABASE_SERVICE_KEY` is only in backend environment
- [ ] Google API keys have no IP restrictions (or Render IPs whitelisted)
- [ ] FIR storage bucket is private (use signed URLs)
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Render/Vercel)
- [ ] Remove `/internal/test-upload` endpoint from production
- [ ] Rate limiting configured (if needed)
- [ ] Database backups enabled in Supabase

## Part 6: Troubleshooting

### Backend Issues

**Deployment fails**
- Check logs in Render dashboard
- Verify `package.json` has correct dependencies
- Ensure `npm install` completes successfully

**"Storage backend not configured"**
- Check environment variables are set correctly in Render
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**API timeouts**
- Render free tier sleeps after inactivity (cold starts ~30s)
- Upgrade to paid plan for always-on
- Increase timeout in backend (already 3 minutes)

### Frontend Issues

**Can't connect to backend**
- Verify `API_BASE_URL` is correct
- Check browser console for CORS errors
- Test backend directly: `https://your-backend.onrender.com/health`

**Auth not working**
- Check if backend `/api/login` returns token
- Verify localStorage stores auth data
- Check browser console for errors

### Database Issues

**Insert fails**
- Check SQL tables were created
- Verify foreign key constraints
- Check Supabase logs

**Upload fails**
- Verify bucket exists and name matches
- Check storage policies (if private)
- Test with `/internal/test-upload` endpoint

## Part 7: Scaling & Performance

### Backend Optimization

1. **Enable caching**: Add Redis for session storage
2. **Add CDN**: Use Cloudflare for static assets
3. **Database indexes**: Already added in setup SQL
4. **Connection pooling**: Supabase handles automatically

### Cost Optimization

**Free Tier Limits:**
- Render: 750 hours/month, sleeps after 15min inactivity
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 1GB storage

**Upgrade When:**
- Backend receives high traffic (Render paid ~$7/month)
- Need faster cold starts
- Exceed free storage limits

## Part 8: Maintenance

### Regular Tasks

1. **Monitor API quotas**: Check `/api/quota` endpoint
2. **Rotate secrets**: Update `AUTH_SECRET` periodically
3. **Update dependencies**: `npm update` and test
4. **Check logs**: Review errors weekly
5. **Backup database**: Supabase auto-backups, but export periodically

### Updates

To deploy updates:

**Backend:**
1. Push changes to GitHub
2. Render auto-deploys (or manual trigger)

**Frontend:**
1. Push changes to GitHub
2. Vercel auto-deploys

## Support

If you encounter issues:

1. Check logs (Render/Vercel dashboards)
2. Test endpoints individually
3. Verify environment variables
4. Check Supabase status page
5. Review browser console errors

## Quick Reference

### Essential URLs

```
Backend: https://your-app.onrender.com
Frontend: https://your-app.vercel.app
Supabase: https://your-project.supabase.co
```

### Test Commands

```powershell
# Health
Invoke-RestMethod -Uri 'https://your-backend/health'

# Signup
Invoke-RestMethod -Uri 'https://your-backend/api/signup' -Method Post -Body '{"email":"test@test.com","password":"test123","name":"Test"}' -ContentType 'application/json'

# Login
Invoke-RestMethod -Uri 'https://your-backend/api/login' -Method Post -Body '{"email":"test@test.com","password":"test123"}' -ContentType 'application/json'
```

---

**Deployment Complete!** 🎉

Your Vidhi Saarathi AI platform is now live and accessible worldwide.
