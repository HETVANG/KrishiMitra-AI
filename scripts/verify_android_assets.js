const fs = require('fs');
const path = require('path');

const assetsDir = 'frontend/android/app/src/main/assets/public/assets';
if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found at', assetsDir);
  process.exit(1);
}

const indexFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
if (!indexFile) {
  console.error('index-*.js bundle not found in', assetsDir);
  process.exit(1);
}

const bundlePath = path.join(assetsDir, indexFile);
console.log('Verifying Android bundle:', bundlePath);

const bundle = fs.readFileSync(bundlePath, 'utf8');
const locales = ['hi', 'gu', 'mr', 'pa', 'bn', 'ta', 'te', 'kn', 'ml', 'or', 'as', 'en'];

let allPassed = true;
locales.forEach(loc => {
  const json = require('../frontend/src/locales/' + loc + '.json');
  const sampleKey = json.referral ? json.referral.title : json.common.save;
  const inBundle = bundle.includes(sampleKey);
  if (!inBundle) allPassed = false;
  console.log(`Locale [${loc.padEnd(2)}]: present = ${inBundle} ("${sampleKey.slice(0, 30)}...")`);
});

const hasProdUrl = bundle.includes('https://krishimitra-ai-8ni7.onrender.com');
const hasVercel = bundle.includes('https://krishi-mitra-ai-henna.vercel.app');

console.log('\nProduction Backend URL present:', hasProdUrl);
console.log('Production Vercel URL present:', hasVercel);
console.log('All 12 locales verified:', allPassed);
