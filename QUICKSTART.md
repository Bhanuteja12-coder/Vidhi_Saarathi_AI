# 🚀 Quick Start Guide - Vidhi Saarathi AI

## ⚡ Start Everything (2 Commands)

```powershell
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2 (or browser): Open Frontend
cd frontend
python -m http.server 8000
# Then open: http://localhost:8000
```

## 🧪 Quick Test (1 Command)

```powershell
cd backend
node scripts/e2e_test.js
```

## 📋 Essential URLs

| Service | Local URL | What It Does |
|---------|-----------|--------------|
| Frontend | http://localhost:8000 | User interface |
| Backend | http://localhost:3000 | API server |
| Health | http://localhost:3000/health | System status |
| Test Upload | http://localhost:3000/internal/test-upload | Quick upload test |

## 🔑 Key Features

✅ **Auth**: Signup/Login with JWT tokens
✅ **AI**: Multi-model Gemini (2.5/1.5 pro/flash)
✅ **Storage**: Supabase DB + file uploads
✅ **Smart**: Auto-retry, fallback, 3-min timeout

## 📖 Documentation

| File | Purpose |
|------|---------|
| `SUCCESS.md` | ← **START HERE** - Complete status |
| `CONNECTION_FIXED.md` | What was fixed & how to test |
| `DEPLOYMENT.md` | Deploy to Render + Vercel |
| `backend/README.md` | Backend API reference |

## 🎯 Test Flow (Browser)

1. Open http://localhost:8000
2. Click "Citizen Login" → Sign Up
3. Fill form → Create Account
4. Login with same credentials
5. Type legal question → Get Guidance
6. Wait 10-30s → See AI analysis ✨

## 💡 Pro Tips

- Backend must run before frontend
- Use Python server (not double-click file)
- Check console for errors (F12)
- Health check: http://localhost:3000/health

## 🆘 Quick Fixes

**Can't connect?**
```powershell
# Check backend is running
Invoke-RestMethod http://localhost:3000/health
```

**AI not working?**
- Check `GEMINI_API_KEY_*` in `backend/.env`
- Wait full 3 minutes (enhanced timeout)

**Upload fails?**
- Check `SUPABASE_*` vars in `backend/.env`
- Test: http://localhost:3000/internal/test-upload

## 🚀 Deploy to Production

```powershell
# 1. Push to GitHub
git add .
git commit -m "Ready for production"
git push

# 2. Follow DEPLOYMENT.md for:
#    - Render (backend)
#    - Vercel (frontend)
#    - Supabase (already set up)
```

## 📞 Need Help?

1. Read `SUCCESS.md` for detailed status
2. Check browser console (F12)
3. Check backend terminal for errors
4. Run `node scripts/e2e_test.js` for diagnosis

---

**Status**: ✅ **FULLY OPERATIONAL**

Everything is connected and working! 🎉
