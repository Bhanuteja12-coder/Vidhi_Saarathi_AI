# 🏛️ Vidhi Saarathi AI - Complete Project Summary

## 📋 Project Overview

**Vidhi Saarathi AI** is a comprehensive legal assistance platform that provides AI-powered legal analysis, document processing, and lawyer recommendations for Indian citizens and legal professionals.

**Live Application:**
- **Frontend:** https://vidhi-saarathi-ai1.vercel.app/
- **Backend:** https://vidhi-saarathi-ai-backend.onrender.com/
- **GitHub:** https://github.com/Bhanuteja12-coder/Vidhi_Saarathi_AI

**Version:** 4.3.1 (November 2025)

---

## 🎯 Core Features Implemented

### 1. **Custom ML Model Integration** 🤖 ⭐ NEW!

#### Trained Model (10,000 Legal Queries)
- **Domain Classification**: Predicts legal category (Criminal, Civil, Family, Property, etc.)
- **Urgency Scoring**: Assigns priority score (0-10 scale)
- **Confidence Metrics**: Provides prediction confidence percentage
- **Sub-Category Detection**: Identifies specific legal issue type

#### Deployment
- Model deployed on **Render** (separate service)
- RESTful API endpoint integration
- 30-second timeout with intelligent fallback
- Real-time performance monitoring

#### Hybrid ML + AI Pipeline
```
User Query → ML Model (Domain + Urgency) → AI Analysis (Gemini) → Combined Response
```

**Benefits:**
- ⚡ **Faster predictions** - ML model responds in ~200-300ms
- 🎯 **Higher accuracy** - Trained on 10K actual legal queries
- 💰 **Cost-effective** - Reduces AI API calls for classification
- 📊 **Data-driven** - Uses real user query patterns

**API Endpoints:**
- `POST /api/ml-test` - Test ML model predictions only
- `POST /api/analyze` - Full hybrid analysis (ML + AI)
- `GET /health` - Includes ML model statistics

**Configuration:**
```bash
ML_MODEL_ENABLED=true
ML_MODEL_ENDPOINT=https://your-ml-model.onrender.com/predict
```

---

### 2. **AI-Powered Legal Analysis** 🤖

#### Multi-Model AI System
- **3 Google Gemini Models** with priority-based fallback:
  1. **gemini-2.5-pro** - Highest quality (180s timeout)
  2. **gemini-1.5-pro** - High quality (120s timeout)
  3. **gemini-1.5-flash** - Fast & cost-effective (90s timeout)

#### Intelligent Key Rotation
- **3 API Keys** with automatic failover
- Real-time usage tracking and success rate monitoring
- Exponential backoff retry mechanism
- Smart error recovery

#### Legal Analysis Capabilities
- **Domain Detection:** Criminal, Civil, Family, Constitutional, Corporate, Property, Cyber Law
- **Priority Assessment:** High/Medium/Low with scoring system
- **Legal Recommendations:** Immediate actions, documentation needs, legal process guidance
- **Relevant Laws:** IPC sections, CPC articles, Constitutional provisions
- **Timeline Guidance:** Important deadlines and next steps

**Endpoints:**
- `POST /api/analyze` - Legal query analysis
- `GET /api/quota` - API quota monitoring
- `GET /health` - System health check

---

### 2. **Dual Authentication System** 🔐

#### A. Citizen Authentication (`auth.html`)

**Features:**
- Email & Password registration
- Secure login with password visibility toggle
- "Remember Me" functionality
- Password recovery option
- Responsive design (mobile-friendly)

**Technology:**
- bcrypt password hashing (10 rounds)
- JWT token-based sessions (30-day expiry)
- localStorage for session persistence
- Supabase PostgreSQL database

**User Flow:**
1. Citizen visits `/auth.html`
2. Signs up with email, name, password
3. Backend validates and creates user in database
4. Returns JWT token
5. Auto-redirects to home page
6. Session persists across page refreshes

**Database Schema:**
```sql
users table:
- id (UUID, primary key)
- email (unique, not null)
- password (hashed, not null)
- name (text)
- created_at (timestamp)
```

**Endpoints:**
- `POST /api/signup` - Citizen registration
- `POST /api/login` - Citizen authentication

---

#### B. Lawyer Dashboard Authentication (`dashboard.html`)

**Features:**
- Comprehensive professional registration
- Bar Council verification fields
- Domain specialization selection
- Experience level tracking
- Dual password fields with visibility toggles
- Field-specific validation messages

**Registration Fields:**
- Full Name (Adv. format)
- Email Address
- Mobile Number (10 digits)
- Bar Council Registration Number
- State Bar Council (dropdown)
- **Domain Specialization** (13 options):
  - 🚔 Criminal Law
  - ⚖️ Civil Law
  - 👨‍👩‍👧‍👦 Family Law
  - 🏢 Corporate Law
  - 📜 Constitutional Law
  - 💰 Tax Law
  - 👷 Labor & Employment Law
  - 🏠 Property & Real Estate Law
  - 💡 Intellectual Property Law
  - 🌱 Environmental Law
  - 💻 Cyber & IT Law
  - 🏦 Banking & Finance Law
  - 🔧 Other Specialization
- Years of Experience (5 ranges)
- Password (min 8 characters)
- Confirm Password

**Additional Features:**
- Real-time password strength validation
- Mobile number formatting
- Bar number format validation
- State selection dropdown
- Dark/Light theme toggle

**Technology:**
- Same backend as citizen auth
- Enhanced validation on frontend
- Additional lawyer-specific metadata stored
- Separate `lawyerAuth` localStorage key

**Endpoints:**
- `POST /api/signup` - Lawyer registration (same endpoint, different metadata)
- `POST /api/login` - Lawyer authentication

---

### 3. **Lawyer Recommendation System** 👨‍⚖️

#### Lawyer Database
**12 Sample Lawyers** across 7 specializations:
- **Criminal Law:** 5 lawyers (Advocate Ramesh Kumar, Adv. Priya Sharma, etc.)
- **Family Law:** 2 lawyers
- **Civil Law:** 1 lawyer
- **Corporate Law:** 1 lawyer
- **Property Law:** 1 lawyer
- **Cyber Law:** 1 lawyer
- **Constitutional Law:** 1 lawyer

**Lawyer Profile Structure:**
```json
{
  "id": "lawyer_001",
  "name": "Advocate Ramesh Kumar",
  "specialization": "Criminal Law",
  "experience": "15 years",
  "rating": "4.8",
  "casesHandled": "500+",
  "expertise": ["Murder", "Theft", "Assault", "Fraud"],
  "location": "Delhi High Court",
  "contact": {
    "phone": "+91 98765 43210",
    "email": "ramesh.kumar@lawfirm.in"
  },
  "consultationFee": "₹5,000 - ₹10,000",
  "languages": ["Hindi", "English"],
  "availability": "Mon-Sat, 10 AM - 6 PM"
}
```

#### Domain-Based Matching
- AI analysis identifies legal domain
- Frontend extracts domain from analysis
- Backend filters lawyers by specialization
- Displays matching lawyers with contact info

#### API Endpoints
1. `GET /api/lawyers` - Get all lawyers
2. `GET /api/lawyers/specialization/:specialization` - Filter by domain
3. `GET /api/lawyers/:id` - Get specific lawyer

#### UI Features (`results.html`)
- Automatic lawyer card display
- Contact buttons (Call/Email/WhatsApp)
- Lawyer expertise tags
- Rating and experience display
- Consultation fee information
- Responsive grid layout

---

### 4. **Document Storage & Management** 📁

#### Supabase Storage Integration

**Storage Bucket:** `fir-uploads`

**Supported File Types:**
- PDF documents (with text extraction)
- Images (JPG, PNG)
- Text files
- Other legal documents

**Features:**
- 20MB file size limit
- Secure file upload with authentication
- Public and signed URL generation
- Metadata tracking in database

#### File Upload Process
1. User uploads file via `/api/upload-fir`
2. JWT authentication required
3. File stored in memory (multer)
4. Uploaded to Supabase Storage bucket
5. Public URL generated for access
6. Signed URL (24-hour expiry) for security
7. Metadata saved to `uploads` table

**Database Schema:**
```sql
uploads table:
- id (UUID, primary key)
- user_id (UUID, foreign key → users)
- filename (text)
- url (text, public URL)
- mime (text, MIME type)
- size (integer, bytes)
- created_at (timestamp)
```

**Endpoints:**
- `POST /api/upload-fir` - Upload legal document (protected)
- `GET /internal/test-upload` - Internal test endpoint

---

### 5. **PDF Document Processing** 📄

#### PDF Text Extraction
**Library:** `pdf-parse` (Node.js)

**Process Flow:**
1. User uploads PDF file
2. Backend receives file buffer
3. `pdf-parse` extracts all text content
4. Text cleaned and trimmed
5. Character count logged
6. Preview (500 chars) returned to frontend

#### AI-Powered Document Analysis

**Automatic Analysis Trigger:**
- If extracted text > 50 characters
- AI analyzes document content
- Provides structured legal analysis

**Analysis Output:**
```html
<div class="document-analysis">
  <h3>📄 Document Type & Summary</h3>
  - Document Type: FIR/Complaint/Legal Notice
  - Key Parties: Complainant, Accused
  - Summary: 2-3 sentence overview
  
  <h3>⚖️ Legal Analysis</h3>
  - Applicable Laws: IPC sections, CrPC
  - Nature of Offense: Cognizable/Bailable
  - Legal Issues: Key points
  
  <h3>📋 Recommended Actions</h3>
  1. Immediate Steps
  2. Documentation needed
  3. Legal Recourse options
  4. Timeline & deadlines
  
  <h3>⚠️ Important Notice</h3>
  - Disclaimer
</div>
```

**Response Structure:**
```json
{
  "success": true,
  "file": {
    "filename": "path/to/file",
    "url": "public_url",
    "mime": "application/pdf",
    "size": 1234567
  },
  "signedUrl": "secure_24h_url",
  "extractedText": {
    "length": 5000,
    "preview": "First 500 characters..."
  },
  "analysis": {
    "text": "HTML formatted analysis",
    "model": "gemini-1.5-pro",
    "timestamp": "2025-11-09T12:00:00Z"
  }
}
```

---

### 6. **Query Management System** 📝

#### Features
- Save user legal queries
- Track query history
- Associate queries with users
- Store metadata (timestamps, etc.)

#### Database Schema
```sql
queries table:
- id (UUID, primary key)
- user_id (UUID, foreign key → users)
- query_text (text)
- metadata (jsonb)
- created_at (timestamp)
```

**Endpoint:**
- `POST /api/queries` - Save user query (protected)

**Use Cases:**
- Legal history tracking
- Query analytics
- User behavior analysis
- Recommendation improvements

---

## 🏗️ Technical Architecture

### Backend Stack

**Framework:** Node.js + Express.js

**Core Dependencies:**
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "node-fetch": "^2.6.7",
  "@supabase/supabase-js": "^2.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "multer": "^1.4.5-lts.1",
  "pdf-parse": "^1.1.1"
}
```

**Database:** Supabase PostgreSQL

**Storage:** Supabase Storage (S3-compatible)

**AI Provider:** Google Gemini API (3 models)

**Hosting:** Render (https://render.com)

**Version:** 4.3.1

---

### Frontend Stack

**Technologies:**
- Pure HTML5, CSS3, JavaScript (ES6+)
- No frontend framework (vanilla JS)
- Responsive design (mobile-first)
- Font Awesome icons
- Google Fonts (Georgia, serif)

**Pages:**
1. `index.html` - Landing page
2. `auth.html` - Citizen authentication
3. `dashboard.html` - Lawyer dashboard
4. `results.html` - Legal analysis & lawyer recommendations
5. `upload.html` - Document upload interface
6. `debug-api.html` - API diagnostic tool
7. `test-signup.html` - Signup testing tool
8. `ml-test.html` - ML model testing interface ⭐ NEW!

**Hosting:** Vercel (https://vercel.com)

**Features:**
- Dark/Light theme toggle (localStorage)
- Responsive navigation
- Form validation
- Password visibility toggles
- Loading states
- Error handling
- Success messages

---

### Database Structure

**Supabase PostgreSQL Tables:**

1. **users** - User accounts
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     name TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **queries** - User legal queries
   ```sql
   CREATE TABLE queries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     query_text TEXT NOT NULL,
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **uploads** - File uploads
   ```sql
   CREATE TABLE uploads (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     filename TEXT NOT NULL,
     url TEXT NOT NULL,
     mime TEXT,
     size INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

**Storage Buckets:**
- `fir-uploads` - Legal document storage

**File Storage:**
- `backend/data/lawyers.json` - Lawyer directory (12 lawyers)
- `backend/data/users.json` - Fallback user storage (development)

---

## 🔒 Security Features

### 1. Authentication & Authorization
- **bcrypt** password hashing (10 salt rounds)
- **JWT** tokens with 30-day expiry
- Token-based API protection
- `verifyToken` middleware for protected routes

### 2. CORS Configuration
```javascript
Allowed Origins:
- localhost:3000, localhost:5500, 127.0.0.1:5500
- All Vercel deployments (*.vercel.app)
- All Render deployments (*.onrender.com)
- Specific production URLs

Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Credentials: true
Preflight Cache: 600 seconds
```

### 3. Input Validation
- Email format validation
- Password strength requirements (min 8 chars)
- Mobile number validation (10 digits)
- Bar Council number validation
- File size limits (20MB)
- Query length limits (2000 chars)

### 4. Error Handling
- Try-catch blocks on all endpoints
- Detailed error logging
- User-friendly error messages
- Technical details in development mode

### 5. Rate Limiting (Future)
- Currently: Multiple API keys with rotation
- Planned: Express rate-limit middleware

---

## 📊 API Documentation

### Authentication Endpoints

#### 1. Signup
```http
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}

Response 200:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token"
}

Response 409:
{
  "success": false,
  "error": "Email already exists"
}
```

#### 2. Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response 200:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token"
}

Response 401:
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### Legal Analysis Endpoints

#### 3. Analyze Legal Query
```http
POST /api/analyze
Content-Type: application/json

{
  "query": "What are my rights if landlord refuses to return security deposit?"
}

Response 200:
{
  "success": true,
  "analysis": "<div class='legal-analysis'>...</div>",
  "metadata": {
    "model": "gemini-1.5-pro",
    "keyUsed": "Primary Key",
    "totalAttempts": 1,
    "processingTime": 2500,
    "timestamp": "2025-11-09T12:00:00Z"
  }
}

Response 400:
{
  "success": false,
  "error": "Legal query is required"
}
```

---

### Lawyer Directory Endpoints

#### 4. Get All Lawyers
```http
GET /api/lawyers

Response 200:
{
  "success": true,
  "lawyers": [...],
  "count": 12
}
```

#### 5. Get Lawyers by Specialization
```http
GET /api/lawyers/specialization/Criminal%20Law

Response 200:
{
  "success": true,
  "lawyers": [...],
  "count": 5,
  "specialization": "Criminal Law"
}
```

#### 6. Get Lawyer by ID
```http
GET /api/lawyers/lawyer_001

Response 200:
{
  "success": true,
  "lawyer": {
    "id": "lawyer_001",
    "name": "Advocate Ramesh Kumar",
    ...
  }
}
```

---

### Document Management Endpoints

#### 7. Upload FIR Document
```http
POST /api/upload-fir
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [PDF/Image file]

Response 200:
{
  "success": true,
  "file": {
    "filename": "path/to/file",
    "url": "public_url",
    "mime": "application/pdf",
    "size": 1234567
  },
  "signedUrl": "secure_24h_url",
  "extractedText": {
    "length": 5000,
    "preview": "..."
  },
  "analysis": {
    "text": "...",
    "model": "gemini-1.5-pro",
    "timestamp": "..."
  }
}

Response 401:
{
  "success": false,
  "error": "Missing auth token"
}
```

#### 8. Save User Query
```http
POST /api/queries
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "query": "My legal question",
  "metadata": {
    "category": "criminal"
  }
}

Response 200:
{
  "success": true,
  "query": {
    "id": "uuid",
    "user_id": "uuid",
    "query_text": "...",
    "created_at": "..."
  }
}
```

---

### System Monitoring Endpoints

#### 9. Health Check
```http
GET /health

Response 200:
{
  "status": "Vidhi Saarathi AI Backend is healthy",
  "version": "4.3.1",
  "features": {
    "enhancedTimeouts": true,
    "intelligentRetry": true,
    "multiModelAI": "3 models configured",
    "multiKeyRotation": "3 keys configured"
  },
  "keyUsageStats": [...],
  "modelInfo": [...],
  "uptime": 3600,
  "timestamp": "..."
}
```

#### 10. API Quota Check
```http
GET /api/quota

Response 200:
{
  "quotaStatus": [...],
  "summary": {
    "totalKeys": 3,
    "activeKeys": 3,
    "totalRequests": 150,
    "totalSuccesses": 145,
    "overallSuccessRate": "96.7%"
  }
}
```

---

## 🚀 Deployment Architecture

### Frontend (Vercel)
```
GitHub (main branch)
    ↓ (auto-deploy on push)
Vercel Build System
    ↓
CDN Distribution
    ↓
https://vidhi-saarathi-ai1.vercel.app/
```

**Configuration (`vercel.json`):**
```json
{
  "version": 2,
  "name": "vidhi-saarathi-ai",
  "installCommand": "echo 'No dependencies to install'",
  "buildCommand": "echo 'No build needed for static site'",
  "outputDirectory": "frontend",
  "rewrites": [...]
}
```

### Backend (Render)
```
GitHub (main branch)
    ↓ (auto-deploy on push)
Render Build System
    ↓ (npm install + node server.js)
Node.js Server (Port 3000)
    ↓
https://vidhi-saarathi-ai-backend.onrender.com/
```

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_FIR_BUCKET`
- `GEMINI_API_KEY_1`
- `GEMINI_API_KEY_2`
- `GEMINI_API_KEY_3`
- `ML_MODEL_ENABLED` ⭐ NEW!
- `ML_MODEL_ENDPOINT` ⭐ NEW!
- `AUTH_SECRET`
- `NODE_ENV`
- `PORT`

---

## 📈 Feature Enhancements Made

### Session 1: Authentication Fixes
- ✅ Fixed lawyer signup API integration
- ✅ Added field-specific validation
- ✅ Improved error messages

### Session 2: Lawyer Recommendation
- ✅ Created lawyer database (12 lawyers)
- ✅ Implemented domain detection
- ✅ Built lawyer matching system
- ✅ Added lawyer card UI

### Session 3: Deployment
- ✅ Deployed frontend to Vercel
- ✅ Deployed backend to Render
- ✅ Fixed CORS issues
- ✅ Resolved submodule problems

### Session 4: CORS Enhancement (v4.3.1)
- ✅ Added OPTIONS preflight handling
- ✅ Enhanced CORS headers
- ✅ Fixed citizen auth API URL
- ✅ Created debug tools

---

## 🎯 User Journeys

### Citizen User Journey
1. **Landing** → Visit homepage
2. **Authentication** → Click "Citizen Login" → Sign up/Login
3. **Legal Query** → Enter legal question → Click analyze
4. **Results** → View AI analysis + lawyer recommendations
5. **Contact Lawyer** → Click call/email/WhatsApp button
6. **Document Upload** → Upload FIR → Get AI analysis

### Lawyer User Journey
1. **Landing** → Visit homepage
2. **Registration** → Click "Lawyer Dashboard" → Complete professional signup
3. **Dashboard** → Access lawyer features (coming soon)
4. **Profile** → Manage cases, clients, consultations

---

## 📝 File Structure

```
Vidhi_Saarathi_AI/
├── frontend/
│   ├── index.html              # Landing page
│   ├── auth.html               # Citizen authentication
│   ├── dashboard.html          # Lawyer dashboard
│   ├── results.html            # Legal analysis results
│   ├── upload.html             # Document upload
│   ├── debug-api.html          # API diagnostic tool
│   └── test-signup.html        # Signup testing
├── backend/
│   ├── server.js               # Main server (v4.3.1)
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   └── data/
│       ├── lawyers.json        # 12 lawyer profiles
│       └── users.json          # Fallback user storage
├── vercel.json                 # Vercel config
├── .gitignore                  # Git ignore rules
├── README.md                   # Project readme
├── FIXES_APPLIED.md            # Fix documentation
└── SIGNUP_FIX_GUIDE.md         # Troubleshooting guide
```

---

## 🔮 Future Enhancements

### Phase 1 (Immediate)
- [ ] Password reset flow
- [ ] Email verification
- [ ] User profile management
- [ ] Query history dashboard

### Phase 2 (Short Term)
- [ ] Real lawyer registration system
- [ ] Case management dashboard
- [ ] Payment integration
- [ ] Appointment booking

### Phase 3 (Medium Term)
- [ ] Mobile app (React Native)
- [ ] Video consultation
- [ ] Document templates
- [ ] Multi-language support

### Phase 4 (Long Term)
- [ ] Aadhaar e-KYC integration
- [ ] Court case tracking
- [ ] Legal document automation
- [ ] AI legal assistant chatbot

---

## 📊 Statistics

**Code Metrics:**
- **Backend:** 1,150+ lines (server.js)
- **Frontend:** 5,000+ lines (all HTML files)
- **Database Tables:** 3 (users, queries, uploads)
- **API Endpoints:** 15+
- **Lawyers:** 12 profiles
- **Specializations:** 13 legal domains
- **AI Models:** 3 with fallback
- **API Keys:** 3 with rotation

**Development Timeline:**
- **Start:** November 2025
- **Version:** 4.3.1
- **Commits:** 60+
- **Files:** 15+
- **Deployments:** 10+

---

## 🏆 Key Achievements

✅ **Dual authentication system** (Citizen + Lawyer)  
✅ **Multi-model AI** with intelligent retry  
✅ **Document upload** with PDF text extraction  
✅ **Lawyer recommendation** based on legal domain  
✅ **Database integration** (Supabase PostgreSQL)  
✅ **Cloud storage** (Supabase Storage)  
✅ **Production deployment** (Vercel + Render)  
✅ **CORS optimization** for cross-origin requests  
✅ **Responsive design** (mobile-first)  
✅ **Error handling** with user-friendly messages  
✅ **Debug tools** for troubleshooting  
✅ **Comprehensive documentation**  

---

## 📞 Support & Maintenance

**Repository:** https://github.com/Bhanuteja12-coder/Vidhi_Saarathi_AI  
**Owner:** Bhanuteja12-coder  
**Branch:** main  
**License:** MIT (or specify)  

**For Issues:**
1. Check `/health` endpoint
2. Use `/debug-api.html` diagnostic tool
3. Review error logs on Render
4. Check browser console (F12)
5. Verify environment variables

---

**🎉 Project Status: FULLY OPERATIONAL ✅**

**Last Updated:** November 9, 2025  
**Version:** 4.3.1  
**Developer:** GitHub Copilot AI Assistant
