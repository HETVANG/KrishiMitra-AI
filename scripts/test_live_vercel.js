const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching Vercel homepage...');
  const index = await fetchUrl('https://krishi-mitra-ai-henna.vercel.app/');
  console.log('Status:', index.status);
  
  // Find main JS bundle
  const scripts = index.body.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/g);
  console.log('Main bundle matches:', scripts);

  if (scripts && scripts.length > 0) {
    const mainJsUrl = 'https://krishi-mitra-ai-henna.vercel.app' + scripts[0];
    console.log('Fetching main JS bundle from:', mainJsUrl);
    const bundle = await fetchUrl(mainJsUrl);
    console.log('Bundle status:', bundle.status, 'size:', bundle.body.length);

    // Check for our new translation strings in the bundle
    const checks = [
      { name: 'Hindi referral text ("किसानों को आमंत्रित करें")', key: 'किसानों को आमंत्रित करें' },
      { name: 'Gujarati referral text ("ખેડૂતોને આમંત્રિત કરો")', key: 'ખેડૂતોને આમંત્રિત કરો' },
      { name: 'Marathi referral text ("शेतकऱ्यांना आमंत्रित करा")', key: 'शेतकऱ्यांना आमंत्रित करा' },
      { name: 'Tamil referral text ("விவசாயிகளை அழைத்து")', key: 'விவசாயிகளை அழைத்து' },
      { name: 'Telugu referral text ("రైతులను ఆహ్వానించండి")', key: 'రైతులను ఆహ్వానించండి' },
      { name: 'Bengali referral text ("কৃষকদের আমন্ত্রণ জানান")', key: 'কৃষকদের আমন্ত্রণ জানান' },
      { name: 'Punjabi referral text ("ਕਿਸਾਨਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ")', key: 'ਕਿਸਾਨਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ' },
      { name: 'Kannada referral text ("ರೈತರನ್ನು ಆಹ್ವಾನಿಸಿ")', key: 'ರೈತರನ್ನು ಆಹ್ವಾನಿಸಿ' },
      { name: 'Malayalam referral text ("കർഷകരെ ക്ഷണിക്കൂ")', key: 'കർഷകരെ ക്ഷണിക്കൂ' },
      { name: 'Odia referral text ("କୃଷକମାନଙ୍କୁ ନିମନ୍ତ୍ରଣ କରନ୍ତୁ")', key: 'କୃଷକମାନଙ୍କୁ ନିମନ୍ତ୍ରଣ କରନ୍ତୁ' },
      { name: 'Assamese referral text ("কৃষকসকলক আমন্ত্ৰণ জনাওক")', key: 'কৃষকসকলক আমন্ত্ৰণ জনাওক' },
      { name: 'getProductionAppUrl / Vercel fallback URL', key: 'krishi-mitra-ai-henna.vercel.app' },
      { name: 'Brand Name THE KHEDUT', key: 'THE KHEDUT' }
    ];

    checks.forEach(c => {
      const found = bundle.body.includes(c.key);
      console.log(`[${found ? 'PASS' : 'FAIL'}] ${c.name}`);
    });
  }
}

run().catch(console.error);
