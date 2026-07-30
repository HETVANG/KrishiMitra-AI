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
  const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${apiKey}&format=json&limit=5&sort[Arrival_Date]=desc`;
  console.log(`\n--- 🧪 GOV MANDI API SORTING TEST ---`);
  console.log('Querying URL:', `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=REDACTED&format=json&limit=5&sort[Arrival_Date]=desc`);

  try {
    const res = await axios.get(url);
    console.log('✅ [HTTP 200] Successful Response!');
    console.log('Response Records returned count:', res.data.count);
    console.log('First Record sample:', res.data.records?.[0]);
    console.log('Second Record sample:', res.data.records?.[1]);
  } catch (err) {
    console.error('❌ API request failed:', err.response?.data || err.message);
  }
}

testLiveApi();
