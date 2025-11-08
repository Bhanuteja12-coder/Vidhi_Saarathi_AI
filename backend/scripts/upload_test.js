require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET = process.env.SUPABASE_FIR_BUCKET || 'fir-uploads';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    const filePath = path.join(__dirname, '..', 'test-files', 'sample_fir.txt');
    const fileBuffer = fs.readFileSync(filePath);
    const filename = `test_upload_${Date.now()}_sample_fir.txt`;

    console.log('Uploading to bucket:', BUCKET, 'as', filename);

    const { data, error } = await supabase.storage.from(BUCKET).upload(filename, fileBuffer, {
      contentType: 'text/plain',
      upsert: false
    });

    if (error) {
      console.error('Upload error:', error);
      process.exit(1);
    }

    console.log('Upload success:', data);

    const publicRes = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    console.log('Public URL:', publicRes.data.publicUrl);

    // Also try creating a signed URL for 1 hour
    const signed = await supabase.storage.from(BUCKET).createSignedUrl(data.path, 60 * 60);
    console.log('Signed URL (1h):', signed.data?.signedUrl || signed.error);

    // Write result to file for reliable verification
    const outDir = path.join(__dirname, '..', 'test-output');
    try { if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true }); } catch(e){}
    const outFile = path.join(outDir, 'upload_result.json');
    const result = {
      success: true,
      data,
      publicUrl: publicRes.data.publicUrl,
      signedUrl: signed.data?.signedUrl
    };
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log('Wrote upload result to', outFile);

  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
