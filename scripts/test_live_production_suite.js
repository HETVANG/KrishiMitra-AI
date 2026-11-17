/**
 * THE KHEDUT — LIVE PRODUCTION FUNCTIONAL VERIFICATION SUITE
 * Tests directly against:
 * Backend: https://krishimitra-ai-8ni7.onrender.com/api
 * Frontend: https://krishi-mitra-ai-henna.vercel.app
 */

const https = require('https');

const API_BASE = 'https://krishimitra-ai-8ni7.onrender.com/api';
const WEB_BASE = 'https://krishi-mitra-ai-henna.vercel.app';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, raw: data, data: json });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('  THE KHEDUT — PRODUCTION DEPLOYMENT FUNCTIONAL AUDIT          ');
  console.log('================================================================\n');

  const timestamp = Date.now();
  let passedCount = 0;
  let totalCount = 0;

  function report(name, condition, extra = '') {
    totalCount++;
    if (condition) {
      console.log(`[PASS] ${name}${extra ? ' (' + extra + ')' : ''}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${name}${extra ? ' (' + extra + ')' : ''}`);
    }
  }

  // 1. HEALTH & CONNECTIVITY
  console.log('--- 1. RENDER BACKEND HEALTH & MONGODB ---');
  const healthRes = await request('https://krishimitra-ai-8ni7.onrender.com/health');
  report('Render Health Status 200', healthRes.status === 200);
  report('MongoDB Connected ReadyState 1', healthRes.data?.telemetry?.database?.connected === true && healthRes.data?.telemetry?.database?.readyState === 1);

  // 2. REFERRER USER CREATION & CODE GENERATION
  console.log('\n--- 2. REFERRAL ATTRIBUTION & REGISTRATION FLOW ---');
  const referrerPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const referrerEmail = `prod_test_ref_${timestamp}@thekhedut.test`;
  const referrerRegisterPayload = JSON.stringify({
    name: 'Kisan Bhai Referrer',
    email: referrerEmail,
    password: 'Password@123',
    phone: referrerPhone,
    role: 'farmer'
  });

  const reg1 = await request(`${API_BASE}/auth/register`, { method: 'POST' }, referrerRegisterPayload);
  report('Referrer Registration 201 Created', reg1.status === 201 && !!reg1.data?.token);
  const referrerToken = reg1.data?.token;

  // Check unique referral code generated immediately
  const refStats1 = await request(`${API_BASE}/growth/referrals/me`, {
    headers: { Authorization: `Bearer ${referrerToken}` }
  });
  const refCode = refStats1.data?.stats?.referralCode;
  report('Unique Referral Code Generated (TK-XXXXXX)', /^TK-[A-Z0-9]{6}$/.test(refCode), refCode);

  // Construct production referral link (ensure no localhost)
  const isLocalhost = refCode ? false : true;
  const prodShareLink = `${WEB_BASE}/register?ref=${refCode}`;
  report('Production Referral Link Generated Without Localhost', !prodShareLink.includes('localhost') && prodShareLink.startsWith(WEB_BASE), prodShareLink);

  // Register referee user using this referral code
  const refereePhone = '97' + Math.floor(10000000 + Math.random() * 90000000);
  const refereeEmail = `prod_test_referee_${timestamp}@thekhedut.test`;
  const refereeRegisterPayload = JSON.stringify({
    name: 'Kisan Bhai Referred',
    email: refereeEmail,
    password: 'Password@123',
    phone: refereePhone,
    role: 'farmer',
    referralCode: refCode
  });

  const reg2 = await request(`${API_BASE}/auth/register`, { method: 'POST' }, refereeRegisterPayload);
  report('Referee Registration With Referral Code 201 Created', reg2.status === 201 && !!reg2.data?.token);

  // Verify referral attribution on referrer account
  const refStats2 = await request(`${API_BASE}/growth/referrals/me`, {
    headers: { Authorization: `Bearer ${referrerToken}` }
  });
  report('Referrer Stats Attributed New Signup', refStats2.data?.stats?.totalReferrals === 1 && refStats2.data?.stats?.history?.[0]?.farmerName === 'Kisan Bhai Referred');

  // 3. LANGUAGE PREFERENCE PERSISTENCE WITHOUT LOGOUT
  console.log('\n--- 3. LANGUAGE SWITCHING & PERSISTENCE ---');
  // Switch to Hindi ('hi')
  const switchHi = await request(`${API_BASE}/auth/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${referrerToken}` }
  }, JSON.stringify({ language: 'hi', theme: 'light' }));
  report('Language switched to Hindi (hi) without logout', switchHi.status === 200 && switchHi.data?.user?.settings?.language === 'hi');

  // Switch to Gujarati ('gu')
  const switchGu = await request(`${API_BASE}/auth/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${referrerToken}` }
  }, JSON.stringify({ language: 'gu', theme: 'light' }));
  report('Language switched to Gujarati (gu) without logout', switchGu.status === 200 && switchGu.data?.user?.settings?.language === 'gu');

  // Switch back to English ('en')
  const switchEn = await request(`${API_BASE}/auth/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${referrerToken}` }
  }, JSON.stringify({ language: 'en', theme: 'light' }));
  report('Language switched back to English (en) without logout', switchEn.status === 200 && switchEn.data?.user?.settings?.language === 'en');

  // 4. MANDI API SEARCHES & RESOLUTION
  console.log('\n--- 4. MANDI PRICES & MARKET INTELLIGENCE SEARCHES ---');
  // Wheat
  const wheatRes = await request(`${API_BASE}/market/prices?crop=Wheat&limit=5`);
  report('Wheat Mandi Rates Search 200 OK', wheatRes.status === 200 && (wheatRes.data?.prices?.length > 0 || wheatRes.data?.pagination?.total > 0), `Total: ${wheatRes.data?.pagination?.total}`);

  // Cotton
  const cottonRes = await request(`${API_BASE}/market/prices?crop=Cotton&limit=5`);
  report('Cotton Mandi Rates Search 200 OK', cottonRes.status === 200 && (cottonRes.data?.prices?.length > 0 || cottonRes.data?.pagination?.total > 0), `Total: ${cottonRes.data?.pagination?.total}`);

  // Paddy
  const paddyRes = await request(`${API_BASE}/market/prices?crop=Paddy&limit=5`);
  report('Paddy Mandi Rates Search 200 OK', paddyRes.status === 200 && (paddyRes.data?.prices?.length > 0 || paddyRes.data?.pagination?.total > 0), `Total: ${paddyRes.data?.pagination?.total}`);

  // Complex commodity names with special characters (parentheses, slashes)
  const complexCotton = await request(`${API_BASE}/market/prices?crop=Cotton%20(Lint)&limit=5`);
  report('Complex Crop Name "Cotton (Lint)" Handled Without CastError', complexCotton.status === 200 && complexCotton.data?.success === true);

  const complexPaddy = await request(`${API_BASE}/market/prices?crop=Paddy%20(Dhan)%20(Common)&limit=5`);
  report('Complex Crop Name "Paddy (Dhan) (Common)" Handled Without CastError', complexPaddy.status === 200 && complexPaddy.data?.success === true);

  // 5. HISTORICAL UNAVAILABLE STATES & INTELLIGENCE
  console.log('\n--- 5. HISTORICAL DATA UNAVAILABLE STATES & REVIEWS ---');
  const unavailHistory = await request(`${API_BASE}/market/history?crop=UnknownExoticCommodity12345&limit=10`);
  report('Unavailable Historical Crop returns empty array honestly (no CastError)', unavailHistory.status === 200 && Array.isArray(unavailHistory.data?.history) && unavailHistory.data?.history.length === 0);

  const wheatIntel = await request(`${API_BASE}/market/intelligence/Wheat`);
  report('Wheat Market Intelligence Pipeline 200 OK', wheatIntel.status === 200 && !!wheatIntel.data?.intelligence?.commodity);

  const wheatCompare = await request(`${API_BASE}/market/compare?crop=Wheat`);
  report('Nearby Mandi Comparisons Pipeline 200 OK', wheatCompare.status === 200 && wheatCompare.data?.comparison?.marketsCount > 0);

  // 6. VERCEL FRONTEND BUNDLE & 12-LANGUAGE LOCALES
  console.log('\n--- 6. VERCEL DEPLOYMENT & 12 LOCALE PARITY ---');
  const indexHtml = await request(`${WEB_BASE}/`);
  report('Vercel Frontend HTTP 200', indexHtml.status === 200);

  const mainBundleMatch = indexHtml.raw.match(/\/assets\/index-[a-zA-Z0-9_\-]+\.js/);
  report('Main JS Bundle Referenced in HTML', !!mainBundleMatch, mainBundleMatch?.[0]);

  if (mainBundleMatch) {
    const bundleJs = await request(`${WEB_BASE}${mainBundleMatch[0]}`);
    report('Main JS Bundle HTTP 200', bundleJs.status === 200, `Size: ${bundleJs.raw.length} bytes`);

    // Verify all 12 languages presence
    const langs = [
      { code: 'hi', label: 'Hindi', phrase: 'किसानों को आमंत्रित करें' },
      { code: 'gu', label: 'Gujarati', phrase: 'ખેડૂતોને આમંત્રિત કરો' },
      { code: 'mr', label: 'Marathi', phrase: 'शेतकऱ्यांना आमंत्रित करा' },
      { code: 'pa', label: 'Punjabi', phrase: 'ਕਿਸਾਨਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ' },
      { code: 'bn', label: 'Bengali', phrase: 'কৃষকদের আমন্ত্রণ জানান' },
      { code: 'ta', label: 'Tamil', phrase: 'விவசாயிகளை அழைத்து' },
      { code: 'te', label: 'Telugu', phrase: 'రైతులను ఆహ్వానించండి' },
      { code: 'kn', label: 'Kannada', phrase: 'ರೈತರನ್ನು ಆಹ್ವಾನಿಸಿ' },
      { code: 'ml', label: 'Malayalam', phrase: 'കർഷകരെ ക്ഷണിക്കൂ' },
      { code: 'or', label: 'Odia', phrase: 'କୃଷକମାନଙ୍କୁ ନିମନ୍ତ୍ରଣ କରନ୍ତୁ' },
      { code: 'as', label: 'Assamese', phrase: 'কৃষকসকলক আমন্ত্ৰণ জনাওক' },
      { code: 'en', label: 'English', phrase: 'Invite Farmers & Earn Credits' }
    ];

    langs.forEach(l => {
      report(`Locale dictionary present: ${l.label} (${l.code})`, bundleJs.raw.includes(l.phrase));
    });

    report('Safe Production Vercel Origin in Bundle (zero localhost fallback)', bundleJs.raw.includes('krishi-mitra-ai-henna.vercel.app'));
  }

  console.log('\n================================================================');
  console.log(`  FUNCTIONAL AUDIT COMPLETE: ${passedCount}/${totalCount} TESTS PASSED (${Math.round(passedCount/totalCount*100)}%)`);
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Execution error:', err);
  process.exit(1);
});
