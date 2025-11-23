# ML Model API Specification

## Your ML Model Should Implement This API

**Important:** Your ML model provides **suggestions/hints** to the AI, not final answers. The AI will consider your suggestions but make the final determination.

### Endpoint
```
POST /predict
```

### Request Format
```json
{
  "query": "Legal query text here"
}
```

### Response Format

#### Required Fields (Minimum):
```json
{
  "domain": "Criminal Law",
  "urgency_score": 8
}
```

#### Recommended Format (with confidence):
```json
{
  "domain": "Criminal Law",
  "urgency_score": 8,
  "confidence": 0.94
}
```

**Note:** 
- These are treated as **suggestions** that the AI considers
- AI may override if the suggestion appears incorrect
- Your model doesn't need to be 100% accurate - AI will verify

### Field Mapping

The backend automatically maps these field names:

| Required Field | Your Model Can Use |
|---------------|-------------------|
| `domain` | `domain`, `predicted_domain`, or `classification` |
| `urgency_score` | `urgency_score`, `urgency`, or `priority_score` |

| Optional Field | Your Model Can Use |
|---------------|-------------------|
| `confidence` | `confidence` or `probability` |

**Keep it simple:** Just return `domain` and `urgency_score`

### Domain Values

Recommended domain classifications:
- Criminal Law
- Civil Law
- Family Law
- Property Law
- Corporate Law
- Constitutional Law
- Tax Law
- Labor Law
- Cyber Law
- Consumer Law
- Environmental Law
- Intellectual Property Law
- Banking Law

### Urgency Score

Scale: **0-5**
- 0-1: Low priority
- 2-3: Medium priority
- 4-5: High priority

### Example Queries & Expected Responses

#### Example 1: Criminal Law
**Query:** "Someone filed a false FIR against me"
```json
{
  "domain": "Criminal Law",
  "urgency_score": 5,
  "confidence": 0.96
}
```

#### Example 2: Property Law
**Query:** "My landlord is not returning my security deposit"
```json
{
  "domain": "Property Law",
  "urgency_score": 3,
  "confidence": 0.92
}
```

#### Example 3: Family Law
**Query:** "I want to file for divorce"
```json
{
  "domain": "Family Law",
  "urgency_score": 2,
  "confidence": 0.88
}
```

#### Example 4: Labor Law
**Query:** "My employer is not paying my salary"
```json
{
  "domain": "Labor Law",
  "urgency_score": 4,
  "confidence": 0.91
}
```

## Deployment on Render

### Requirements
- Python 3.8+
- Flask or FastAPI
- Your trained model files
- requirements.txt

### Sample Flask App
```python
from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load your trained model
model = pickle.load(open('model.pkl', 'rb'))
vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Your prediction logic here
        features = vectorizer.transform([query])
        domain = model.predict_domain(features)[0]
        urgency = model.predict_urgency(features)[0]
        confidence = model.predict_proba(features).max()
        
        return jsonify({
            'domain': domain,
            'urgency_score': int(urgency),
            'confidence': float(confidence),
            'sub_category': get_subcategory(domain, query)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'loaded'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### requirements.txt
```
Flask==2.3.0
scikit-learn==1.3.0
numpy==1.24.0
pandas==2.0.0
```

### Render Configuration
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
4. Add to requirements.txt:
   ```
   gunicorn==20.1.0
   ```

## Testing Your Model

### Local Testing
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "Someone filed false FIR against me"}'
```

### Production Testing
Once deployed to Render:
```bash
curl -X POST https://your-model.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "Someone filed false FIR against me"}'
```

## Integration with Vidhi Saarathi

After deploying your model:

1. **Copy your Render URL**
   ```
   https://your-ml-model.onrender.com
   ```

2. **Add to Vidhi Saarathi backend .env**
   ```bash
   ML_MODEL_ENABLED=true
   ML_MODEL_ENDPOINT=https://your-ml-model.onrender.com/predict
   ```

3. **Deploy backend** (Render auto-deploys from GitHub)

4. **Test integration**
   - Visit: https://vidhi-saarathi-ai1.vercel.app/ml-test.html
   - Enter a query and click "Test ML Model Only"

## Performance Expectations

- **Response Time:** < 500ms (ideally 200-300ms)
- **Accuracy:** > 85% for domain classification
- **Uptime:** > 99%

## CORS Configuration

Your ML model should allow requests from:
```python
from flask_cors import CORS

CORS(app, origins=[
    'https://vidhi-saarathi-ai-backend.onrender.com',
    'https://vidhi-saarathi-ai1.vercel.app',
    'http://localhost:3000'
])
```

## Error Handling

Your API should return proper HTTP status codes:
- **200:** Successful prediction
- **400:** Invalid request (missing query, etc.)
- **500:** Internal server error

## Monitoring

Track these metrics:
- Total predictions made
- Average response time
- Error rate
- Domain distribution
- Urgency distribution

## Support

If you need help:
1. Check logs on Render dashboard
2. Test endpoint directly with curl
3. Use Vidhi Saarathi's ml-test.html tool
4. Review integration documentation in ML_MODEL_INTEGRATION.md
