const http = require('http');

// Test different file types
const tests = [
  {
    name: 'MP4 Video (with custom name)',
    base64: Buffer.concat([
      Buffer.alloc(4, 0),
      Buffer.from('ftyp'),
      Buffer.alloc(100, 0xFF)
    ]).toString('base64'),
    customName: 'myvideo'
  },
  {
    name: 'PNG Image (with custom name)',
    base64: Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      Buffer.alloc(100, 0)
    ]).toString('base64'),
    customName: 'myimage'
  },
  {
    name: 'PDF Document (no custom name)',
    base64: Buffer.concat([
      Buffer.from('%PDF'),
      Buffer.alloc(100, 0)
    ]).toString('base64'),
    customName: null
  },
  {
    name: 'JPEG Image',
    base64: Buffer.concat([
      Buffer.from([0xFF, 0xD8, 0xFF]),
      Buffer.alloc(100, 0)
    ]).toString('base64'),
    customName: null
  }
];

let completed = 0;

console.log('=== Testing Auto MIME Type Detection ===\n');

tests.forEach((test, idx) => {
  const data = JSON.stringify({
    base64: test.base64,
    filename: test.customName
  });

  const options = {
    hostname: 'localhost',
    port: 3111,
    path: '/decode',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    const filename = res.headers['x-detected-filename'];
    const mimeType = res.headers['x-detected-mime-type'];
    
    console.log(`Test ${idx + 1}: ${test.name}`);
    console.log(`  Input name: ${test.customName || 'Auto-generated'}`);
    console.log(`  Output filename: ${filename}`);
    console.log(`  MIME Type: ${mimeType}`);
    console.log('');
    
    res.on('data', () => {});
    res.on('end', () => {
      completed++;
      if (completed === tests.length) {
        console.log('=== All tests passed! ===');
        process.exit(0);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`Error in test ${idx + 1}:`, err.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('Tests timed out!');
  process.exit(1);
}, 5000);
