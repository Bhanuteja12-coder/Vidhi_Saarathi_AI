// Test PDF upload with text extraction and AI analysis
require('dotenv').config();
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function testPdfUpload() {
    console.log('\n📄 Testing PDF Upload with AI Analysis\n');

    // Generate a test token
    const secret = process.env.AUTH_SECRET || 'change_this_in_production';
    const token = jwt.sign({ id: 'test_user_123', email: 'test@example.com' }, secret, { expiresIn: '1h' });
    console.log('✅ Generated test JWT token\n');

    // Check if test PDF exists
    const testPdfPath = path.join(__dirname, '..', 'test-files', 'sample_fir.pdf');
    
    if (!fs.existsSync(testPdfPath)) {
        console.log('⚠️  No test PDF found at:', testPdfPath);
        console.log('💡 Please create a sample PDF or use an existing one\n');
        console.log('For testing, you can:');
        console.log('1. Create a simple PDF with FIR/legal content');
        console.log('2. Or test with any PDF file by changing the path\n');
        return;
    }

    // Upload PDF
    console.log('📤 Uploading PDF to /api/upload-fir...');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testPdfPath));

        const response = await fetch(`${API_BASE}/api/upload-fir`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Upload successful!\n');
            
            console.log('📁 File Info:');
            console.log(`   - Filename: ${data.file.filename}`);
            console.log(`   - Size: ${(data.file.size / 1024).toFixed(2)} KB`);
            console.log(`   - URL: ${data.file.url}`);
            if (data.signedUrl) console.log(`   - Signed URL (24h): ${data.signedUrl.substring(0, 80)}...`);
            
            if (data.extractedText) {
                console.log('\n📝 Extracted Text:');
                console.log(`   - Length: ${data.extractedText.length} characters`);
                console.log(`   - Preview: ${data.extractedText.preview}\n`);
            }

            if (data.analysis) {
                console.log('🤖 AI Analysis:');
                console.log(`   - Model: ${data.analysis.model}`);
                console.log(`   - Timestamp: ${data.analysis.timestamp}`);
                console.log(`   - Analysis (first 500 chars):\n`);
                console.log(data.analysis.text.substring(0, 500) + '...\n');
            } else {
                console.log('⚠️  No AI analysis generated (PDF might have insufficient text)\n');
            }
        } else {
            console.log('❌ Upload failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPdfUpload();
