# 📄 PDF Upload & Analysis Feature

## Overview

The backend now automatically extracts text from uploaded PDF documents and provides AI-powered legal analysis!

## How It Works

1. **Upload PDF** → Backend receives file
2. **Extract Text** → Reads PDF content using pdf-parse
3. **AI Analysis** → Gemini AI analyzes the legal document
4. **Store & Return** → Saves to Supabase + returns analysis

## API Endpoint

### POST `/api/upload-fir`

**Authentication**: Required (JWT token)

**Content-Type**: `multipart/form-data`

**Form Field**: `file` (the PDF file)

**Response**:
```json
{
  "success": true,
  "file": {
    "user_id": "uuid",
    "filename": "path_in_storage",
    "url": "https://...",
    "mime": "application/pdf",
    "size": 12345,
    "created_at": "2025-11-08T..."
  },
  "signedUrl": "https://...?token=... (24 hour validity)",
  "extractedText": {
    "length": 1523,
    "preview": "First 500 characters of extracted text..."
  },
  "analysis": {
    "text": "<div>Full HTML formatted legal analysis</div>",
    "model": "gemini-2.5-pro",
    "timestamp": "2025-11-08T..."
  }
}
```

## What Gets Analyzed

The AI analyzes the PDF and provides:

✅ **Document Type** - FIR, Complaint, Legal Notice, etc.
✅ **Key Parties** - Complainant, Accused, Witnesses
✅ **Summary** - Brief overview of the case
✅ **Applicable Laws** - IPC sections, CrPC, other relevant laws
✅ **Nature of Offense** - Cognizable/Non-cognizable, Bailable/Non-bailable
✅ **Legal Issues** - Key legal points identified
✅ **Recommended Actions** - Step-by-step guidance
✅ **Timeline** - Important deadlines

## Supported File Types

- ✅ **PDF** (`.pdf`) - Text extraction + AI analysis
- ✅ **Images** (`.jpg`, `.png`) - Storage only (no text extraction yet)
- ✅ **Text** (`.txt`) - Storage only

## Requirements

**Backend Dependencies**:
- `pdf-parse` - PDF text extraction (already installed)
- `multer` - File upload handling
- `@supabase/supabase-js` - Storage

**Environment Variables**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key
- `SUPABASE_FIR_BUCKET` - Storage bucket name (default: `fir-uploads`)
- `GEMINI_API_KEY_*` - Google AI keys for analysis
- `AUTH_SECRET` - JWT secret

## Testing

### Option 1: PowerShell Upload

```powershell
# 1. Get a JWT token by logging in
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/login' -Method Post -ContentType 'application/json' -Body '{"email":"test@example.com","password":"secret123"}'
$token = $loginResponse.token

# 2. Upload a PDF
Invoke-RestMethod -Uri 'http://localhost:3000/api/upload-fir' `
  -Method Post `
  -Headers @{ Authorization = "Bearer $token" } `
  -Form @{ file = Get-Item 'C:\path\to\your\fir.pdf' } | ConvertTo-Json -Depth 10
```

### Option 2: Test Script

```bash
cd backend
node scripts/test_pdf_upload.js
```

### Option 3: cURL (Windows CMD)

```cmd
set TOKEN=your_jwt_token_here
curl -X POST "http://localhost:3000/api/upload-fir" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "file=@C:\path\to\fir.pdf"
```

## Example Use Cases

### 1. Upload FIR Copy
- User uploads scanned FIR PDF
- Backend extracts complainant details, sections, etc.
- AI provides analysis of charges and legal options

### 2. Upload Legal Notice
- Upload lawyer's notice PDF
- AI identifies type of notice, demands, deadlines
- Provides recommended response actions

### 3. Upload Court Order
- Upload court judgment/order PDF
- AI summarizes verdict, obligations, appeal options
- Highlights critical dates and compliance requirements

## Limitations & Notes

⚠️ **Text Quality**: OCR quality depends on PDF clarity
⚠️ **File Size**: Current limit 20MB (configurable in multer)
⚠️ **Processing Time**: PDF extraction + AI analysis takes 15-45 seconds
⚠️ **Language**: Best results with English text
⚠️ **Scanned PDFs**: Image-based PDFs need OCR (not yet implemented)

## Response Time

- **Upload only**: ~2 seconds
- **Upload + text extraction**: ~5 seconds
- **Upload + extraction + AI analysis**: 15-45 seconds

## Error Handling

The endpoint will:
- ✅ Continue upload even if PDF parsing fails
- ✅ Skip AI analysis if insufficient text extracted
- ✅ Return partial results on errors
- ✅ Log errors for debugging

## Security

✅ **Authentication required** - JWT token mandatory
✅ **User isolation** - Files linked to user ID
✅ **Signed URLs** - 24-hour expiry for downloads
✅ **File type validation** - MIME type checking
✅ **Size limits** - 20MB default max

## Frontend Integration Example

```javascript
// Upload PDF with analysis
async function uploadFirPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('userAuth')?.token;
    
    const response = await fetch('http://localhost:3000/api/upload-fir', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Show extracted text
        console.log('Extracted:', result.extractedText?.preview);
        
        // Display AI analysis
        if (result.analysis) {
            document.getElementById('analysis').innerHTML = result.analysis.text;
        }
        
        // Download link with signed URL
        const downloadLink = result.signedUrl || result.file.url;
    }
}
```

## Troubleshooting

**"PDF parsing error"**
- PDF might be corrupted or encrypted
- Try with a different PDF file
- Check PDF is text-based, not scanned image

**"Insufficient text extracted"**
- PDF has too little content (< 50 chars)
- PDF might be image-based (needs OCR)
- Check PDF file quality

**"AI analysis failed"**
- Check Google API keys in `.env`
- Verify API quota: http://localhost:3000/api/quota
- Wait for retry (automatic with exponential backoff)

**"Storage backend not configured"**
- Verify Supabase environment variables
- Check bucket `fir-uploads` exists
- Test with `/internal/test-upload`

## Future Enhancements

🔮 **Planned Features**:
- OCR for scanned/image-based PDFs
- Multi-page analysis with page references
- Extract and analyze images in PDFs
- Support for Word documents (.docx)
- Batch upload multiple documents
- Compare multiple FIRs/documents
- Generate summary reports

## Database Schema

The `uploads` table stores metadata:

```sql
CREATE TABLE public.uploads (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  filename text NOT NULL,
  url text NOT NULL,
  mime text,
  size bigint,
  created_at timestamptz DEFAULT now()
);
```

*Note: Extracted text and analysis are returned in response but not stored in DB (can be added if needed)*

## Performance Tips

1. **Compress PDFs** before upload for faster processing
2. **Use text-based PDFs** not scanned images
3. **Keep under 5MB** for best performance
4. **Monitor API quota** to avoid rate limits

---

## Quick Start

1. **Install dependencies**: `npm install` (pdf-parse already added)
2. **Upload a PDF**: Use test script or PowerShell
3. **Check response**: Look for `extractedText` and `analysis` fields
4. **Display in UI**: Show analysis HTML to user

🎉 **PDF upload with AI analysis is ready to use!**
