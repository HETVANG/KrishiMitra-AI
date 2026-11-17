const fs = require('fs');
const path = require('path');

const appCode = fs.readFileSync('frontend/src/App.tsx', 'utf8');
const routeMatches = [...appCode.matchAll(/path=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Registered Routes in App.tsx (' + routeMatches.length + '):', routeMatches);

const unmatched = [];

function findLinks(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findLinks(full);
    } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const links = [...content.matchAll(/to=["']([^"']+)["']/g)].map(m => m[1]);
      const navs = [...content.matchAll(/navigate\(["']([^"']+)["']/g)].map(m => m[1]);
      const hrefs = [...content.matchAll(/href=["'](\/[^"']+)["']/g)].map(m => m[1]);
      const all = [...links, ...navs, ...hrefs];
      all.forEach(target => {
        const clean = target.split('?')[0].split('#')[0];
        if (clean.startsWith('http') || !clean.startsWith('/')) return;
        const matched = routeMatches.some(r => {
          if (r === clean) return true;
          if (r === '*') return false;
          const rParts = r.split('/');
          const cParts = clean.split('/');
          if (rParts.length !== cParts.length) return false;
          return rParts.every((rp, i) => rp.startsWith(':') || rp === cParts[i]);
        });
        if (!matched && clean !== '/') {
          unmatched.push({ file: full, target });
        }
      });
    }
  }
}

findLinks('frontend/src');
console.log('\nUnmatched Links Found (' + unmatched.length + '):');
unmatched.forEach(u => console.log(`  ${u.file} -> "${u.target}"`));
