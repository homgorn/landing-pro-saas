const fs = require('fs');
const path = require('path');

// Basic E2E script
async function main() {
  const imagePath = path.resolve(__dirname, '../trading.png');
  if (!fs.existsSync(imagePath)) {
    console.error('trading.png not found at root');
    process.exit(1);
  }

  const fileBlob = new Blob([fs.readFileSync(imagePath)], { type: 'image/png' });
  const form = new FormData();
  form.append('file', fileBlob, 'trading.png');
  form.append('businessName', 'E2E Test');
  form.append('niche', 'Trading automation');
  // Use faster, cheaper models for tests
  form.append('visionModel', 'gemini-3.1-flash');
  form.append('codeModel', 'claude-3.5-sonnet');
  form.append('searchEnabled', 'false');

  console.log('Sending POS to http://localhost:3000/api/generate ...');
  
  try {
    const res = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
       console.error('Status:', res.status, await res.text());
       return;
    }
    
    console.log('Stream Connected. Reading events:');
    
    // Read SSE
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      // naive parsing of SSE output
      const lines = text.split('\n');
      for (const line of lines) {
         if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            console.log(`[EVENT] Project: ${data.projectId || 'N/A'}`);
            if (data.stage) console.log(`[STAGE] ${data.stage} => ${data.status} | ${data.message}`);
            if (data.status === 'ready' || data.htmlLength) {
              console.log('✅ Generation pipeline Success!', data);
              return;
            }
         }
      }
    }

  } catch(e) {
    console.error('E2E Failed:', e);
  }
}

main();
