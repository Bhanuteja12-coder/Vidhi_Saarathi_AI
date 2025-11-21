# ⚖️ Vidhi Saarathi AI

> AI-Powered Legal Assistance Platform for Indian Law with Expert Lawyer Recommendations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg)](https://vercel.com)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-brightgreen.svg)](https://render.com)

## 🌟 Features

### 🤖 AI Legal Analysis
- **Advanced AI Models**: Google Gemini 2.5 Pro, 1.5 Pro, and 1.5 Flash
- **Intelligent Retry Logic**: Automatic fallback between models and API keys
- **Domain Detection**: Automatically identifies legal domain (Criminal, Civil, Family, etc.)
- **Comprehensive Analysis**: Detailed legal advice with relevant IPC sections and actionable steps

### 👨‍⚖️ Expert Lawyer Recommendations
- **Smart Matching**: Automatically shows lawyers based on query domain
- **12+ Verified Lawyers**: Across 7 specializations
- **Complete Profiles**: Ratings, experience, expertise areas, and consultation fees
- **One-Click Contact**: Email and call buttons for instant connection

### 🔐 User Authentication
- **Secure Signup/Login**: JWT-based authentication with bcrypt password hashing
- **User Dashboard**: Track queries and uploaded documents
- **Lawyer Dashboard**: Separate portal for legal professionals

### 📄 Document Processing
- **PDF Upload**: Upload FIR copies and legal documents
- **Text Extraction**: Automatic text extraction from PDFs
- **AI Analysis**: Instant analysis of uploaded documents
- **Secure Storage**: Supabase storage with signed URLs

### 💬 Interactive Chatbot
- **Real-time Assistance**: AI-powered chatbot on homepage
- **Context-Aware**: Understands legal terminology and Indian law
- **Quick Responses**: Instant answers to common legal questions

## 🚀 Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript**
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Gradient backgrounds, smooth animations
- **Fetch API**: For backend communication

### Backend
- **Node.js** with Express.js
- **Supabase**: PostgreSQL database and file storage
- **Google Gemini AI**: Multiple models with fallback
- **JWT Authentication**: Secure token-based auth
- **PDF Processing**: pdf-parse for text extraction

### Infrastructure
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Version Control**: GitHub

## 📁 Project Structure

```
Vidhi_Saarathi_AI/
├── frontend/
│   ├── index.html              # Homepage with chatbot
│   ├── results.html            # Legal analysis page
│   ├── auth.html               # User authentication
│   ├── dashboard.html          # Lawyer dashboard
│   └── upload.html             # Document upload page
├── backend/
│   ├── server.js               # Main Express server
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables (not in repo)
│   ├── data/
│   │   └── lawyers.json        # Lawyer profiles
│   └── scripts/
│       ├── test_lawyers.js     # Test lawyer endpoints
│       └── test_pdf_upload.js  # Test PDF upload
├── docs/
│   ├── DEPLOYMENT_GUIDE.md     # Complete deployment guide
│   ├── DEPLOYMENT_COMMANDS.txt # Quick command reference
│   ├── LAWYER_FEATURE_SUMMARY.md
│   └── SIGNUP_TROUBLESHOOTING.md
├── .gitignore
├── vercel.json                 # Vercel configuration
└── README.md                   # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- Git installed
- Supabase account
- Google AI API keys
- GitHub account

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bhanuteja12-coder/Vidhi_Saarathi_AI.git
   cd Vidhi_Saarathi_AI
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file in backend folder:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_FIR_BUCKET=fir-uploads
   GEMINI_API_KEY_1=your_gemini_key_1
   GEMINI_API_KEY_2=your_gemini_key_2
   GEMINI_API_KEY_3=your_gemini_key_3
   AUTH_SECRET=your_secret_key
   PORT=3000
   ```

4. **Setup Supabase database:**

   Run these SQL queries in Supabase SQL editor:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email VARCHAR(255) UNIQUE NOT NULL,
     password TEXT NOT NULL,
     name VARCHAR(255),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Queries table
   CREATE TABLE queries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     query_text TEXT NOT NULL,
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Uploads table
   CREATE TABLE uploads (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     filename VARCHAR(255) NOT NULL,
     url TEXT NOT NULL,
     mime VARCHAR(100),
     size INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Create storage bucket:**
   - Go to Supabase Dashboard → Storage
   - Create bucket named: `fir-uploads`
   - Set as public or private as needed

6. **Start the backend server:**
   ```bash
   npm start
   ```

7. **Open frontend:**
   Open `frontend/index.html` in your browser or use Live Server extension in VS Code

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete step-by-step instructions.

### Quick Deployment Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Backend on Render:**
   - Go to https://render.com
   - Create Web Service from GitHub repo
   - Set root directory to `backend`
   - Add environment variables

3. **Deploy Frontend on Vercel:**
   - Go to https://vercel.com
   - Import GitHub repository
   - Set output directory to `frontend`
   - Deploy!

## 🧪 Testing

### Test Backend Endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get all lawyers
curl http://localhost:3000/api/lawyers

# Get lawyers by specialization
curl http://localhost:3000/api/lawyers/specialization/Criminal%20Law

# Analyze legal query
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"query":"Someone stole my phone"}'
```

### Test Frontend:
1. Open `frontend/results.html`
2. Enter: "Someone was threatening me with a knife"
3. Click "Analyze Query"
4. Verify AI analysis appears
5. Verify lawyer recommendations show below

## 📊 API Endpoints

### Public Endpoints
- `GET /health` - Server health check
- `GET /api/quota` - API quota monitoring
- `POST /api/analyze` - Legal analysis
- `GET /api/lawyers` - Get all lawyers
- `GET /api/lawyers/specialization/:specialization` - Filter lawyers
- `GET /api/lawyers/:id` - Get specific lawyer

### Protected Endpoints (Require JWT)
- `POST /api/signup` - User registration
- `POST /api/login` - User authentication
- `POST /api/queries` - Save user query
- `GET /api/queries` - Get user queries
- `POST /api/upload-fir` - Upload document

## 👨‍⚖️ Lawyer Specializations

The system includes lawyers in:
- **Criminal Law** (5 lawyers) - Theft, assault, murder, cybercrime
- **Family Law** (2 lawyers) - Divorce, custody, marriage issues
- **Civil Law** (1 lawyer) - Property disputes, contracts
- **Corporate Law** (1 lawyer) - Company law, M&A
- **Property Law** (1 lawyer) - Real estate, land disputes
- **Cyber Law** (1 lawyer) - Online fraud, data privacy
- **Constitutional Law** (1 lawyer) - Fundamental rights, PIL

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure authentication
- **Environment Variables**: Sensitive data not in code
- **CORS Protection**: Controlled origin access
- **Input Validation**: Server-side validation
- **Signed URLs**: Temporary access to uploaded files

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Akash N** - [@Akash-N-24](https://github.com/Akash-N-24)

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- Supabase for database and storage
- Render & Vercel for hosting platforms
- All contributors and users of this project

## 📧 Contact

For questions or support:
- **GitHub Issues**: [Create an issue](https://github.com/Akash-N-24/Vidhi_Saarathi_AI/issues)
- **Email**: Available in GitHub profile

## 🗺️ Roadmap

### Completed ✅
- AI legal analysis with multiple models
- Lawyer recommendation system
- User authentication
- Document upload and analysis
- Responsive design
- Deployment ready

### Upcoming 🚧
- Real lawyer registration system
- Client-lawyer messaging
- Appointment booking
- Payment integration
- Review and rating system
- Mobile app (React Native)
- Multi-language support
- Voice input for queries

## 📈 Stats

- **12+ Verified Lawyers**
- **7 Legal Specializations**
- **3 AI Models** with intelligent fallback
- **Multiple API Keys** for redundancy
- **99%+ Uptime** on cloud platforms

---

Made with ❤️ for the Indian Legal System

**⚖️ Vidhi Saarathi AI** - Your AI Legal Companion
