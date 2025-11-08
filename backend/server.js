const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Enhanced CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            /^https:\/\/.*\.vercel\.app$/,  // All Vercel deployments
            /^https:\/\/.*\.onrender\.com$/,  // All Render deployments (including self)
            'https://vidhi-saarathi-ai.vercel.app',
            'https://vidhi-saarathi-ai1.vercel.app',
            'https://vidhi-saarathi-ai-backend.onrender.com'
        ];
        
        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // 10 minutes
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        return res.status(204).end();
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Supabase (Postgres + Storage) Integration ---
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
    });
    console.log('\u2705 Supabase client initialized');
} else {
    console.warn('\u26a0 Supabase environment variables not set. DB/storage features disabled');
}

// Simple file-based user store fallback for development when Supabase is not configured
const USERS_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(USERS_DIR, 'users.json');

function ensureUsersFile() {
    try {
        if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });
        if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    } catch (err) {
        console.error('Could not ensure users file:', err.message || err);
    }
}

function readUsersFile() {
    ensureUsersFile();
    try {
        const content = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(content || '[]');
    } catch (err) {
        console.error('Error reading users file:', err.message || err);
        return [];
    }
}

function writeUsersFile(users) {
    ensureUsersFile();
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing users file:', err.message || err);
        return false;
    }
}

// Multer setup for uploads (store in memory then push to Supabase storage)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// Helper: generate JWT
function generateToken(payload) {
    const secret = process.env.AUTH_SECRET || 'change_this_in_production';
    return jwt.sign(payload, secret, { expiresIn: '30d' });
}

// Middleware: verify JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.AUTH_SECRET || 'change_this_in_production';
    if (!token) return res.status(401).json({ success: false, error: 'Missing auth token' });
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

// Basic signup endpoint (email + password) - stores user in Supabase "users" table
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

        if (supabase) {
            const hashed = await bcrypt.hash(password, 10);
            const { data, error } = await supabase.from('users').insert([{ email, password: hashed, name }]).select().single();
            if (error) {
                if (error.code === '23505') return res.status(409).json({ success: false, error: 'Email already exists' });
                throw error;
            }
            const token = generateToken({ id: data.id, email: data.email });
            return res.json({ success: true, user: { id: data.id, email: data.email, name: data.name }, token });
        }

        // Fallback: file-based user store (simple mode)
        const users = readUsersFile();
        if (users.find(u => u.email === email)) return res.status(409).json({ success: false, error: 'Email already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const newUser = { id: `local_${Date.now()}`, email, password: hashed, name, created_at: new Date().toISOString() };
        users.push(newUser);
        writeUsersFile(users);

        // For simple frontend compatibility, return success and user object (no token required)
        return res.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (error) {
        console.error('Signup error:', error.message || error);
        res.status(500).json({ success: false, error: 'Signup failed' });
    }
});

// Basic login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

        if (supabase) {
            const { data, error } = await supabase.from('users').select().eq('email', email).single();
            if (error || !data) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const match = await bcrypt.compare(password, data.password);
            if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });

            const token = generateToken({ id: data.id, email: data.email });
            return res.json({ success: true, user: { id: data.id, email: data.email, name: data.name }, token });
        }

        // Fallback: file-based auth for simple frontend compatibility
        const users = readUsersFile();
        const user = users.find(u => u.email === email);
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        // For simple frontend, return user object (no token required)
        return res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error.message || error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Save user query endpoint
app.post('/api/queries', verifyToken, async (req, res) => {
    if (!supabase) return res.status(500).json({ success: false, error: 'Storage backend not configured' });
    try {
        const { query, metadata } = req.body;
        if (!query) return res.status(400).json({ success: false, error: 'Query text required' });

        const payload = { user_id: req.user.id, query_text: query, metadata: metadata || {}, created_at: new Date() };
        const { data, error } = await supabase.from('queries').insert([payload]).select().single();
        if (error) throw error;
        res.json({ success: true, query: data });
    } catch (error) {
        console.error('Save query error:', error.message || error);
        res.status(500).json({ success: false, error: 'Could not save query' });
    }
});

// Upload FIR file (protected). Stores file in Supabase Storage bucket 'fir-uploads' and records metadata in 'uploads' table
app.post('/api/upload-fir', verifyToken, upload.single('file'), async (req, res) => {
    if (!supabase) return res.status(500).json({ success: false, error: 'Storage backend not configured' });
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'File is required' });

        const bucket = 'fir-uploads';
        const filename = `${req.user.id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (uploadError) throw uploadError;

        // Get URLs
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
        const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(uploadData.path, 60 * 60 * 24); // 24 hours

        // Extract text from PDF if applicable
        let extractedText = null;
        let analysis = null;
        
        if (req.file.mimetype === 'application/pdf') {
            try {
                console.log('📄 Extracting text from PDF...');
                const pdfData = await pdfParse(req.file.buffer);
                extractedText = pdfData.text.trim();
                console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

                // Analyze extracted text with AI if substantial content found
                if (extractedText && extractedText.length > 50) {
                    console.log('🤖 Analyzing extracted document with AI...');
                    const analysisPrompt = `You are Vidhi Saarathi AI, expert in Indian law. I have uploaded a legal document (FIR/complaint/case). Please analyze it and provide:

Document Content:
"${extractedText.substring(0, 4000)}"

Provide structured analysis in HTML format:

<div class="document-analysis">

<h3>📄 Document Type & Summary</h3>
<p><strong>Document Type:</strong> [FIR/Complaint/Legal Notice/Other]</p>
<p><strong>Key Parties:</strong> [Complainant, Accused, etc.]</p>
<p><strong>Summary:</strong> [2-3 sentences about the case]</p>

<h3>⚖️ Legal Analysis</h3>
<p><strong>Applicable Laws:</strong> [IPC sections, CrPC sections, or other laws mentioned]</p>
<p><strong>Nature of Offense:</strong> [Cognizable/Non-cognizable, Bailable/Non-bailable if applicable]</p>
<p><strong>Legal Issues:</strong> [Key legal points in the document]</p>

<h3>📋 Recommended Actions</h3>
<ol>
<li><strong>Immediate Steps:</strong> [What to do now]</li>
<li><strong>Documentation:</strong> [Additional documents needed]</li>
<li><strong>Legal Recourse:</strong> [Options available]</li>
<li><strong>Timeline:</strong> [Important deadlines if any]</li>
</ol>

<h3>⚠️ Important Notice</h3>
<p><em>This AI analysis is for informational purposes. Consult a qualified lawyer for case-specific legal advice.</em></p>

</div>`;

                    const aiResult = await callAIWithAdvancedFallback(analysisPrompt);
                    if (aiResult.success) {
                        analysis = {
                            text: aiResult.analysis,
                            model: aiResult.model,
                            timestamp: aiResult.timestamp
                        };
                        console.log('✅ AI analysis completed');
                    }
                } else {
                    console.log('⚠️ Insufficient text extracted for AI analysis');
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError.message || pdfError);
                // Continue with upload even if PDF parsing fails
            }
        }

        // Save metadata to database
        const meta = {
            user_id: req.user.id,
            filename: uploadData.path,
            url: publicData.publicUrl,
            mime: req.file.mimetype,
            size: req.file.size,
            created_at: new Date()
        };
        const { data: dbData, error: dbError } = await supabase.from('uploads').insert([meta]).select().single();
        if (dbError) console.warn('Upload metadata save warning:', dbError.message || dbError);

        res.json({ 
            success: true, 
            file: meta,
            signedUrl: signedData?.signedUrl,
            extractedText: extractedText ? {
                length: extractedText.length,
                preview: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
            } : null,
            analysis: analysis
        });
    } catch (error) {
        console.error('Upload FIR error:', error.message || error);
        res.status(500).json({ success: false, error: 'File upload failed' });
    }
});

// Temporary: internal test upload endpoint (unauthenticated) for quick verification
// Uploads `backend/test-files/sample_fir.txt` to the configured Supabase bucket and returns URLs
app.get('/internal/test-upload', async (req, res) => {
    if (!supabase) return res.status(500).json({ success: false, error: 'Storage backend not configured' });
    try {
        const samplePath = path.join(__dirname, 'test-files', 'sample_fir.txt');
        if (!fs.existsSync(samplePath)) return res.status(404).json({ success: false, error: 'Sample file not found' });

        const buffer = fs.readFileSync(samplePath);
        const bucket = process.env.SUPABASE_FIR_BUCKET || 'fir-uploads';
        const filename = `internal_test_${Date.now()}_sample_fir.txt`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(filename, buffer, { contentType: 'text/plain', upsert: false });
        if (uploadError) return res.status(500).json({ success: false, error: uploadError.message || uploadError });

        const publicData = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
        const signed = await supabase.storage.from(bucket).createSignedUrl(uploadData.path, 60 * 60);

        // Try to insert metadata to uploads table (ignore DB errors)
        try {
            await supabase.from('uploads').insert([{
                user_id: null,
                filename: uploadData.path,
                url: publicData.data.publicUrl,
                mime: 'text/plain',
                size: buffer.length,
                created_at: new Date()
            }]);
        } catch (e) {
            console.warn('Could not save upload metadata:', e.message || e);
        }

        res.json({
            success: true,
            path: uploadData.path,
            publicUrl: publicData.data.publicUrl,
            signedUrl: signed.data?.signedUrl
        });
    } catch (error) {
        console.error('Internal test upload error:', error.message || error);
        res.status(500).json({ success: false, error: 'Internal upload failed' });
    }
});

// ✅ MULTI-MODEL CONFIGURATION WITH PRIORITY
const AI_MODELS = [
    {
        name: 'gemini-2.5-pro',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
        priority: 1,
        timeout: 180000, // 3 minutes for complex analysis
        description: 'Highest quality for complex legal analysis'
    },
    {
        name: 'gemini-1.5-pro',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        priority: 2,
        timeout: 120000, // 2 minutes
        description: 'High quality with good reliability'
    },
    {
        name: 'gemini-1.5-flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        priority: 3,
        timeout: 90000, // 1.5 minutes
        description: 'Fast and cost-effective'
    }
];

// ✅ MULTI-API KEY CONFIGURATION WITH ENHANCED TRACKING
const API_KEYS = [
    {
        key: process.env.GEMINI_API_KEY_1,
        name: 'Primary Key',
        priority: 1,
        usageCount: 0,
        successCount: 0,
        errorCount: 0,
        lastUsed: 0,
        lastSuccess: 0
    },
    {
        key: process.env.GEMINI_API_KEY_2,
        name: 'Secondary Key',
        priority: 2,
        usageCount: 0,
        successCount: 0,
        errorCount: 0,
        lastUsed: 0,
        lastSuccess: 0
    },
    {
        key: process.env.GEMINI_API_KEY_3,
        name: 'Backup Key',
        priority: 3,
        usageCount: 0,
        successCount: 0,
        errorCount: 0,
        lastUsed: 0,
        lastSuccess: 0
    }
].filter(keyConfig => keyConfig.key); // Remove undefined keys

// ✅ ENHANCED FETCH WITH CUSTOM TIMEOUT AND ABORT CONTROLLER
async function fetchWithEnhancedTimeout(url, options = {}) {
    const { timeout = 120000, ...fetchOptions } = options;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);
    
    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout/1000} seconds`);
        }
        
        // Handle network errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error(`Network error: ${error.message}`);
        }
        
        throw error;
    }
}

// ✅ ENHANCED AI CALL WITH INTELLIGENT RETRY AND TIMEOUT HANDLING
async function callAIWithAdvancedFallback(prompt) {
    let lastError = null;
    let totalAttempts = 0;
    const maxRetries = 2; // Retry each key/model combo up to 2 times
    const baseDelay = 2000; // 2 seconds base delay
    
    console.log(`\n🤖 Starting enhanced AI analysis with ${AI_MODELS.length} models and ${API_KEYS.length} API keys`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    
    // Try each model in priority order
    for (const model of AI_MODELS) {
        console.log(`\n🎯 Trying ${model.name} (Priority ${model.priority}) - Timeout: ${model.timeout/1000}s`);
        
        // Try ALL keys with current model before moving to next model
        for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
            const keyConfig = API_KEYS[keyIndex];
            
            // Retry logic for each key/model combination
            for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
                totalAttempts++;
                
                try {
                    keyConfig.usageCount++;
                    keyConfig.lastUsed = Date.now();
                    
                    const retryInfo = retryCount > 0 ? ` (Retry ${retryCount}/${maxRetries})` : '';
                    console.log(`🔑 Using ${keyConfig.name} with ${model.name} - Attempt ${totalAttempts}${retryInfo}`);
                    
                    const requestStart = Date.now();
                    
                    // Enhanced API call with model-specific timeout
                    const response = await fetchWithEnhancedTimeout(`${model.endpoint}?key=${keyConfig.key}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: prompt }]
                            }]
                        }),
                        timeout: model.timeout
                    });

                    const requestTime = Date.now() - requestStart;
                    
                    if (response.ok) {
                        const data = await response.json();
                        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        
                        if (analysis && analysis.length > 50) { // Ensure we got a substantial response
                            keyConfig.successCount++;
                            keyConfig.lastSuccess = Date.now();
                            
                            console.log(`✅ SUCCESS: ${model.name} with ${keyConfig.name}!`);
                            console.log(`⏱️ Request time: ${requestTime}ms`);
                            console.log(`📊 Response length: ${analysis.length} characters`);
                            
                            return {
                                success: true,
                                analysis: analysis,
                                model: model.name,
                                keyUsed: keyConfig.name,
                                totalAttempts: totalAttempts,
                                requestTime: requestTime,
                                retryCount: retryCount,
                                timestamp: new Date().toISOString()
                            };
                        } else {
                            throw new Error('Empty or invalid response from AI model');
                        }
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                        
                        keyConfig.errorCount++;
                        console.log(`❌ ${model.name} with ${keyConfig.name} failed: ${errorMessage}`);
                        
                        // Handle rate limiting with exponential backoff
                        if (response.status === 429) {
                            console.log(`⚡ Rate limit exceeded - will retry with exponential backoff`);
                            if (retryCount < maxRetries) {
                                const delay = baseDelay * Math.pow(2, retryCount); // 2s, 4s, 8s
                                console.log(`⏳ Waiting ${delay/1000}s before retry...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue; // Retry with same key/model
                            }
                        }
                        
                        // Handle service unavailable with backoff
                        if (response.status === 503) {
                            console.log(`⚡ Service temporarily unavailable`);
                            if (retryCount < maxRetries) {
                                const delay = baseDelay * Math.pow(2, retryCount);
                                console.log(`⏳ Waiting ${delay/1000}s before retry...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue; // Retry with same key/model
                            }
                        }
                        
                        lastError = new Error(`${model.name} (${keyConfig.name}): ${errorMessage}`);
                        break; // Move to next key for this model
                    }
                    
                } catch (error) {
                    keyConfig.errorCount++;
                    console.log(`❌ ${model.name} with ${keyConfig.name} error: ${error.message}`);
                    
                    // Retry on network/timeout errors
                    if (error.message.includes('timeout') || 
                        error.message.includes('network') || 
                        error.code === 'ECONNRESET' ||
                        error.code === 'ETIMEDOUT') {
                        
                        if (retryCount < maxRetries) {
                            const delay = baseDelay * Math.pow(2, retryCount);
                            console.log(`⏳ Network/timeout error - retrying in ${delay/1000}s...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            continue; // Retry with same key/model
                        }
                    }
                    
                    lastError = error;
                    break; // Move to next key for this model
                }
            }
        }
        
        console.log(`🔄 All ${API_KEYS.length} keys exhausted for ${model.name}, trying next model...`);
    }
    
    // All models and keys failed
    console.log(`❌ All ${AI_MODELS.length} models with ${API_KEYS.length} keys failed after ${totalAttempts} attempts!`);
    
    // Generate detailed error report
    const keyStats = API_KEYS.map(key => 
        `${key.name}: ${key.successCount}/${key.usageCount} success rate`
    ).join(', ');
    
    throw new Error(`All AI models and keys failed after ${totalAttempts} attempts. Key stats: ${keyStats}. Last error: ${lastError?.message || 'Unknown error'}`);
}

// ✅ ENHANCED LEGAL ANALYSIS ENDPOINT WITH OPTIMIZED PROMPT
app.post('/api/analyze', async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('\n🏛️ ===== NEW LEGAL ANALYSIS REQUEST =====');
        
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: "Legal query is required"
            });
        }

        if (query.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Query too long. Please limit to 2000 characters for optimal performance."
            });
        }

        console.log(`📝 Query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
        console.log(`📏 Query length: ${query.length} characters`);

        // ✅ OPTIMIZED LEGAL ANALYSIS PROMPT (REDUCED SIZE FOR BETTER PERFORMANCE)
        const legalPrompt = `You are Vidhi Saarathi AI, expert in Indian law. Analyze this legal query concisely but comprehensively:

"${query}"

Provide structured analysis in HTML format:



<div class="legal-analysis">

<div class="domain-section">

<h3>🏛️ Legal Domain</h3>

<p><strong>Primary Domain:</strong> <span class="domain-badge">[Criminal Law/Civil Law/Family Law/Constitutional Law/Corporate Law/Property Law/Cyber Law]</span></p>

<p><strong>Sub-Category:</strong> [Specific area within the domain]</p>

<p><strong>Brief Explanation:</strong> [2-3 sentences explaining the legal area]</p>

</div>



<div class="priority-section">

<h3>⚠️ Priority Assessment</h3>

<div class="priority-badge">[High/Medium/Low] Priority</div>

<p><strong>Score:</strong> [X]/10</p>

<p><strong>Reasoning:</strong> [Why this priority level - 1-2 sentences]</p>

</div>



<div class="explanation-section">

<h3>⚖️ Legal Analysis</h3>

<p>[Explain legal issues in simple terms. Include 2-3 most relevant sections of IPC/CPC/Constitution]</p>

</div>



<div class="actions-section">

<h3>📋 Recommended Actions</h3>

<ol>

<li><strong>Immediate:</strong> [What to do now]</li>

<li><strong>Documentation:</strong> [Key documents needed]</li>

<li><strong>Legal Process:</strong> [Next legal steps]</li>

<li><strong>Timeline:</strong> [Important deadlines]</li>

</ol>

</div>



<div class="laws-section">

<h3>📖 Relevant Laws</h3>

<ul>

<li>[Most applicable IPC sections]</li>

<li>[Relevant CPC/Constitution articles]</li>

<li>[Other applicable laws]</li>

</ul>

</div>



<div class="disclaimer-section">

<h3>⚠️ Important Notice</h3>

<p><em>This AI analysis is for general information only. Consult a qualified lawyer for specific legal advice tailored to your situation.</em></p>

</div>

</div>



Keep response comprehensive but concise for optimal performance.`;
        // Call enhanced AI system
        const aiResult = await callAIWithAdvancedFallback(legalPrompt);
        
        const processingTime = Date.now() - startTime;
        
        console.log(`🎉 Legal analysis completed successfully!`);
        console.log(`🤖 Model used: ${aiResult.model}`);
        console.log(`🔑 Key used: ${aiResult.keyUsed}`);
        console.log(`🔄 Total attempts: ${aiResult.totalAttempts}`);
        console.log(`⏱️ Total processing time: ${processingTime}ms`);
        console.log(`📡 AI request time: ${aiResult.requestTime}ms`);
        
        res.json({
            success: true,
            analysis: aiResult.analysis,
            metadata: {
                model: aiResult.model,
                keyUsed: aiResult.keyUsed,
                totalAttempts: aiResult.totalAttempts,
                retryCount: aiResult.retryCount,
                processingTime: processingTime,
                aiRequestTime: aiResult.requestTime,
                timestamp: aiResult.timestamp,
                queryLength: query.length
            },
            systemInfo: {
                totalModels: AI_MODELS.length,
                totalKeys: API_KEYS.length,
                enhancedTimeouts: true,
                intelligentRetry: true,
                multiModelFallback: true
            }
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('\n❌ Legal analysis failed:', error.message);
        
        // Determine appropriate error message for user
        let userErrorMessage = 'AI analysis service temporarily unavailable. Please try again.';
        
        if (error.message.includes('All AI models and keys failed')) {
            if (error.message.includes('timeout')) {
                userErrorMessage = 'Request timeout - our AI is experiencing high load. Please try with a shorter query or try again in a few minutes.';
            } else if (error.message.includes('Rate limit') || error.message.includes('quota')) {
                userErrorMessage = 'API usage limits reached. Please try again in a few minutes or contact support.';
            } else {
                userErrorMessage = 'All AI services are temporarily overloaded. Please try again in 2-3 minutes.';
            }
        }
        
        res.status(500).json({
            success: false,
            error: userErrorMessage,
            technicalDetails: {
                processingTime: processingTime,
                totalModels: AI_MODELS.length,
                totalKeys: API_KEYS.length,
                timestamp: new Date().toISOString(),
                errorType: error.message.includes('timeout') ? 'TIMEOUT' : 
                          error.message.includes('quota') ? 'QUOTA_EXCEEDED' :
                          error.message.includes('network') ? 'NETWORK_ERROR' : 'UNKNOWN'
            }
        });
    }
});

// ✅ AUTHENTICATION API
app.post('/api/auth', (req, res) => {
    try {
        const { aadhaar, otp, action } = req.body;

        if (action === 'verify_aadhaar') {
            if (aadhaar && aadhaar.length === 12 && /^\d+$/.test(aadhaar)) {
                res.json({
                    success: true,
                    message: "OTP sent to your registered mobile number",
                    step: "otp_verification"
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: "Please enter a valid 12-digit Aadhaar number"
                });
            }
        } else if (action === 'verify_otp') {
            if (otp && otp.length === 6 && /^\d+$/.test(otp)) {
                res.json({
                    success: true,
                    message: "Authentication successful! Welcome to Vidhi Saarathi AI",
                    token: "auth_" + Date.now(),
                    user: {
                        id: "user_" + Date.now(),
                        verified: true
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: "Invalid OTP. Please enter the 6-digit OTP."
                });
            }
        } else {
            res.status(400).json({
                success: false,
                error: "Invalid action. Use 'verify_aadhaar' or 'verify_otp'"
            });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            success: false,
            error: "Authentication service temporarily unavailable"
        });
    }
});

// ✅ DASHBOARD API
app.get('/api/dashboard', (req, res) => {
    try {
        const dashboardData = {
            user: {
                name: "Legal Professional",
                type: "verified_lawyer"
            },
            analytics: {
                totalConsultations: 127,
                activeClients: 23,
                successRate: "98%"
            },
            recentActivity: [
                { action: "New consultation", time: "2 hours ago" },
                { action: "Case update", time: "4 hours ago" }
            ]
        };

        res.json({
            success: true,
            data: dashboardData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Dashboard service temporarily unavailable"
        });
    }
});

// ✅ ENHANCED HEALTH CHECK WITH DETAILED STATS
app.get('/health', (req, res) => {
    const keyStats = API_KEYS.map(key => ({
        name: key.name,
        usageCount: key.usageCount,
        successCount: key.successCount,
        errorCount: key.errorCount,
        successRate: key.usageCount > 0 ? `${((key.successCount / key.usageCount) * 100).toFixed(1)}%` : '0%',
        lastUsed: key.lastUsed ? new Date(key.lastUsed).toISOString() : 'Never',
        lastSuccess: key.lastSuccess ? new Date(key.lastSuccess).toISOString() : 'Never'
    }));

    res.json({
        status: "Vidhi Saarathi AI Backend is healthy",
        version: "4.3.1",
        features: {
            enhancedTimeouts: true,
            intelligentRetry: true,
            multiModelAI: `${AI_MODELS.length} models configured`,
            multiKeyRotation: `${API_KEYS.length} keys configured`,
            optimizedPrompts: true
        },
        keyUsageStats: keyStats,
        modelInfo: AI_MODELS.map(m => ({
            name: m.name,
            priority: m.priority,
            timeout: `${m.timeout/1000}s`
        })),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ✅ API QUOTA MONITORING ENDPOINT
app.get('/api/quota', async (req, res) => {
    try {
        const quotaChecks = await Promise.all(API_KEYS.map(async (key, index) => {
            try {
                // Quick quota check - list models endpoint
                const response = await fetchWithEnhancedTimeout(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${key.key}`,
                    { timeout: 10000 } // 10 second timeout for quota check
                );
                
                return {
                    keyName: key.name,
                    status: response.ok ? '✅ Active' : `❌ Error: ${response.status}`,
                    httpStatus: response.status,
                    usageStats: {
                        total: key.usageCount,
                        successful: key.successCount,
                        errors: key.errorCount,
                        successRate: key.usageCount > 0 ? `${((key.successCount / key.usageCount) * 100).toFixed(1)}%` : '0%'
                    },
                    lastActivity: {
                        lastUsed: key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never',
                        lastSuccess: key.lastSuccess ? new Date(key.lastSuccess).toLocaleString() : 'Never'
                    }
                };
            } catch (error) {
                return {
                    keyName: key.name,
                    status: `❌ Error: ${error.message}`,
                    httpStatus: 0,
                    usageStats: {
                        total: key.usageCount,
                        successful: key.successCount,
                        errors: key.errorCount,
                        successRate: '0%'
                    },
                    error: error.message
                };
            }
        }));
        
        res.json({
            quotaStatus: quotaChecks,
            summary: {
                totalKeys: API_KEYS.length,
                activeKeys: quotaChecks.filter(check => check.status.includes('Active')).length,
                totalRequests: API_KEYS.reduce((sum, key) => sum + key.usageCount, 0),
                totalSuccesses: API_KEYS.reduce((sum, key) => sum + key.successCount, 0),
                overallSuccessRate: (() => {
                    const total = API_KEYS.reduce((sum, key) => sum + key.usageCount, 0);
                    const success = API_KEYS.reduce((sum, key) => sum + key.successCount, 0);
                    return total > 0 ? `${((success / total) * 100).toFixed(1)}%` : '0%';
                })()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Quota check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ✅ DEBUG ENDPOINT FOR IP CHECKING
app.get('/debug/ip', async (req, res) => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        
        res.json({ 
            serverIP: data.ip,
            message: 'Current server public IP address',
            instructions: 'Add this IP to Google Cloud Console > API Keys > Your Key > IP restrictions if needed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({ 
            error: 'Could not fetch server IP',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ✅ SERVE FRONTEND PAGES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'results.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'auth.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html'));
});

// ✅ 404 HANDLER (MUST BE AT THE END)
app.all('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'API route not found',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
            'GET /health - Enhanced system health check',
            'GET /api/quota - API key quota monitoring',
            'POST /api/analyze - Legal analysis with enhanced timeout', 
            'POST /api/auth - Authentication system',
            'GET /api/dashboard - Dashboard data',
            'GET /debug/ip - Server IP information',
            'GET / - Landing page',
            'GET /results - Legal analysis interface',
            'GET /auth - Authentication page',
            'GET /dashboard - Professional dashboard'
        ]
    });
});

// ==================== LAWYER DIRECTORY ENDPOINTS ====================

// Get all lawyers
app.get('/api/lawyers', (req, res) => {
    try {
        const lawyersFile = path.join(__dirname, 'data', 'lawyers.json');
        
        if (!fs.existsSync(lawyersFile)) {
            return res.json({ success: true, lawyers: [], message: 'No lawyers available yet' });
        }
        
        const lawyers = JSON.parse(fs.readFileSync(lawyersFile, 'utf8'));
        res.json({ success: true, lawyers, count: lawyers.length });
    } catch (error) {
        console.error('Error fetching lawyers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lawyers' });
    }
});

// Get lawyers by specialization
app.get('/api/lawyers/specialization/:specialization', (req, res) => {
    try {
        const { specialization } = req.params;
        const lawyersFile = path.join(__dirname, 'data', 'lawyers.json');
        
        if (!fs.existsSync(lawyersFile)) {
            return res.json({ success: true, lawyers: [], message: 'No lawyers available yet' });
        }
        
        const allLawyers = JSON.parse(fs.readFileSync(lawyersFile, 'utf8'));
        
        // Case-insensitive matching and partial match
        const matchingLawyers = allLawyers.filter(lawyer => 
            lawyer.specialization.toLowerCase().includes(specialization.toLowerCase()) ||
            lawyer.expertise.some(exp => exp.toLowerCase().includes(specialization.toLowerCase()))
        );
        
        res.json({ 
            success: true, 
            lawyers: matchingLawyers, 
            count: matchingLawyers.length,
            specialization: specialization
        });
    } catch (error) {
        console.error('Error fetching lawyers by specialization:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lawyers' });
    }
});

// Get lawyer by ID
app.get('/api/lawyers/:id', (req, res) => {
    try {
        const { id } = req.params;
        const lawyersFile = path.join(__dirname, 'data', 'lawyers.json');
        
        if (!fs.existsSync(lawyersFile)) {
            return res.status(404).json({ success: false, error: 'Lawyer not found' });
        }
        
        const lawyers = JSON.parse(fs.readFileSync(lawyersFile, 'utf8'));
        const lawyer = lawyers.find(l => l.id === id);
        
        if (!lawyer) {
            return res.status(404).json({ success: false, error: 'Lawyer not found' });
        }
        
        res.json({ success: true, lawyer });
    } catch (error) {
        console.error('Error fetching lawyer:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch lawyer' });
    }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n🎉 ==========================================');
    console.log('🏛️  VIDHI SAARATHI AI BACKEND SERVER v4.3.1');
    console.log('🎉 ==========================================');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`🤖 Enhanced AI Models: ${AI_MODELS.length} with custom timeouts`);
    console.log(`   - ${AI_MODELS.map(m => `${m.name} (${m.timeout/1000}s)`).join(', ')}`);
    console.log(`🔑 API Keys: ${API_KEYS.length} with intelligent retry`);
    console.log('⚡ New Features:');
    console.log('   - Enhanced timeout handling (up to 3 minutes)');
    console.log('   - Intelligent retry with exponential backoff');
    console.log('   - Optimized prompts for better performance');
    console.log('   - Real-time quota monitoring');
    console.log('   - Advanced error handling and recovery');
    console.log('📡 Enhanced API Endpoints:');
    console.log('   POST /api/analyze - Legal Analysis (Enhanced)');
    console.log('   GET /health - System Health & Detailed Stats');
    console.log('   GET /api/quota - Real-time Quota Monitoring');
    console.log('   GET /debug/ip - IP Address Information');
    console.log('🎊 Ready to serve legal guidance with maximum reliability!');
    console.log('🎉 ==========================================\n');
});


