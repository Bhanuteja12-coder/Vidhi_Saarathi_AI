# ML Model Integration for Vidhi Saarathi AI

## 🎯 Overview

Your custom ML model (trained on 10,000 legal queries) is integrated as a **reference/suggestion system** for:
- **Domain Classification Hints** (Criminal Law, Civil Law, Family Law, etc.)
- **Urgency Scoring Suggestions** (0-10 priority scale)

**Important:** The ML model provides **suggestions/hints** that the AI considers but can override. The AI makes the final determination based on comprehensive legal analysis.

## Why Reference-Only?

ML models trained on 10K queries provide good suggestions but:
- ❌ May not always be 100% accurate
- ❌ Can't capture nuances of complex legal issues
- ❌ Lack comprehensive legal knowledge

✅ **Solution:** Use ML as a **starting hint** + AI for **expert analysis**

## 🔧 Setup Instructions

### Step 1: Add Environment Variables

Add these to your `.env` file and Render environment variables:

```bash
# ML Model Configuration
ML_MODEL_ENABLED=true
ML_MODEL_ENDPOINT=https://your-ml-model.onrender.com/predict
```

Replace `https://your-ml-model.onrender.com/predict` with your actual Render ML model endpoint.

### Step 2: Deploy to Render

1. Commit changes: `git add . && git commit -m "Add ML model integration" && git push`
2. Render will auto-deploy
3. Add environment variables in Render dashboard

## 📡 API Endpoints

### 1. Test ML Model
```http
POST https://vidhi-saarathi-ai-backend.onrender.com/api/ml-test
Content-Type: application/json

{
  "query": "My landlord is not returning my security deposit"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "domain": "Property Law",
    "urgencyScore": 3,
    "confidence": 0.92,
    "responseTime": 245
  },
  "modelConfig": {
    "endpoint": "https://your-ml-model.onrender.com/predict",
    "timeout": 30000,
    "fallbackEnabled": true
  }
}
```

### 2. Legal Analysis (ML + AI Hybrid)
```http
POST https://vidhi-saarathi-ai-backend.onrender.com/api/analyze
Content-Type: application/json

{
  "query": "Someone filed false FIR against me"
}
```

**Response includes ML suggestions as reference:**
```json
{
  "success": true,
  "analysis": "<div class='legal-analysis'>...</div>",
  "mlSuggestions": {
    "suggestedDomain": "Criminal Law",
    "suggestedUrgency": 5,
    "confidence": 0.95,
    "responseTime": 230,
    "note": "ML suggestions provided as reference - AI makes final determination"
  },
  "metadata": {
    "model": "gemini-1.5-pro",
    "mlHintsProvided": true,
    "processingTime": 2500
  }
}
```

## 🔌 ML Model Expected API Format

Your ML model should accept and return this format:

### Request to Your ML Model:
```json
POST /predict
{
  "query": "Legal query text here"
}
```

### Response Format from Your ML Model:
```json
{
  "domain": "Criminal Law",
  "urgency_score": 5
}
```

**Note:** The backend will use these as **suggestions** that the AI can consider and override if needed.

**Urgency Scale:** 0-5
- 0-1: Low priority
- 2-3: Medium priority  
- 4-5: High priority

**Optional fields** (recommended but not required):
```json
{
  "domain": "Criminal Law",
  "urgency_score": 8,
  "confidence": 0.94
}
```

## 🎯 How It Works

### Hybrid ML + AI Pipeline (ML as Reference)

```
User Query
    ↓
1. ML Model Suggestion (Optional)
    ├─→ Suggested Domain
    ├─→ Suggested Urgency (0-10)
    └─→ Confidence Score
    ↓
2. AI Analysis (Gemini) - Final Authority
    ├─→ Considers ML suggestions
    ├─→ Performs independent legal analysis
    ├─→ Determines actual domain & urgency
    └─→ Generates detailed recommendations
    ↓
3. Combined Response
    ├─→ ML suggestions (for reference)
    ├─→ AI analysis (authoritative)
    └─→ Lawyer recommendations
```

### Why This Approach?

**ML Model Strengths:**
- Fast pattern recognition (~200ms)
- Good for common cases
- Reduces AI prompt complexity

**AI Model Strengths:**
- Comprehensive legal knowledge
- Handles edge cases and nuances
- Provides detailed reasoning
- Can override ML when needed

**Result:** Best of both worlds - ML efficiency + AI accuracy

## 📊 Monitoring

### Check ML Model Stats
```http
GET https://vidhi-saarathi-ai-backend.onrender.com/health
```

**Response includes:**
```json
{
  "mlModelStats": {
    "endpoint": "https://your-ml-model.onrender.com/predict",
    "totalCalls": 150,
    "successCalls": 145,
    "failedCalls": 5,
    "successRate": "96.7%",
    "avgResponseTime": "245ms",
    "fallbackEnabled": true
  }
}
```

## 🧪 Testing

### Local Testing

1. **Test ML Model Connection:**
```bash
curl -X POST http://localhost:3000/api/ml-test \
  -H "Content-Type: application/json" \
  -d '{"query": "Landlord not returning security deposit"}'
```

2. **Test Full Analysis:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "Someone filed false case against me"}'
```

### Production Testing

Use the frontend at https://vidhi-saarathi-ai1.vercel.app/results.html

Or test directly:
```bash
curl -X POST https://vidhi-saarathi-ai-backend.onrender.com/api/ml-test \
  -H "Content-Type: application/json" \
  -d '{"query": "My employer is not paying my salary"}'
```

## 🎨 Frontend Integration

The frontend will display ML suggestions as reference:

```html
<div class="ml-suggestion-badge">
  💡 ML Suggestion: Property Law (Urgency: 6/10)
  <small>AI is analyzing for final determination...</small>
</div>
```

Update `results.html` to show ML suggestions:

```javascript
if (data.mlSuggestions && data.mlSuggestions.suggestedDomain) {
    const mlBadge = `
        <div class="ml-suggestion">
            <p><strong>💡 ML Initial Suggestion (for reference):</strong></p>
            <p>Suggested Domain: ${data.mlSuggestions.suggestedDomain}</p>
            <p>Suggested Urgency: ${data.mlSuggestions.suggestedUrgency}/10</p>
            <p><small><em>AI is performing comprehensive analysis...</em></small></p>
        </div>
    `;
    // Show while AI analyzes
}
```

## 🔐 Security

- ML model endpoint should be **HTTPS only**
- Consider adding **API key authentication** between backend and ML model
- Set appropriate **CORS headers** on ML model
- Use **rate limiting** to prevent abuse

## 🚀 Performance Optimization

### Current Settings:
- **Timeout:** 30 seconds
- **Fallback:** Enabled (uses AI if ML fails)
- **Caching:** Consider adding Redis cache for common queries

### Recommendations:
1. **Cache ML predictions** for similar queries
2. **Async processing** for non-urgent queries
3. **Batch processing** for multiple queries
4. **Monitor latency** and optimize model serving

## 📈 Analytics

Track ML model performance:

```javascript
// Backend automatically tracks:
- Total calls
- Success rate
- Average response time
- Failed calls
- Domains predicted
- Urgency distribution
```

## 🛠️ Troubleshooting

### ML Model Not Working

1. **Check environment variable:**
   ```bash
   echo $ML_MODEL_ENABLED
   echo $ML_MODEL_ENDPOINT
   ```

2. **Test ML endpoint directly:**
   ```bash
   curl -X POST https://your-ml-model.onrender.com/predict \
     -H "Content-Type: application/json" \
     -d '{"query": "test query"}'
   ```

3. **Check backend logs:**
   - Look for "🤖 Calling ML model..."
   - Check for error messages

4. **Verify response format:**
   - Must include `domain` field
   - Must include `urgency_score` field

### Fallback to AI

If you see "⚠️ ML model failed, falling back to AI analysis":
- Check ML model is running on Render
- Verify endpoint URL is correct
- Check ML model logs for errors
- Ensure proper JSON response format

## 🎯 Example Queries for Testing

1. **Criminal Law - High Urgency:**
   - "Someone filed false FIR against me"
   - "I am being blackmailed"

2. **Property Law - Medium Urgency:**
   - "Landlord not returning security deposit"
   - "Neighbor encroaching on my land"

3. **Family Law - Varied Urgency:**
   - "Want to file for divorce" (Medium)
   - "Child custody dispute" (High)

4. **Civil Law - Low to Medium:**
   - "Contract dispute with vendor"
   - "Consumer complaint against company"

## 📝 Next Steps

1. ✅ Add `ML_MODEL_ENDPOINT` to Render environment
2. ✅ Set `ML_MODEL_ENABLED=true`
3. ✅ Test with `/api/ml-test` endpoint
4. ✅ Monitor `/health` for ML stats
5. ✅ Update frontend to show ML predictions
6. ✅ Add caching for performance
7. ✅ Set up error monitoring

## 🔗 Resources

- **Backend:** https://vidhi-saarathi-ai-backend.onrender.com
- **Frontend:** https://vidhi-saarathi-ai1.vercel.app
- **GitHub:** https://github.com/Bhanuteja12-coder/Vidhi_Saarathi_AI
- **Health Check:** https://vidhi-saarathi-ai-backend.onrender.com/health
- **ML Test:** https://vidhi-saarathi-ai-backend.onrender.com/api/ml-test

---

**🎉 ML Model Integration Complete!**

Your trained model will now provide instant domain classification and urgency scoring for all legal queries.
