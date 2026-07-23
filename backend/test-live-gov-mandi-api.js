const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const dns = require('dns');
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (dnsErr) {}

const axios = require('axios');

async function testLiveApi() {
  const apiKey = process.env.MANDI_API_KEY;
  // Official Gov of India Agmarknet agricultural price resource ID
  const resourceId = '35985678-0d79-46b4-9ed6-6f13308a1d24';
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=5`;

  console.log('--- 🧪 GOV MANDI API E2E TEST ---');
  console.log('Querying URL:', `https://api.data.gov.in/resource/${resourceId}?api-key=REDACTED&format=json&limit=5`);

  try {
    const res = await axios.get(url);
    console.log('\n✅ [HTTP 200] Successful Response!');
    console.log('Response Keys:', Object.keys(res.data));
    console.log('Response Total Records count:', res.data.total);
    console.log('Response Records returned count:', res.data.count);
    console.log('First Record sample:', res.data.records?.[0]);
  } catch (err) {
    console.error('❌ API request failed:', err.response?.data || err.message);
  }
}

testLiveApi();
