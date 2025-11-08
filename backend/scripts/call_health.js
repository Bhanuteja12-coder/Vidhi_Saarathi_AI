const http = require('http');
const fs = require('fs');
const outFile = require('path').join(__dirname, '..', 'test-output', 'health_response.json');

http.get('http://localhost:3000/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      fs.mkdirSync(require('path').join(__dirname, '..', 'test-output'), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(parsed, null, 2));
      console.log('WROTE', outFile);
    } catch (e) {
      console.error('Failed to parse or write response', e.message || e);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message || err);
});
