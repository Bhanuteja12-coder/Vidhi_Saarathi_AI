# Vidhi Saarathi AI - Backend

Legal AI assistance platform backend with authentication, storage, and AI-powered legal analysis.

## Features

- 🔐 **Authentication**: Email/password signup and login with JWT tokens
- 💾 **Storage**: Supabase-backed PostgreSQL database + file storage for FIR documents
- 🤖 **AI Analysis**: Multi-model Gemini AI with intelligent retry and fallback
- 📁 **File Upload**: Secure document upload with metadata tracking
- 🔄 **Dual Mode**: Works with Supabase (production) or local file storage (development)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
# Required for AI
GEMINI_API_KEY_1=your_key_here
GEMINI_API_KEY_2=your_key_here
GEMINI_API_KEY_3=your_key_here

# Required for auth
AUTH_SECRET=your_secure_random_string

# Required for Supabase (production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_FIR_BUCKET=fir-uploads

# Optional
NODE_ENV=development
PORT=3000
```

### 3. Set Up Supabase (Production Mode)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID generation
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
```

Create a storage bucket named `fir-uploads` in Supabase Storage.

### 4. Start Server

```bash
npm start
# or for development
npm run dev
```

Server runs at `http://localhost:3000`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with system stats |
| GET | `/api/quota` | API key quota monitoring |
| POST | `/api/signup` | Create new user account |
| POST | `/api/login` | Authenticate user |
| POST | `/api/analyze` | Legal query analysis (AI) |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/queries` | Save user query to database |
| POST | `/api/upload-fir` | Upload FIR document |

### Testing/Internal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internal/test-upload` | Quick upload test (no auth) |

## Testing

### Manual Testing (PowerShell)

**1. Health Check**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/health' | ConvertTo-Json -Depth 3
```

**2. Signup**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/signup' -Method Post -ContentType 'application/json' -Body '{"name":"Test User","email":"test@example.com","password":"secret123"}' | ConvertTo-Json
```

**3. Login**
```powershell
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/login' -Method Post -ContentType 'application/json' -Body '{"email":"test@example.com","password":"secret123"}'
$token = $response.token
$response | ConvertTo-Json
```

**4. Legal Query Analysis**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/analyze' -Method Post -ContentType 'application/json' -Body '{"query":"What are my rights if my landlord refuses to return my security deposit?"}' | ConvertTo-Json -Depth 5
```

**5. Upload Document (with token)**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/upload-fir' -Method Post -Headers @{ Authorization = "Bearer $token" } -Form @{ file = Get-Item '.\test-files\sample_fir.txt' } | ConvertTo-Json
```

**6. Quick Upload Test (no token)**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/internal/test-upload' | ConvertTo-Json
```

### Automated Testing

Run the test scripts:

```bash
# Test login endpoint
node scripts/test_login.js

# Test Supabase upload
node scripts/upload_test.js

# Call health check
node scripts/call_health.js
```

## Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`
   - `AUTH_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_FIR_BUCKET`
   - `NODE_ENV=production`
   - `PORT` (Render sets this automatically)

4. Build Command: `npm install`
5. Start Command: `npm start`

### Deploy Frontend to Vercel

1. Create a new project on Vercel
2. Connect the `frontend` folder
3. Set environment variables (if needed for frontend config):
   - No sensitive keys should go here!
   - Frontend will auto-detect localhost or use deployed backend URL

4. Update `frontend/results.html` to set production API URL:
   ```javascript
   // Before deploying, set this:
   window.API_BASE_URL = 'https://your-backend.onrender.com';
   ```

## Architecture

### Authentication Flow
1. User signs up → backend hashes password with bcrypt → stores in Supabase/file
2. User logs in → backend verifies password → returns JWT token
3. Protected endpoints verify JWT using `AUTH_SECRET`

### Storage Modes

**Production (Supabase)**
- Uses PostgreSQL for users/queries/uploads metadata
- Uses Supabase Storage for file uploads
- Scalable and reliable

**Development (File-based)**
- Uses `backend/data/users.json` for auth
- Falls back when `SUPABASE_URL` not set
- Good for local testing

### AI Analysis
- Multi-model: gemini-2.5-pro → gemini-1.5-pro → gemini-1.5-flash
- Multi-key rotation with intelligent retry
- Enhanced timeouts (up to 3 minutes)
- Exponential backoff for rate limits

## Project Structure

```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .env               # Environment variables (gitignored)
├── .env.example       # Template for .env
├── data/              # Local file storage (dev mode)
│   └── users.json
├── scripts/           # Testing scripts
│   ├── make_token.js
│   ├── test_login.js
│   ├── upload_test.js
│   └── call_health.js
├── test-files/        # Sample files for testing
│   └── sample_fir.txt
└── test-output/       # Script output files
```

## Security Notes

- Never commit `.env` file
- Keep `SUPABASE_SERVICE_KEY` secret (backend only)
- Use `SUPABASE_ANON_KEY` for frontend if needed
- Rotate `AUTH_SECRET` if compromised
- For production: make FIR bucket private and use signed URLs
- Remove `/internal/test-upload` endpoint before production

## Troubleshooting

**"Storage backend not configured"**
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Verify Supabase project is active

**"Bucket not found"**
- Create bucket named `fir-uploads` in Supabase Storage
- Check `SUPABASE_FIR_BUCKET` env var

**Upload returns 403**
- Bucket is private → use `signedUrl` from response
- Or make bucket public in Supabase settings

**AI analysis timeout**
- Normal for complex queries (up to 3 minutes)
- Check Google API key quotas
- Remove IP restrictions on API keys for cloud deployment

**Frontend can't reach backend**
- Ensure backend is running on port 3000
- Check CORS is enabled (already configured)
- Verify `API_BASE_URL` in frontend matches backend URL

## Support

For issues, check:
1. Server logs (console output)
2. Browser console (frontend errors)
3. `/health` endpoint for system status
4. `/api/quota` endpoint for API key usage

## License

MIT
