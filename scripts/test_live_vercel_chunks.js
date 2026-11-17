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
  const index = await fetchUrl('https://krishi-mitra-ai-henna.vercel.app/');
  
  // Find all modulepreload or script tags
  const chunks = index.body.match(/\/assets\/[a-zA-Z0-9_\-]+\.js/g) || [];
  console.log('Preloaded chunks in index.html:', chunks);

  // Let's fetch the main JS to find lazy loaded chunks
  const mainJsUrl = 'https://krishi-mitra-ai-henna.vercel.app/assets/index-DK46HEmt.js';
  const mainJs = await fetchUrl(mainJsUrl);
  
  // Match lazy loaded MarketDashboard and Register chunks
  const marketChunkMatch = mainJs.body.match(/assets\/MarketDashboard-[a-zA-Z0-9_\-]+\.js/);
  const registerChunkMatch = mainJs.body.match(/assets\/Register-[a-zA-Z0-9_\-]+\.js/);
  const referralWidgetMatch = mainJs.body.match(/getProductionAppUrl/);

  console.log('MarketDashboard chunk match:', marketChunkMatch ? marketChunkMatch[0] : 'None');
  console.log('Register chunk match:', registerChunkMatch ? registerChunkMatch[0] : 'None');
  console.log('getProductionAppUrl found in main bundle:', !!referralWidgetMatch);

  if (marketChunkMatch) {
    const marketJs = await fetchUrl('https://krishi-mitra-ai-henna.vercel.app/' + marketChunkMatch[0]);
    console.log('MarketDashboard JS status:', marketJs.status, 'size:', marketJs.body.length);
    console.log('Has market.mandi_rates_title:', marketJs.body.includes('mandi_rates_title'));
    console.log('Has market.no_history_data:', marketJs.body.includes('no_history_data'));
    console.log('Has market.price_load_error:', marketJs.body.includes('price_load_error'));
  }

  if (registerChunkMatch) {
    const registerJs = await fetchUrl('https://krishi-mitra-ai-henna.vercel.app/' + registerChunkMatch[0]);
    console.log('Register JS status:', registerJs.status, 'size:', registerJs.body.length);
    console.log('Has pendingReferralCode:', registerJs.body.includes('pendingReferralCode'));
    console.log('Has referralCode payload:', registerJs.body.includes('referralCode'));
    console.log('Has auth.referral_code:', registerJs.body.includes('auth.referral_code'));
  }
}

run().catch(console.error);
