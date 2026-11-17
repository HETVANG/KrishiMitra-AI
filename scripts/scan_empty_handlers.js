const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      scanDir(full);
    } else if (f.name.endsWith('.tsx')) {
      const code = fs.readFileSync(full, 'utf8');
      const lines = code.split('\n');
      lines.forEach((l, idx) => {
        if (
          l.includes('onClick={() => {}}') ||
          l.includes('onClick={() => { }}') ||
          l.includes('href="#"') ||
          l.includes('to="#"') ||
          l.includes('onClick={() => alert(')
        ) {
          console.log(`${full}:${idx + 1} -> ${l.trim()}`);
        }
      });
    }
  }
}

scanDir('frontend/src');
