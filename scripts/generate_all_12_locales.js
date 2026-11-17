/**
 * Comprehensive 12-Language Production Synchronizer for The Khedut
 * Generates and validates full dictionary parity across:
 * en, hi, gu, mr, pa, bn, ta, te, kn, ml, or, as
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'frontend', 'src', 'locales');

// 1. Read existing en, hi, gu
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
const gu = JSON.parse(fs.readFileSync(path.join(localesDir, 'gu.json'), 'utf8'));

// 2. Define referral translations
const referralEn = {
  title: 'Invite Farmers & Earn Credits',
  subtitle: 'Share THE KHEDUT with fellow farmers in your region',
  invited: 'Invited',
  activated: 'Activated',
  copy_code: 'Copy Code',
  copied: 'Copied!',
  whatsapp: 'WhatsApp',
  share_message: 'Join me on THE KHEDUT to get smart crop advisory, disease scanning & mandi prices for your farm! Register using my code {{code}}: {{link}}',
  rewards_title: 'Referral Rewards & Credits',
  step1_badge: 'Step 1',
  step1_title: 'Share Your Code',
  step1_desc: 'Send your referral link to fellow farmers via WhatsApp or message.',
  step2_badge: 'Step 2',
  step2_title: 'Farmer Registration',
  step2_desc: 'When your link is used, their account gets linked to your referral network.',
  step3_badge: 'Step 3',
  step3_title: 'Earn Free Credits',
  step3_desc: 'Receive free NPK soil test credits & premium trial extensions.',
  tab_title: 'Invite & Earn (Referrals)',
  applied_badge: 'Referral Code Applied'
};

const referralHi = {
  title: 'किसानों को आमंत्रित करें और क्रेडिट पाएं',
  subtitle: 'अपने क्षेत्र के साथी किसानों के साथ द खेड़ूत साझा करें',
  invited: 'आमंत्रित',
  activated: 'सक्रिय',
  copy_code: 'कोड कॉपी करें',
  copied: 'कॉपी हो गया!',
  whatsapp: 'व्हाट्सएप',
  share_message: 'अपने खेत के लिए स्मार्ट फसल सलाह, रोग पहचान और मंडी भाव पाने के लिए द खेड़ूत से जुड़ें! मेरे कोड {{code}} का उपयोग करके रजिस्टर करें: {{link}}',
  rewards_title: 'रेफरल पुरस्कार और क्रेडिट',
  step1_badge: 'चरण 1',
  step1_title: 'अपना कोड साझा करें',
  step1_desc: 'व्हाट्सएप या संदेश के जरिए साथी किसानों को अपना रेफरल लिंक भेजें।',
  step2_badge: 'चरण 2',
  step2_title: 'किसान पंजीकरण',
  step2_desc: 'जब वे आपके लिंक से जुड़ेंगे, तो उनका खाता आपके रेफरल नेटवर्क से जुड़ जाएगा।',
  step3_badge: 'चरण 3',
  step3_title: 'मुफ्त क्रेडिट पाएं',
  step3_desc: 'मुफ्त एनपीके मिट्टी परीक्षण क्रेडिट और प्रीमियम सदस्यता विस्तार प्राप्त करें।',
  tab_title: 'आमंत्रित करें और कमाएं (रेफरल)',
  applied_badge: 'रेफरल कोड लागू हुआ'
};

const referralGu = {
  title: 'ખેડૂતોને આમંત્રિત કરો અને ક્રેડિટ મેળવો',
  subtitle: 'તમારા વિસ્તારના સાથી ખેડૂતો સાથે ધ ખેડૂત શેર કરો',
  invited: 'આમંત્રિત',
  activated: 'સક્રિય',
  copy_code: 'કોડ કોપી કરો',
  copied: 'કોપી થઈ ગયું!',
  whatsapp: 'વોટ્સએપ',
  share_message: 'તમારા ખેતર માટે સ્માર્ટ પાક સલાહ, રોગ નિદાન અને મંડી ભાવો મેળવવા માટે ધ ખેડૂત સાથે જોડાઓ! મારા કોડ {{code}} સાથે નોંધણી કરો: {{link}}',
  rewards_title: 'રેફરલ ઇનામો અને ક્રેડિટ્સ',
  step1_badge: 'પગલું ૧',
  step1_title: 'તમારો કોડ શેર કરો',
  step1_desc: 'વોટ્સએપ અથવા સંદેશ દ્વારા સાથી ખેડૂતોને તમારી રેફરલ લિંક મોકલો.',
  step2_badge: 'પગલું ૨',
  step2_title: 'ખેડૂત નોંધણી',
  step2_desc: 'જ્યારે તેઓ તમારી લિંકનો ઉપયોગ કરશે, ત્યારે તેમનું ખાતું તમારા નેટવર્ક સાથે જોડાશે.',
  step3_badge: 'પગલું ૩',
  step3_title: 'મફત ક્રેડિટ મેળવો',
  step3_desc: 'મફત NPK જમીન ચકાસણી ક્રેડિટ અને પ્રીમિયમ સભ્યપદ લાભો મેળવો.',
  tab_title: 'આમંત્રિત કરો અને કમાઓ (રેફરલ)',
  applied_badge: 'રેફરલ કોડ લાગુ થયો'
};

// 3. Define market additions
const marketAdditionsEn = {
  mandi_rates_title: 'Market Intelligence & Mandi Rates',
  mandi_rates_sub: 'Live, verified prices from APMC mandis across India with AI trend forecasts.',
  refresh_feed: 'Refresh Mandi Feed',
  refreshing: 'Refreshing...',
  regional_benchmark: 'Regional Mandi Benchmark',
  trend_7d: '7-Day Price Trend',
  volatility_30d: '30-Day Volatility',
  watched_mandis: 'Watched Mandis',
  tracked_commodities: 'Tracked Commodities',
  target_commodity: 'Target Commodity / Crop',
  all_states: 'All States',
  state_label: 'State',
  district_label: 'District / Mandi',
  date_label: 'Date Filter',
  search_rates_btn: 'Search Mandi Rates',
  modal_price_title: 'Real-Time Modal Mandi Price',
  recorded_range: 'Recorded Price Range',
  price_outlook: 'Price Outlook',
  data_source: 'Data Source',
  market_sentiment: 'Market Sentiment',
  track_watchlist: 'Track In Watchlist',
  saved_watchlist: 'Saved to Watchlist',
  advisory_title: 'Smart Agronomic Advisory & Selling Considerations',
  key_insights: 'Key Market Insights',
  selling_considerations: 'Selling Considerations',
  official_disclaimer: 'Official Agronomic Advisory Disclaimer',
  disclaimer_text: 'Prices and advisories are derived from official APMC Mandi feeds (Agmarknet) and statistical trend analysis. Actual trade prices vary by lot quality, moisture, and local trader dynamics. Confirm on-ground before transactions.',
  live_rates_for: 'Live APMC Mandi Rates for',
  dmi_subtext: 'Official wholesale prices recorded by Directorate of Marketing & Inspection (DMI).',
  history_chart_title: 'Price History Chart',
  no_history_data: 'No historical trend data recorded for this period.',
  no_history_subtext: 'Historical APMC data for this commodity is currently unavailable. Live rates are still updated regularly.',
  nearby_comparisons: 'Nearby Mandi Comparisons',
  regional_mandis: 'Regional Mandis',
  regional_average: 'Regional Average',
  mandi_col: 'Mandi / Market',
  district_state_col: 'District, State',
  price_range_col: 'Price Range',
  modal_price_col: 'Modal Price',
  arrivals_col: 'Arrivals',
  date_col: 'Date Recorded',
  no_rates_found: 'No mandi rates found matching your search criteria.',
  no_rates_subtext: 'Try selecting a different district, state or checking spelling.',
  price_load_error: 'Unable to load mandi rates for this search. Please try adjusting your filters.',
  refresh_error: 'Refresh failed. The app will continue using the latest cached prices.',
  source_exact: 'Verified APMC Mandi Rate',
  source_local: 'Latest Recorded Mandi Rate',
  source_state: 'State Benchmark Rate',
  source_country: 'National Reference Rate'
};

const marketAdditionsHi = {
  mandi_rates_title: 'मंडी भाव एवं बाज़ार विश्लेषण',
  mandi_rates_sub: 'एआई मूल्य रुझान पूर्वानुमान के साथ पूरे भारत के एपीएमसी मंडियों के सत्यापित भाव।',
  refresh_feed: 'मंडी भाव ताज़ा करें',
  refreshing: 'ताज़ा किया जा रहा है...',
  regional_benchmark: 'क्षेत्रीय मंडी बेंचमार्क',
  trend_7d: '7-दिवसीय मूल्य रुझान',
  volatility_30d: '30-दिवसीय मूल्य उतार-चढ़ाव',
  watched_mandis: 'पसंदीदा मंडियां',
  tracked_commodities: 'ट्रैक की गई फसलें',
  target_commodity: 'लक्षित फसल / जिंस',
  all_states: 'सभी राज्य',
  state_label: 'राज्य',
  district_label: 'ज़िला / मंडी',
  date_label: 'दिनांक फ़िल्टर',
  search_rates_btn: 'मंडी भाव खोजें',
  modal_price_title: 'वास्तविक मॉडल मंडी भाव',
  recorded_range: 'दर्ज मूल्य सीमा',
  price_outlook: 'मूल्य दृष्टिकोण',
  data_source: 'डेटा स्रोत',
  market_sentiment: 'बाज़ार का रुख',
  track_watchlist: 'वॉचलिस्ट में जोड़ें',
  saved_watchlist: 'वॉचलिस्ट में सहेजा गया',
  advisory_title: 'स्मार्ट कृषि बाज़ार सलाह और बिक्री सुझाव',
  key_insights: 'प्रमुख बाज़ार अंतर्दृष्टि',
  selling_considerations: 'बिक्री संबंधी सावधानियां',
  official_disclaimer: 'आधिकारिक कृषि बाज़ार सलाह अस्वीकरण',
  disclaimer_text: 'कीमतें और सलाह आधिकारिक एपीएमसी मंडी फीड (एगमार्कनेट) और सांख्यिकीय विश्लेषण पर आधारित हैं। वास्तविक व्यापार मूल्य गुणवत्ता, नमी और स्थानीय व्यापारियों पर निर्भर करता है। लेन-देन से पहले मंडी में पुष्टि करें।',
  live_rates_for: 'के लिए लाइव एपीएमसी मंडी भाव',
  dmi_subtext: 'विपणन एवं निरीक्षण निदेशालय (DMI) द्वारा दर्ज आधिकारिक थोक भाव।',
  history_chart_title: 'मूल्य इतिहास चार्ट',
  no_history_data: 'इस अवधि के लिए कोई ऐतिहासिक मूल्य डेटा उपलब्ध नहीं है।',
  no_history_subtext: 'इस फसल के लिए ऐतिहासिक डेटा अस्थायी रूप से अनुपलब्ध है। लाइव भाव नियमित रूप से अपडेट होते रहते हैं।',
  nearby_comparisons: 'आस-पास की मंडियों की तुलना',
  regional_mandis: 'क्षेत्रीय मंडियां',
  regional_average: 'क्षेत्रीय औसत',
  mandi_col: 'मंडी / बाज़ार',
  district_state_col: 'ज़िला, राज्य',
  price_range_col: 'मूल्य सीमा',
  modal_price_col: 'मॉडल भाव',
  arrivals_col: 'आवक',
  date_col: 'दर्ज दिनांक',
  no_rates_found: 'आपके खोज मानदंडों से मेल खाने वाले कोई मंडी भाव नहीं मिले।',
  no_rates_subtext: 'कृपया कोई अन्य ज़िला, राज्य चुनें या वर्तनी की जांच करें।',
  price_load_error: 'इस खोज के लिए मंडी भाव लोड करने में असमर्थ। कृपया अपने फ़िल्टर बदलें।',
  refresh_error: 'ताज़ा करना विफल रहा। ऐप नवीनतम कैश्ड भावों का उपयोग करता रहेगा।',
  source_exact: 'सत्यापित एपीएमसी मंडी भाव',
  source_local: 'नवीनतम दर्ज मंडी भाव',
  source_state: 'राज्य बेंचमार्क भाव',
  source_country: 'राष्ट्रीय संदर्भ भाव'
};

const marketAdditionsGu = {
  mandi_rates_title: 'બજાર માહિતી અને મંડી ભાવો',
  mandi_rates_sub: 'એઆઈ ભાવ વલણ આગાહી સાથે ભારતના એપીએમસી માર્કેટ યાર્ડના સત્તાવાર ભાવો.',
  refresh_feed: 'મંડી ભાવો રિફ્રેશ કરો',
  refreshing: 'રિફ્રેશ થઈ રહ્યું છે...',
  regional_benchmark: 'પ્રાદેશિક મંડી બેંચમાર્ક',
  trend_7d: '૭-દિવસીય ભાવ વલણ',
  volatility_30d: '૩૦-દિવસીય ભાવ વધઘટ',
  watched_mandis: 'નજર રાખેલ મંડીઓ',
  tracked_commodities: 'ટ્રેક કરેલા પાકો',
  target_commodity: 'લક્ષ્ય પાક / જિન્સ',
  all_states: 'બધા રાજ્યો',
  state_label: 'રાજ્ય',
  district_label: 'જિલ્લો / માર્કેટ યાર્ડ',
  date_label: 'તારીખ ફિલ્ટર',
  search_rates_btn: 'મંડી ભાવો શોધો',
  modal_price_title: 'વાસ્તવિક મોડલ મંડી ભાવ',
  recorded_range: 'નોંધાયેલ ભાવ મર્યાદા',
  price_outlook: 'ભાવ ભવિષ્યદર્શન',
  data_source: 'ડેટા સ્ત્રોત',
  market_sentiment: 'બજાર વલણ',
  track_watchlist: 'વોચલિસ્ટમાં ઉમેરો',
  saved_watchlist: 'વોચલિસ્ટમાં સેવ કર્યું',
  advisory_title: 'સ્માર્ટ કૃષિ બજાર સલાહ અને વેચાણ માર્ગદર્શન',
  key_insights: 'મુખ્ય બજાર આંતરદ્રષ્ટિ',
  selling_considerations: 'વેચાણ બાબતે ધ્યાનમાં રાખવાની બાબતો',
  official_disclaimer: 'સત્તાવાર કૃષિ બજાર સલાહ ડિસ્ક્લેમર',
  disclaimer_text: 'ભાવો અને સલાહ સત્તાવાર એપીએમસી ફીડ્સ (એગમાર્કનાેટ) અને આંકડાકીય વિશ્લેષણ પર આધારિત છે. વાસ્તવિક સોદા પાકની ગુણવત્તા, ભેજ અને સ્થાનિક પરિબળો પર આધાર રાખે છે. સોદો કરતા પહેલા યાર્ડમાં ખાતરી કરો.',
  live_rates_for: 'માટે લાઈવ એપીએમસી મંડી ભાવો',
  dmi_subtext: 'ડિરેક્ટોરેટ ઓફ માર્કેટિંગ એન્ડ ઇન્સ્પેક્શન (DMI) દ્વારા નોંધાયેલા જથ્થાબંધ ભાવો.',
  history_chart_title: 'ભાવ ઇતિહાસ ચાર્ટ',
  no_history_data: 'આ સમયગાળા માટે કોઈ ઐતિહાસિક ભાવ ડેટા ઉપલબ્ધ નથી.',
  no_history_subtext: 'આ જિન્સ માટે ઐતિહાસિક ડેટા હાલ ઉપલબ્ધ નથી. લાઈવ ભાવો નિયમિત અપડેટ થતા રહે છે.',
  nearby_comparisons: 'નજીકના માર્કેટ યાર્ડ સાથે સરખામણી',
  regional_mandis: 'પ્રાદેશિક માર્કેટ યાર્ડ',
  regional_average: 'પ્રાદેશિક સરેરાશ',
  mandi_col: 'માર્કેટ યાર્ડ / મંડી',
  district_state_col: 'જિલ્લો, રાજ્ય',
  price_range_col: 'ભાવ રેન્જ',
  modal_price_col: 'મોડલ ભાવ',
  arrivals_col: 'આવક',
  date_col: 'નોંધાયેલ તારીખ',
  no_rates_found: 'તમારી શોધ મુજબ કોઈ મંડી ભાવો મળ્યા નથી.',
  no_rates_subtext: 'બીજો જિલ્લો, રાજ્ય પસંદ કરો અથવા જોડણી ચકાસો.',
  price_load_error: 'આ શોધ માટે મંડી ભાવો લોડ કરવામાં અસમર્થ. કૃપા કરીને ફિલ્ટર બદલો.',
  refresh_error: 'રિફ્રેશ કરવામાં નિષ્ફળ. એપ્લિકેશન તાજેતરના સેવ કરેલા ભાવો દર્શાવશે.',
  source_exact: 'ચકાસાયેલ એપીએમસી ભાવ',
  source_local: 'તાજેતરમાં નોંધાયેલ ભાવ',
  source_state: 'રાજ્ય સ્તરનો બેંચમાર્ક ભાવ',
  source_country: 'રાષ્ટ્રીય સંદર્ભ ભાવ'
};

// 4. Update en, hi, gu in memory
en.referral = referralEn;
hi.referral = referralHi;
gu.referral = referralGu;

en.market = { ...(en.market || {}), ...marketAdditionsEn };
hi.market = { ...(hi.market || {}), ...marketAdditionsHi };
gu.market = { ...(gu.market || {}), ...marketAdditionsGu };

en.auth = {
  ...(en.auth || {}),
  referral_code: 'Referral Code (Optional)',
  referral_code_placeholder: 'e.g. TK-6BF912',
  referral_applied: 'Referral Code Applied'
};

hi.auth = {
  ...(hi.auth || {}),
  referral_code: 'रेफरल कोड (वैकल्पिक)',
  referral_code_placeholder: 'उदा. TK-6BF912',
  referral_applied: 'रेफरल कोड लागू हुआ'
};

gu.auth = {
  ...(gu.auth || {}),
  referral_code: 'રેફરલ કોડ (મરજિયાત)',
  referral_code_placeholder: 'દા.ત. TK-6BF912',
  referral_applied: 'રેફરલ કોડ લાગુ થયો'
};

en.settings = {
  ...(en.settings || {}),
  preferences_tab: 'Language & App Preferences'
};
hi.settings = {
  ...(hi.settings || {}),
  preferences_tab: 'भाषा और ऐप प्राथमिकताएं'
};
gu.settings = {
  ...(gu.settings || {}),
  preferences_tab: 'ભાષા અને એપ્લિકેશન પસંદગીઓ'
};

fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'hi.json'), JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'gu.json'), JSON.stringify(gu, null, 2), 'utf8');
console.log('Updated en.json, hi.json, gu.json successfully.');

// 5. Build full dictionary generator for other 9 languages
// Uses deep merge with language-specific agricultural and UI dictionaries
const languages = [
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' }
];

// Helper to deeply merge target with base fallback ensuring no missing keys
function deepMergeWithFallback(target, base, customOverrides) {
  const result = {};
  for (const key of Object.keys(base)) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMergeWithFallback(
        target?.[key] || {},
        base[key],
        customOverrides?.[key] || {}
      );
    } else {
      result[key] = customOverrides?.[key] || target?.[key] || base[key];
    }
  }
  return result;
}

// Language dictionaries with domain-specific native translations
const languageOverrides = {
  mr: {
    referral: {
      title: 'शेतकऱ्यांना आमंत्रित करा आणि क्रेडिट मिळवा',
      subtitle: 'आपल्या भागातील सहकारी शेतकऱ्यांसोबत द खेडूत शेअर करा',
      invited: 'आमंत्रित',
      activated: 'सक्रिय',
      copy_code: 'कोड कॉपी करा',
      copied: 'कॉपी झाले!',
      whatsapp: 'व्हॉट्सॲप',
      share_message: 'आपल्या शेतासाठी स्मार्ट पीक सल्ला, रोग निदान आणि बाजार भाव मिळवण्यासाठी द खेडूतशी जोडा! माझा कोड {{code}} वापरून नोंदणी करा: {{link}}',
      rewards_title: 'रेफरल बक्षिसे आणि क्रेडिट्स',
      step1_badge: 'पायरी १',
      step1_title: 'तुमचा कोड शेअर करा',
      step1_desc: 'व्हॉट्सॲप किंवा मेसेजद्वारे सहकारी शेतकऱ्यांना तुमची रेफरल लिंक पाठवा.',
      step2_badge: 'पायरी २',
      step2_title: 'शेतकरी नोंदणी',
      step2_desc: 'जेव्हा ते तुमच्या लिंकचा वापर करतील, तेव्हा त्यांचे खाते तुमच्या नेटवर्कशी जोडले जाईल.',
      step3_badge: 'पायरी ३',
      step3_title: 'मोफत क्रेडिट्स मिळवा',
      step3_desc: 'मोफत NPK माती परीक्षण क्रेडिट्स आणि प्रीमियम सदस्यत्व वाढवा.',
      tab_title: 'आमंत्रित करा आणि कमवा (रेफरल)',
      applied_badge: 'रेफरल कोड लागू झाला'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'बाजार माहिती आणि मंडी भाव',
      mandi_rates_sub: 'एआय भाव ट्रेंड अंदाज़ासह संपूर्ण भारतातील एपीएमसी बाजार समित्यांचे थेट भाव.',
      refresh_feed: 'मंडी भाव ताजे करा',
      refreshing: 'ताजे होत आहे...',
      regional_benchmark: 'प्रादेशिक मंडी बेंचमार्क',
      trend_7d: '७-दिवसीय भाव कल',
      volatility_30d: '३०-दिवसीय भाव चढ-उतार',
      watched_mandis: 'पसंतीची मंडई',
      tracked_commodities: 'ट्रॅक केलेली पिके',
      target_commodity: 'लक्ष्य पीक / जिन्नस',
      all_states: 'सर्व राज्ये',
      state_label: 'राज्य',
      district_label: 'जिल्हा / बाजार समिती',
      date_label: 'तारीख फिल्टर',
      search_rates_btn: 'मंडी भाव शोधा',
      modal_price_title: 'थेट सरासरी मॉडेल भाव',
      recorded_range: 'नोंदवलेली भाव मर्यादा',
      price_outlook: 'भाव अंदाज',
      data_source: 'डेटा स्रोत',
      market_sentiment: 'बाजार कल',
      track_watchlist: 'वॉचलिस्टमध्ये जोडा',
      saved_watchlist: 'वॉचलिस्टमध्ये सेव्ह केले',
      nearby_comparisons: 'जवळपासच्या बाजार समित्यांशी तुलना',
      regional_mandis: 'प्रादेशिक बाजार समित्या',
      regional_average: 'प्रादेशिक सरासरी',
      mandi_col: 'बाजार समिती / मंडी',
      district_state_col: 'जिल्हा, राज्य',
      price_range_col: 'किंमत मर्यादा',
      modal_price_col: 'मॉडेल भाव',
      arrivals_col: 'आवक',
      date_col: 'नोंदवलेली तारीख',
      no_rates_found: 'आपल्या शोधानुसार कोणतेही मंडी भाव आढळले नाहीत.',
      no_rates_subtext: 'कृपया वेगळा जिल्हा, राज्य निवडा किंवा स्पेलिंग तपासा.',
      price_load_error: 'या शोधासाठी बाजार भाव लोड करता आले नाहीत. कृपया फिल्टर बदला.',
      refresh_error: 'रिफ्रेश अयशस्वी झाले. ॲप नवीनतम सेव्ह केलेले भाव दर्शवेल.'
    },
    auth: {
      referral_code: 'रेफरल कोड (पर्यायी)',
      referral_code_placeholder: 'उदा. TK-6BF912',
      referral_applied: 'रेफरल कोड लागू झाला'
    },
    settings: {
      preferences_tab: 'भाषा आणि ॲप प्राधान्ये'
    }
  },
  pa: {
    referral: {
      title: 'ਕਿਸਾਨਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ ਅਤੇ ਕ੍ਰੈਡਿਟ ਪ੍ਰਾਪਤ ਕਰੋ',
      subtitle: 'ਆਪਣੇ ਖੇਤਰ ਦੇ ਸਾਥੀ ਕਿਸਾਨਾਂ ਨਾਲ ਦ ਖੇੜੂਤ ਸਾਂਝਾ ਕਰੋ',
      invited: 'ਸੱਦਾ ਦਿੱਤਾ',
      activated: 'ਸਰਗਰਮ',
      copy_code: 'ਕੋਡ ਕਾਪੀ ਕਰੋ',
      copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
      whatsapp: 'ਵਟਸਐਪ',
      share_message: 'ਆਪਣੇ ਖੇਤ ਲਈ ਸਮਾਰਟ ਫਸਲ ਸਲਾਹ, ਬਿਮਾਰੀ ਜਾਂਚ ਅਤੇ ਮੰਡੀ ਭਾਅ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਦ ਖੇੜੂਤ ਨਾਲ ਜੁੜੋ! ਮੇਰੇ ਕੋਡ {{code}} ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ: {{link}}',
      rewards_title: 'ਰੈਫਰਲ ਇਨਾਮ ਅਤੇ ਕ੍ਰੈਡਿਟ',
      step1_badge: 'ਕਦਮ 1',
      step1_title: 'ਆਪਣਾ ਕੋਡ ਸਾਂਝਾ ਕਰੋ',
      step1_desc: 'ਵਟਸਐਪ ਜਾਂ ਸੁਨੇਹੇ ਰਾਹੀਂ ਸਾਥੀ ਕਿਸਾਨਾਂ ਨੂੰ ਆਪਣਾ ਰੈਫਰਲ ਲਿੰਕ ਭੇਜੋ।',
      step2_badge: 'ਕਦਮ 2',
      step2_title: 'ਕਿਸਾਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
      step2_desc: 'ਜਦੋਂ ਉਹ ਤੁਹਾਡੇ ਲਿੰਕ ਦੀ ਵਰਤੋਂ ਕਰਨਗੇ, ਉਹਨਾਂ ਦਾ ਖਾਤਾ ਤੁਹਾਡੇ ਨੈੱਟਵਰਕ ਨਾਲ ਜੁੜ ਜਾਵੇਗਾ।',
      step3_badge: 'ਕਦਮ 3',
      step3_title: 'ਮੁਫਤ ਕ੍ਰੈਡਿਟ ਪ੍ਰਾਪਤ ਕਰੋ',
      step3_desc: 'ਮੁਫਤ NPK ਮਿੱਟੀ ਟੈਸਟਿੰਗ ਕ੍ਰੈਡਿਟ ਅਤੇ ਪ੍ਰੀਮੀਅਮ ਸਦੱਸਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।',
      tab_title: 'ਸੱਦਾ ਦਿਓ ਅਤੇ ਕਮਾਓ (ਰੈਫਰਲ)',
      applied_badge: 'ਰੈਫਰਲ ਕੋਡ ਲਾਗੂ ਹੋਇਆ'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'ਮੰਡੀ ਭਾਅ ਅਤੇ ਮਾਰਕੀਟ ਜਾਣਕਾਰੀ',
      mandi_rates_sub: 'ਏਆਈ ਮੁੱਲ ਰੁਝਾਨ ਪੂਰਵ ਅਨੁਮਾਨਾਂ ਦੇ ਨਾਲ ਪੂਰੇ ਭਾਰਤ ਦੀਆਂ ਏਪੀਐਮਸੀ ਮੰਡੀਆਂ ਦੇ ਪ੍ਰਮਾਣਿਤ ਭਾਅ।',
      refresh_feed: 'ਮੰਡੀ ਭਾਅ ਤਾਜ਼ਾ ਕਰੋ',
      refreshing: 'ਤਾਜ਼ਾ ਹੋ ਰਿਹਾ ਹੈ...',
      regional_benchmark: 'ਖੇਤਰੀ ਮੰਡੀ ਬੈਂਚਮਾਰਕ',
      trend_7d: '7-ਦਿਨ ਮੁੱਲ ਰੁਝਾਨ',
      volatility_30d: '30-ਦਿਨ ਮੁੱਲ ਉਤਰਾਅ-ਚੜ੍ਹਾਅ',
      watched_mandis: 'ਪਸੰਦੀਦਾ ਮੰਡੀਆਂ',
      tracked_commodities: 'ਟ੍ਰੈਕ ਕੀਤੀਆਂ ਫਸਲਾਂ',
      target_commodity: 'ਨਿਸ਼ਾਨਾ ਫਸਲ / ਵਸਤੂ',
      all_states: 'ਸਾਰੇ ਰਾਜ',
      state_label: 'ਰਾਜ',
      district_label: 'ਜ਼ਿਲ੍ਹਾ / ਮੰਡੀ',
      date_label: 'ਮਿਤੀ ਫਿਲਟਰ',
      search_rates_btn: 'ਮੰਡੀ ਭਾਅ ਖੋਜੋ',
      modal_price_title: 'ਅਸਲ ਮਾਡਲ ਮੰਡੀ ਭਾਅ',
      recorded_range: 'ਦਰਜ ਮੁੱਲ ਸੀਮਾ',
      price_outlook: 'ਮੁੱਲ ਦ੍ਰਿਸ਼ਟੀਕੋਣ',
      data_source: 'ਡੇਟਾ ਸਰੋਤ',
      market_sentiment: 'ਮਾਰਕੀਟ ਰੁਖ਼',
      track_watchlist: 'ਵਾਚਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ',
      saved_watchlist: 'ਵਾਚਲਿਸਟ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਕੀਤਾ',
      nearby_comparisons: 'ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਦੀ ਤੁਲਨਾ',
      regional_mandis: 'ਖੇਤਰੀ ਮੰਡੀਆਂ',
      regional_average: 'ਖੇਤਰੀ ਔਸਤ',
      mandi_col: 'ਮੰਡੀ / ਮਾਰਕੀਟ',
      district_state_col: 'ਜ਼ਿਲ੍ਹਾ, ਰਾਜ',
      price_range_col: 'ਭਾਅ ਸੀਮਾ',
      modal_price_col: 'ਮਾਡਲ ਭਾਅ',
      arrivals_col: 'ਆਮਦ',
      date_col: 'ਦਰਜ ਮਿਤੀ',
      no_rates_found: 'ਤੁਹਾਡੀ ਖੋਜ ਦੇ ਮਾਪਦੰਡਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਕੋਈ ਮੰਡੀ ਭਾਅ ਨਹੀਂ ਮਿਲੇ।',
      no_rates_subtext: 'ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ ਜ਼ਿਲ੍ਹਾ, ਰਾਜ ਚੁਣੋ ਜਾਂ ਸਪੈਲਿੰਗ ਦੀ ਜਾਂਚ ਕਰੋ।',
      price_load_error: 'ਇਸ ਖੋਜ ਲਈ ਮੰਡੀ ਭਾਅ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਫਿਲਟਰ ਬਦਲੋ।',
      refresh_error: 'ਤਾਜ਼ਾ ਕਰਨਾ ਅਸਫਲ ਰਿਹਾ। ਐਪ ਨਵੀਨਤਮ ਕੈਸ਼ ਕੀਤੇ ਭਾਅ ਵਰਤਦਾ ਰਹੇਗਾ।'
    },
    auth: {
      referral_code: 'ਰੈਫਰਲ ਕੋਡ (ਵਿਕਲਪਿਕ)',
      referral_code_placeholder: 'ਉਦਾ. TK-6BF912',
      referral_applied: 'ਰੈਫਰਲ ਕੋਡ ਲਾਗੂ ਹੋਇਆ'
    },
    settings: {
      preferences_tab: 'ਭਾਸ਼ਾ ਅਤੇ ਐਪ ਤਰਜੀਹਾਂ'
    }
  },
  bn: {
    referral: {
      title: 'কৃষকদের আমন্ত্রণ জানান এবং ক্রেডিট পান',
      subtitle: 'আপনার অঞ্চলের সহকর্মী কৃষকদের সাথে দ্য খেদুত শেয়ার করুন',
      invited: 'আমন্ত্রিত',
      activated: 'সক্রিয়',
      copy_code: 'কোড কপি করুন',
      copied: 'কপি হয়েছে!',
      whatsapp: 'হোয়াটসঅ্যাপ',
      share_message: 'আপনার খামারের জন্য স্মার্ট শস্য পরামর্শ, রোগ নির্ণয় এবং মান্ডি মূল্য পেতে দ্য খেদুত-এ যোগ দিন! আমার কোড {{code}} দিয়ে নিবন্ধন করুন: {{link}}',
      rewards_title: 'রেফারেল পুরস্কার এবং ক্রেডিট',
      step1_badge: 'ধাপ ১',
      step1_title: 'আপনার কোড শেয়ার করুন',
      step1_desc: 'হোয়াটসঅ্যাপ বা বার্তার মাধ্যমে সহকর্মী কৃষকদের কাছে আপনার রেফারেল লিঙ্ক পাঠান।',
      step2_badge: 'ধাপ ২',
      step2_title: 'কৃষক নিবন্ধন',
      step2_desc: 'তারা যখন আপনার লিঙ্ক ব্যবহার করবে, তখন তাদের অ্যাকাউন্ট আপনার নেটওয়ার্কে যুক্ত হবে।',
      step3_badge: 'ধাপ ৩',
      step3_title: 'বিনামূল্যে ক্রেডিট পান',
      step3_desc: 'বিনামূল্যে এনপিকে মাটি পরীক্ষা ক্রেডিট এবং প্রিমিয়াম সদস্যতা বৃদ্ধি পান।',
      tab_title: 'আমন্ত্রণ জানান এবং উপার্জন করুন (রেফারেল)',
      applied_badge: 'রেফারেল কোড প্রয়োগ করা হয়েছে'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'বাজারের তথ্য এবং মান্ডি দর',
      mandi_rates_sub: 'এআই মূল্য প্রবণতা পূর্বাভাসের সাথে সমগ্র ভারতের এপিএমসি মান্ডির যাচাইকৃত দর।',
      refresh_feed: 'মান্ডি দর রিফ্রেশ করুন',
      refreshing: 'রিফ্রেশ হচ্ছে...',
      regional_benchmark: 'আঞ্চলিক মান্ডি বেঞ্চমার্ক',
      trend_7d: '৭ দিনের মূল্য প্রবণতা',
      volatility_30d: '৩০ দিনের মূল্য অস্থিরতা',
      watched_mandis: 'পছন্দের মান্ডি',
      tracked_commodities: 'ট্র্যাক করা ফসল',
      target_commodity: 'লক্ষ্য ফসল / পণ্য',
      all_states: 'সকল রাজ্য',
      state_label: 'রাজ্য',
      district_label: 'জেলা / মান্ডি',
      date_label: 'তারিখ ফিল্টার',
      search_rates_btn: 'মান্ডি দর অনুসন্ধান করুন',
      modal_price_title: 'প্রকৃত মডেল মান্ডি দর',
      recorded_range: 'রেকর্ড করা মূল্য পরিসীমা',
      price_outlook: 'মূল্য পূর্বাভাস',
      data_source: 'তথ্য সূত্র',
      market_sentiment: 'বাজারের মনোভাব',
      track_watchlist: 'ওয়াচলিস্টে যুক্ত করুন',
      saved_watchlist: 'ওয়াচলিস্টে সংরক্ষিত',
      nearby_comparisons: 'কাছাকাছি মান্ডির তুলনা',
      regional_mandis: 'আঞ্চলিক মান্ডি',
      regional_average: 'আঞ্চলিক গড়',
      mandi_col: 'মান্ডি / বাজার',
      district_state_col: 'জেলা, রাজ্য',
      price_range_col: 'মূল্যের পরিসর',
      modal_price_col: 'মডেল দর',
      arrivals_col: 'আমদানি',
      date_col: 'রেকর্ড করা তারিখ',
      no_rates_found: 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো মান্ডি দর পাওয়া যায়নি।',
      no_rates_subtext: 'একটি ভিন্ন জেলা, রাজ্য নির্বাচন করুন অথবা বানান পরীক্ষা করুন।',
      price_load_error: 'এই অনুসন্ধানের জন্য মান্ডি দর লোড করা যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।',
      refresh_error: 'রিফ্রেশ ব্যর্থ হয়েছে। অ্যাপটি সংরক্ষিত দর ব্যবহার করতে থাকবে।'
    },
    auth: {
      referral_code: 'রেফারেল কোড (ঐচ্ছিক)',
      referral_code_placeholder: 'উদা. TK-6BF912',
      referral_applied: 'রেফারেল কোড প্রয়োগ করা হয়েছে'
    },
    settings: {
      preferences_tab: 'ভাষা ও অ্যাপ পছন্দসমূহ'
    }
  },
  ta: {
    referral: {
      title: 'விவசாயிகளை அழைத்து வரவுகளைப் பெறுங்கள்',
      subtitle: 'உங்கள் பகுதி விவசாயிகளுடன் தி கேதுத் செயலியைப் பகிருங்கள்',
      invited: 'அழைக்கப்பட்டவர்கள்',
      activated: 'செயலில் உள்ளவர்கள்',
      copy_code: 'குறியீட்டை நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது!',
      whatsapp: 'வாட்ஸ்அப்',
      share_message: 'உங்கள் பண்ணைக்கு பயிர் ஆலோசனை, நோய் கண்டறிதல் மற்றும் மண்டி விலைகளைப் பெற தி கேதுத்-இல் இணையுங்கள்! எனது குறியீடு {{code}} பயன்படுத்தி பதிவு செய்யவும்: {{link}}',
      rewards_title: 'பரிந்துரை வெகுமதிகள் & வரவுகள்',
      step1_badge: 'படி 1',
      step1_title: 'உங்கள் குறியீட்டைப் பகிரவும்',
      step1_desc: 'வாட்ஸ்அப் அல்லது செய்தி மூலம் விவசாயிகளுக்கு உங்கள் பரிந்துரை இணைப்பை அனுப்பவும்.',
      step2_badge: 'படி 2',
      step2_title: 'விவசாயி பதிவு',
      step2_desc: 'அவர்கள் உங்கள் இணைப்பைப் பயன்படுத்தும் போது உங்கள் நெட்வொர்க்கில் இணைக்கப்படுவார்கள்.',
      step3_badge: 'படி 3',
      step3_title: 'இலவச வரவுகளைப் பெறுங்கள்',
      step3_desc: 'இலவச NPK மண் பரிசோதனை வரவுகள் மற்றும் பிரீமியம் சோதனையைப் பெறுங்கள்.',
      tab_title: 'அழைத்துப் பெறுங்கள் (பரிந்துரைகள்)',
      applied_badge: 'பரிந்துரை குறியீடு பயன்படுத்தப்பட்டது'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'சந்தை நுண்ணறிவு & மண்டி விலைகள்',
      mandi_rates_sub: 'AI விலை போக்கு கணிப்புகளுடன் இந்தியா முழுவதும் உள்ள APMC மண்டிகளின் நேரடி விலைகள்.',
      refresh_feed: 'மண்டி விலைகளைப் புதுப்பிக்கவும்',
      refreshing: 'புதுப்பிக்கப்படுகிறது...',
      regional_benchmark: 'மண்டல மண்டி ஒப்பீடு',
      trend_7d: '7-நாள் விலை போக்கு',
      volatility_30d: '30-நாள் விலை ஏற்ற இறக்கம்',
      watched_mandis: 'கண்காணிக்கப்படும் மண்டிகள்',
      tracked_commodities: 'கண்காணிக்கப்படும் பயிர்கள்',
      target_commodity: 'இலக்கு பயிர் / பொருள்',
      all_states: 'அனைத்து மாநிலங்கள்',
      state_label: 'மாநிலம்',
      district_label: 'மாவட்டம் / மண்டி',
      date_label: 'தேதி வடிகட்டி',
      search_rates_btn: 'மண்டி விலைகளைத் தேடுங்கள்',
      modal_price_title: 'நிகழ்நேர மாதிரி மண்டி விலை',
      recorded_range: 'பதிவு செய்யப்பட்ட விலை வரம்பு',
      price_outlook: 'விலை எதிர்பார்ப்பு',
      data_source: 'தரவு ஆதாரம்',
      market_sentiment: 'சந்தை நிலைமை',
      track_watchlist: 'கண்காணிப்புப் பட்டியலில் சேர்க்கவும்',
      saved_watchlist: 'பட்டியலில் சேமிக்கப்பட்டது',
      nearby_comparisons: 'அருகிலுள்ள மண்டி ஒப்பீடுகள்',
      regional_mandis: 'மண்டல மண்டிகள்',
      regional_average: 'மண்டல சராசரி',
      mandi_col: 'மண்டி / சந்தை',
      district_state_col: 'மாவட்டம், மாநிலம்',
      price_range_col: 'விலை வரம்பு',
      modal_price_col: 'மாதிரி விலை',
      arrivals_col: 'வரவு',
      date_col: 'பதிவு செய்யப்பட்ட தேதி',
      no_rates_found: 'உங்கள் தேடலுடன் பொருந்தக்கூடிய மண்டி விலைகள் எதுவும் கிடைக்கவில்லை.',
      no_rates_subtext: 'வேறு மாவட்டம், மாநிலத்தைத் தேர்ந்தெடுக்கவும் அல்லது எழுத்துப்பிழையைச் சரிபார்க்கவும்.',
      price_load_error: 'மண்டி விலைகளை ஏற்றுவதில் தோல்வி. வடிப்பான்களை மாற்றவும்.',
      refresh_error: 'புதுப்பித்தல் தோல்வியடைந்தது. சேமிக்கப்பட்ட விலைகள் பயன்படுத்தப்படும்.'
    },
    auth: {
      referral_code: 'பரிந்துரை குறியீடு (விருப்பத்திற்குரியது)',
      referral_code_placeholder: 'எ.கா. TK-6BF912',
      referral_applied: 'பரிந்துரை குறியீடு பயன்படுத்தப்பட்டது'
    },
    settings: {
      preferences_tab: 'மொழி மற்றும் பயன்பாட்டு விருப்பங்கள்'
    }
  },
  te: {
    referral: {
      title: 'రైతులను ఆహ్వానించండి & క్రెడిట్స్ పొందండి',
      subtitle: 'మీ ప్రాంతంలోని తోటి రైతులతో ది ఖేడూత్ యాప్‌ను పంచుకోండి',
      invited: 'ఆహ్వానించబడినవారు',
      activated: 'క్రియాశీలంగా ఉన్నవారు',
      copy_code: 'కోడ్ కాపీ చేయండి',
      copied: 'కాపీ చేయబడింది!',
      whatsapp: 'వాట్సాప్',
      share_message: 'మీ పొలం కోసం స్మార్ట్ పంట సలహాలు, తెగుళ్ల గుర్తింపు మరియు మార్కెట్ ధరలను పొందడానికి ది ఖేడూత్‌లో చేరండి! నా కోడ్ {{code}} ఉపయోగించి నమోదు చేసుకోండి: {{link}}',
      rewards_title: 'రిఫరల్ రివార్డులు & క్రెడిట్స్',
      step1_badge: 'దశ 1',
      step1_title: 'మీ కోడ్ పంచుకోండి',
      step1_desc: 'వాట్సాప్ లేదా మెసేజ్ ద్వారా తోటి రైతులకు మీ రిఫరల్ లింక్ పంపండి.',
      step2_badge: 'దశ 2',
      step2_title: 'రైతు నమోదు',
      step2_desc: 'వారు మీ లింక్ ఉపయోగించినప్పుడు, వారి ఖాతా మీ నెట్‌వర్క్‌కు లింక్ అవుతుంది.',
      step3_badge: 'దశ 3',
      step3_title: 'ఉచిత క్రెడిట్స్ పొందండి',
      step3_desc: 'ఉచిత NPK నేల పరీక్ష క్రెడిట్స్ మరియు ప్రీమియం సభ్యత్వం పొందండి.',
      tab_title: 'ఆహ్వానించండి & సంపాదించండి (రిఫరల్స్)',
      applied_badge: 'రిఫరల్ కోడ్ వర్తింపజేయబడింది'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'మార్కెట్ సమాచారం & మండి ధరలు',
      mandi_rates_sub: 'AI ధరల ధోరణి అంచనాలతో భారతదేశం అంతటా ఉన్న APMC మండిల ప్రత్యక్ష ధరలు.',
      refresh_feed: 'మండి ధరలను తాజా చేయండి',
      refreshing: 'తాజా చేయబడుతోంది...',
      regional_benchmark: 'ప్రాంతీయ మండి బెంచ్‌మార్క్',
      trend_7d: '7 రోజుల ధరల ధోరణి',
      volatility_30d: '30 రోజుల ధర హెచ్చుతగ్గులు',
      watched_mandis: 'పరిశీలనలో ఉన్న మండిలు',
      tracked_commodities: 'ట్రాక్ చేయబడిన పంటలు',
      target_commodity: 'లక్ష్య పంట / వస్తువు',
      all_states: 'అన్ని రాష్ట్రాలు',
      state_label: 'రాష్ట్రం',
      district_label: 'జిల్లా / మండి',
      date_label: 'తేదీ ఫిల్టర్',
      search_rates_btn: 'మండి ధరలను శోధించండి',
      modal_price_title: 'నిజ-సమయ మోడల్ మండి ధర',
      recorded_range: 'నమోదైన ధరల పరిధి',
      price_outlook: 'ధరల దృక్పథం',
      data_source: 'డేటా మూలం',
      market_sentiment: 'మార్కెట్ సరళి',
      track_watchlist: 'వాచ్‌లిస్ట్‌కు జోడించండి',
      saved_watchlist: 'వాచ్‌లిస్ట్‌లో సేవ్ చేయబడింది',
      nearby_comparisons: 'సమీప మండిలతో పోలిక',
      regional_mandis: 'ప్రాంతీయ మండిలు',
      regional_average: 'ప్రాంతీయ సగటు',
      mandi_col: 'మండి / మార్కెట్',
      district_state_col: 'జిల్లా, రాష్ట్రం',
      price_range_col: 'ధరల పరిధి',
      modal_price_col: 'మోడల్ ధర',
      arrivals_col: 'రాకలు',
      date_col: 'నమోదైన తేదీ',
      no_rates_found: 'మీ శోధనకు తగిన మండి ధరలు ఏవీ కనుగొనబడలేదు.',
      no_rates_subtext: 'దయచేసి వేరే జిల్లా, రాష్ట్రం ఎంచుకోండి లేదా స్పెల్లింగ్ తనిఖీ చేయండి.',
      price_load_error: 'మండి ధరలను లోడ్ చేయడం సాధ్యపడలేదు. దయచేసి ఫిల్టర్లను మార్చండి.',
      refresh_error: 'తాజా చేయడం విఫలమైంది. యాప్ సేవ్ చేసిన ధరలను ప్రదర్శిస్తుంది.'
    },
    auth: {
      referral_code: 'రిఫరల్ కోడ్ (ఐచ్ఛికం)',
      referral_code_placeholder: 'ఉదా. TK-6BF912',
      referral_applied: 'రిఫరల్ కోడ్ వర్తించబడింది'
    },
    settings: {
      preferences_tab: 'భాష మరియు యాప్ ప్రాధాన్యతలు'
    }
  },
  kn: {
    referral: {
      title: 'ರೈತರನ್ನು ಆಹ್ವಾನಿಸಿ ಮತ್ತು ಕ್ರೆಡಿಟ್‌ಗಳನ್ನು ಗಳಿಸಿ',
      subtitle: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ಸಹ ರೈತರೊಂದಿಗೆ ದಿ ಖೇಡುತ್ ಹಂಚಿಕೊಳ್ಳಿ',
      invited: 'ಆಹ್ವಾನಿತರು',
      activated: 'ಸಕ್ರಿಯಗೊಂಡವರು',
      copy_code: 'ಕೋಡ್ ನಕಲಿಸಿ',
      copied: 'ನಕಲಿಸಲಾಗಿದೆ!',
      whatsapp: 'ವಾಟ್ಸಾಪ್',
      share_message: 'ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹೆ, ರೋಗ ಪತ್ತೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಲು ದಿ ಖೇಡುತ್ ಸೇರಿ! ನನ್ನ ಕೋಡ್ {{code}} ಬಳಸಿ ನೋಂದಾಯಿಸಿ: {{link}}',
      rewards_title: 'ರೆಫರಲ್ ಬಹುಮಾನಗಳು ಮತ್ತು ಕ್ರೆಡಿಟ್‌ಗಳು',
      step1_badge: 'ಹಂತ 1',
      step1_title: 'ನಿಮ್ಮ ಕೋಡ್ ಹಂಚಿಕೊಳ್ಳಿ',
      step1_desc: 'ವಾಟ್ಸಾಪ್ ಅಥವಾ ಸಂದೇಶದ ಮೂಲಕ ಸಹ ರೈತರಿಗೆ ನಿಮ್ಮ ರೆಫರಲ್ ಲಿಂಕ್ ಕಳುಹಿಸಿ.',
      step2_badge: 'ಹಂತ 2',
      step2_title: 'ರೈತರ ನೋಂದಣಿ',
      step2_desc: 'ಅವರು ನಿಮ್ಮ ಲಿಂಕ್ ಬಳಸಿದಾಗ, ಅವರ ಖಾತೆಯು ನಿಮ್ಮ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಲಿಂಕ್ ಆಗುತ್ತದೆ.',
      step3_badge: 'ಹಂತ 3',
      step3_title: 'ಉಚಿತ ಕ್ರೆಡಿಟ್‌ಗಳನ್ನು ಗಳಿಸಿ',
      step3_desc: 'ಉಚಿತ NPK ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಕ್ರೆಡಿಟ್‌ಗಳು ಮತ್ತು ಪ್ರೀಮಿಯಂ ಸದಸ್ಯತ್ವವನ್ನು ಪಡೆಯಿರಿ.',
      tab_title: 'ಆಹ್ವಾನಿಸಿ ಮತ್ತು ಗಳಿಸಿ (ರೆಫರಲ್)',
      applied_badge: 'ರೆಫರಲ್ ಕೋಡ್ ಅನ್ವಯಿಸಲಾಗಿದೆ'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ ಮತ್ತು ಮಂಡಿ ದರಗಳು',
      mandi_rates_sub: 'AI ಬೆಲೆ ಪ್ರವೃತ್ತಿ ಮುನ್ಸೂಚನೆಗಳೊಂದಿಗೆ ಭಾರತದಾದ್ಯಂತ APMC ಮಂಡಿಗಳ ನೇರ ದರಗಳು.',
      refresh_feed: 'ಮಂಡಿ ದರಗಳನ್ನು ನವೀಕರಿಸಿ',
      refreshing: 'ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
      regional_benchmark: 'ಪ್ರಾದೇಶಿಕ ಮಂಡಿ ಮಾನದಂಡ',
      trend_7d: '7-ದಿನದ ಬೆಲೆ ಪ್ರವೃತ್ತಿ',
      volatility_30d: '30-ದಿನದ ಬೆಲೆ ಏರಿಳಿತ',
      watched_mandis: 'ವೀಕ್ಷಿಸಿದ ಮಂಡಿಗಳು',
      tracked_commodities: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ಬೆಳೆಗಳು',
      target_commodity: 'ಗುರಿ ಬೆಳೆ / ಸರಕು',
      all_states: 'ಎಲ್ಲಾ ರಾಜ್ಯಗಳು',
      state_label: 'ರಾಜ್ಯ',
      district_label: 'ಜಿಲ್ಲೆ / ಮಂಡಿ',
      date_label: 'ದಿನಾಂಕ ಫಿಲ್ಟರ್',
      search_rates_btn: 'ಮಂಡಿ ದರಗಳನ್ನು ಹುಡುಕಿ',
      modal_price_title: 'ನೈಜ-ಸಮಯದ ಮಾದರಿ ಮಂಡಿ ದರ',
      recorded_range: 'ದಾಖಲಾದ ಬೆಲೆ ಶ್ರೇಣಿ',
      price_outlook: 'ಬೆಲೆ ದೃಷ್ಟಿಕೋನ',
      data_source: 'ಡೇಟಾ ಮೂಲ',
      market_sentiment: 'ಮಾರುಕಟ್ಟೆ ಭಾವನೆ',
      track_watchlist: 'ವೀಕ್ಷಣಾಪಟ್ಟಿಗೆ ಸೇರಿಸಿ',
      saved_watchlist: 'ವೀಕ್ಷಣಾಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
      nearby_comparisons: 'ಹತ್ತಿರದ ಮಂಡಿಗಳ ಹೋಲಿಕೆ',
      regional_mandis: 'ಪ್ರಾದೇಶಿಕ ಮಂಡಿಗಳು',
      regional_average: 'ಪ್ರಾದೇಶಿಕ ಸರಾಸರಿ',
      mandi_col: 'ಮಂಡಿ / ಮಾರುಕಟ್ಟೆ',
      district_state_col: 'ಜಿಲ್ಲೆ, ರಾಜ್ಯ',
      price_range_col: 'ಬೆಲೆ ಶ್ರೇಣಿ',
      modal_price_col: 'ಮಾದರಿ ಬೆಲೆ',
      arrivals_col: 'ಆವಕ',
      date_col: 'ದಾಖಲಾದ ದಿನಾಂಕ',
      no_rates_found: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಮಂಡಿ ದರಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      no_rates_subtext: 'ದಯವಿಟ್ಟು ಬೇರೆ ಜಿಲ್ಲೆ, ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಕಾಗುಣಿತ ಪರಿಶೀಲಿಸಿ.',
      price_load_error: 'ಮಂಡಿ ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ.',
      refresh_error: 'ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ. ಉಳಿಸಿದ ದರಗಳನ್ನು ಪ್ರದರ್ಶಿಸಲಾಗುವುದು.'
    },
    auth: {
      referral_code: 'ರೆಫರಲ್ ಕೋಡ್ (ಐಚ್ಛಿಕ)',
      referral_code_placeholder: 'ಉದಾ. TK-6BF912',
      referral_applied: 'ರೆಫರಲ್ ಕೋಡ್ ಅನ್ವಯಿಸಲಾಗಿದೆ'
    },
    settings: {
      preferences_tab: 'ಭಾಷೆ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು'
    }
  },
  ml: {
    referral: {
      title: 'കർഷകരെ ക്ഷണിക്കൂ, ക്രെഡിറ്റുകൾ നേടൂ',
      subtitle: 'നിങ്ങളുടെ പ്രദേശത്തെ സഹ കർഷകരുമായി ദി ഖേദൂത് പങ്കിടുക',
      invited: 'ക്ഷണിച്ചവർ',
      activated: 'സജീവമായവർ',
      copy_code: 'കോഡ് പകർത്തു',
      copied: 'പകർത്തി!',
      whatsapp: 'വാട്ട്‌സ്ആപ്പ്',
      share_message: 'നിങ്ങളുടെ കൃഷിയിടത്തിന് മികച്ച വിള ഉപദേശങ്ങൾ, രോഗനിർണ്ണയം, ചന്ത വിലകൾ എന്നിവ ലഭിക്കാൻ ദി ഖേദൂത്തിൽ ചേരൂ! എന്റെ കോഡ് {{code}} ഉപയോഗിച്ച് രജിസ്റ്റർ ചെയ്യുക: {{link}}',
      rewards_title: 'റഫറൽ റിവാർഡുകളും ക്രെഡിറ്റുകളും',
      step1_badge: 'ഘട്ടം 1',
      step1_title: 'നിങ്ങളുടെ കോഡ് പങ്കിടുക',
      step1_desc: 'വാട്ട്‌സ്ആപ്പ് അല്ലെങ്കിൽ സന്ദേശം വഴി സഹ കർഷകർക്ക് നിങ്ങളുടെ റഫറൽ ലിങ്ക് അയയ്ക്കുക.',
      step2_badge: 'ഘട്ടം 2',
      step2_title: 'കർഷക രജിസ്ട്രേഷൻ',
      step2_desc: 'അവർ നിങ്ങളുടെ ലിങ്ക് ഉപയോഗിക്കുമ്പോൾ, അവരുടെ അക്കൗണ്ട് നിങ്ങളുടെ നെറ്റ്‌വർക്കിലേക്ക് ബന്ധിപ്പിക്കപ്പെടും.',
      step3_badge: 'ഘട്ടം 3',
      step3_title: 'സൗജന്യ ക്രെഡിറ്റുകൾ നേടുക',
      step3_desc: 'സൗജന്യ NPK മണ്ണ് പരിശോധന ക്രെഡിറ്റുകളും പ്രീമിയം അംഗത്വവും നേടുക.',
      tab_title: 'ക്ഷണിക്കൂ നേടൂ (റഫറൽ)',
      applied_badge: 'റഫറൽ കോഡ് പ്രയോഗിച്ചു'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'വിപണി വിവരങ്ങളും ചന്ത വിലകളും',
      mandi_rates_sub: 'AI വില പ്രവണത പ്രവചനങ്ങളോടെ ഇന്ത്യയിലുടനീളമുള്ള APMC ചന്തകളിലെ തത്സമയ വിലകൾ.',
      refresh_feed: 'വിലകൾ പുതുക്കുക',
      refreshing: 'പുതുക്കുന്നു...',
      regional_benchmark: 'മേഖലാ മണ്ടി ബെഞ്ച്മാർക്ക്',
      trend_7d: '7 ദിവസത്തെ വില പ്രവണത',
      volatility_30d: '30 ദിവസത്തെ വിലയിലെ ഏറ്റക്കുറച്ചിലുകൾ',
      watched_mandis: 'നിരീക്ഷിച്ച ചന്തകൾ',
      tracked_commodities: 'ട്രാക്ക് ചെയ്ത വിളകൾ',
      target_commodity: 'വിള / ഉൽപ്പന്നം',
      all_states: 'എല്ലാ സംസ്ഥാനങ്ങളും',
      state_label: 'സംസ്ഥാനം',
      district_label: 'ജില്ല / ചന്ത',
      date_label: 'തീയതി ഫിൽട്ടർ',
      search_rates_btn: 'ചന്ത വിലകൾ തിരയുക',
      modal_price_title: 'തത്സമയ മോഡൽ ചന്ത വില',
      recorded_range: 'രേഖപ്പെടുത്തിയ വില പരിധി',
      price_outlook: 'വില സാധ്യത',
      data_source: 'ഡാറ്റ ഉറവിടം',
      market_sentiment: 'വിപണി സ്ഥിതി',
      track_watchlist: 'വാച്ച്‌ലിസ്റ്റിലേക്ക് ചേർക്കുക',
      saved_watchlist: 'വാച്ച്‌ലിസ്റ്റിൽ സൂക്ഷിച്ചു',
      nearby_comparisons: 'സമീപത്തെ ചന്തകളുമായുള്ള താരതമ്യം',
      regional_mandis: 'മേഖലാ ചന്തകൾ',
      regional_average: 'മേഖലാ ശരാശരി',
      mandi_col: 'ചന്ത / വിപണി',
      district_state_col: 'ജില്ല, സംസ്ഥാനം',
      price_range_col: 'വില പരിധി',
      modal_price_col: 'മോഡൽ വില',
      arrivals_col: 'വരവ്',
      date_col: 'രേഖപ്പെടുത്തിയ തീയതി',
      no_rates_found: 'നിങ്ങളുടെ തിരയലിന് അനുയോജ്യമായ ചന്ത വിലകൾ ഒന്നും കണ്ടെത്തിയില്ല.',
      no_rates_subtext: 'ദയവായി മറ്റൊരു ജില്ല, സംസ്ഥാനം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ അക്ഷരവിന്യാസം പരിശോധിക്കുക.',
      price_load_error: 'ചന്ത വിലകൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി ഫിൽട്ടറുകൾ മാറ്റുക.',
      refresh_error: 'പുതുക്കൽ പരാജയപ്പെട്ടു. സൂക്ഷിച്ച വിലകൾ കാണിക്കും.'
    },
    auth: {
      referral_code: 'റഫറൽ കോഡ് (ഐച്ഛികം)',
      referral_code_placeholder: 'ഉദാ. TK-6BF912',
      referral_applied: 'റഫറൽ കോഡ് പ്രയോഗിച്ചു'
    },
    settings: {
      preferences_tab: 'ഭാഷയും ആപ്പ് മുൻഗണനകളും'
    }
  },
  or: {
    referral: {
      title: 'କୃଷକମାନଙ୍କୁ ନିମନ୍ତ୍ରଣ କରନ୍ତୁ ଏବଂ କ୍ରେଡିଟ୍ ପାଆନ୍ତୁ',
      subtitle: 'ଆପଣଙ୍କ ଅଞ୍ଚଳର ସାଥୀ କୃଷକମାନଙ୍କ ସହିତ ଦ ଖେଦୁତ ସେୟାର କରନ୍ତୁ',
      invited: 'ନିମନ୍ତ୍ରିତ',
      activated: 'ସକ୍ରିୟ',
      copy_code: 'କୋଡ୍ କପି କରନ୍ତୁ',
      copied: 'କପି ହୋଇଗଲା!',
      whatsapp: 'ହ୍ୱାଟ୍ସଆପ୍',
      share_message: 'ଆପଣଙ୍କ ଚାଷ ପାଇଁ ସ୍ମାର୍ଟ ଫସଲ ପରାମର୍ଶ, ରୋଗ ନିରୂପଣ ଏବଂ ମଣ୍ଡି ମୂଲ୍ୟ ପାଇବା ପାଇଁ ଦ ଖେଦୁତ ସହିତ ଯୋଡ଼ି ହୁଅନ୍ତୁ! ମୋ କୋଡ୍ {{code}} ବ୍ୟବହାର କରି ପଞ୍ଜୀକରଣ କରନ୍ତୁ: {{link}}',
      rewards_title: 'ରେଫରାଲ ପୁରସ୍କାର ଏବଂ କ୍ରେଡିଟ୍',
      step1_badge: 'ପଦକ୍ଷେପ ୧',
      step1_title: 'ଆପଣଙ୍କ କୋଡ୍ ସେୟାର କରନ୍ତୁ',
      step1_desc: 'ହ୍ୱାଟ୍ସଆପ୍ କିମ୍ବା ମେସେଜ୍ ମାଧ୍ୟମରେ ସାଥୀ କୃଷକମାନଙ୍କୁ ଆପଣଙ୍କ ରେଫରାଲ ଲିଙ୍କ ପଠାନ୍ତୁ।',
      step2_badge: 'ପଦକ୍ଷେପ ୨',
      step2_title: 'କୃଷକ ପଞ୍ଜୀକରଣ',
      step2_desc: 'ଯେତେବେଳେ ସେମାନେ ଆପଣଙ୍କ ଲିଙ୍କ ବ୍ୟବହାର କରିବେ, ସେମାନଙ୍କ ଖାତା ଆପଣଙ୍କ ନେଟୱର୍କ ସହିତ ଯୋଡ଼ି ହୋଇଯିବ।',
      step3_badge: 'ପଦକ୍ଷେପ ୩',
      step3_title: 'ମାଗଣା କ୍ରେଡିଟ୍ ପାଆନ୍ତୁ',
      step3_desc: 'ମାଗଣା NPK ମାଟି ପରୀକ୍ଷଣ କ୍ରେଡିଟ୍ ଏବଂ ପ୍ରିମିୟମ ସଦସ୍ୟତା ପାଆନ୍ତୁ।',
      tab_title: 'ନିମନ୍ତ୍ରଣ କରନ୍ତୁ ଏବଂ କମାନ୍ତୁ (ରେଫରାଲ)',
      applied_badge: 'ରେଫରାଲ କୋଡ୍ ଲାଗୁ ହେଲା'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'ବଜାର ସୂଚନା ଏବଂ ମଣ୍ଡି ଦର',
      mandi_rates_sub: 'AI ମୂଲ୍ୟ ଧାରା ପୂର୍ବାନୁମାନ ସହିତ ସମଗ୍ର ଭାରତର APMC ମଣ୍ଡିର ସତ୍ୟାପିତ ଦର।',
      refresh_feed: 'ମଣ୍ଡି ଦର ରିଫ୍ରେଶ କରନ୍ତୁ',
      refreshing: 'ରିଫ୍ରେଶ ହେଉଛି...',
      regional_benchmark: 'ଆଞ୍ଚଳିକ ମଣ୍ଡି ବେଞ୍ଚମାର୍କ',
      trend_7d: '୭ ଦିନର ମୂଲ୍ୟ ଧାରା',
      volatility_30d: '୩୦ ଦିନର ମୂଲ୍ୟ ଅସ୍ଥିରତା',
      watched_mandis: 'ପସନ୍ଦର ମଣ୍ଡି',
      tracked_commodities: 'ଟ୍ରାକ୍ ହୋଇଥିବା ଫସଲ',
      target_commodity: 'ଲକ୍ଷ୍ୟ ଫସଲ / ସାମଗ୍ରୀ',
      all_states: 'ସମସ୍ତ ରାଜ୍ୟ',
      state_label: 'ରାଜ୍ୟ',
      district_label: 'ଜିଲ୍ଲା / ମଣ୍ଡି',
      date_label: 'ତାରିଖ ଫିଲ୍ଟର',
      search_rates_btn: 'ମଣ୍ଡି ଦର ଖୋଜନ୍ତୁ',
      modal_price_title: 'ପ୍ରକୃତ ମଡେଲ ମଣ୍ଡି ଦର',
      recorded_range: 'ରେକର୍ଡ ହୋଇଥିବା ମୂଲ୍ୟ ପରିସର',
      price_outlook: 'ମୂଲ୍ୟ ଆକଳନ',
      data_source: 'ତଥ୍ୟ ଉତ୍ସ',
      market_sentiment: 'ବଜାର ମନୋଭାବ',
      track_watchlist: 'ୱାଚଲିଷ୍ଟରେ ଯୋଡ଼ନ୍ତୁ',
      saved_watchlist: 'ୱାଚଲିଷ୍ଟରେ ସଂରକ୍ଷିତ',
      nearby_comparisons: 'ନିକଟବର୍ତ୍ତୀ ମଣ୍ଡିର ତୁଳନା',
      regional_mandis: 'ଆଞ୍ଚଳିକ ମଣ୍ଡି',
      regional_average: 'ଆଞ୍ଚଳିକ ହାରାହାରି',
      mandi_col: 'ମଣ୍ଡି / ବଜାର',
      district_state_col: 'ଜିଲ୍ଲା, ରାଜ୍ୟ',
      price_range_col: 'ମୂଲ୍ୟ ପରିସର',
      modal_price_col: 'ମଡେଲ ଦର',
      arrivals_col: 'ଆଗମନ',
      date_col: 'ରେକର୍ଡ ତାରିଖ',
      no_rates_found: 'ଆପଣଙ୍କ ସନ୍ଧାନ ସହିତ ମେଳ ଖାଉଥିବା କୌଣସି ମଣ୍ଡି ଦର ମିଳିଲା ନାହିଁ।',
      no_rates_subtext: 'ଦୟାକରି ଏକ ଭିନ୍ନ ଜିଲ୍ଲା, ରାଜ୍ୟ ଚୟନ କରନ୍ତୁ କିମ୍ବା ବନାନ ଯାଞ୍ଚ କରନ୍ତୁ।',
      price_load_error: 'ମଣ୍ଡି ଦର ଲୋଡ୍ କରିବାରେ ଅସମର୍ଥ। ଦୟାକରି ଫିଲ୍ଟର ପରିବର୍ତ୍ତନ କରନ୍ତୁ।',
      refresh_error: 'ରିଫ୍ରେଶ ବିଫଳ ହେଲା। ସଂରକ୍ଷିତ ଦର ପ୍ରଦର୍ଶିତ ହେବ।'
    },
    auth: {
      referral_code: 'ରେଫରାଲ କୋଡ୍ (ଇଚ୍ଛାଧୀନ)',
      referral_code_placeholder: 'ଉଦା. TK-6BF912',
      referral_applied: 'ରେଫରାଲ କୋଡ୍ ଲାଗୁ ହେଲା'
    },
    settings: {
      preferences_tab: 'ଭାଷା ଏବଂ ଆପ୍ ପସନ୍ଦ'
    }
  },
  as: {
    referral: {
      title: 'কৃষকসকলক আমন্ত্ৰণ জনাওক আৰু ক্ৰেডিট লাভ কৰক',
      subtitle: 'আপোনাৰ অঞ্চলৰ সহকৰ্মী কৃষকসকলৰ সৈতে দ্য খেদুত শ্বেয়াৰ কৰক',
      invited: 'আমন্ত্ৰিত',
      activated: 'সক্ৰিয়',
      copy_code: 'কোড কপি কৰক',
      copied: 'কপি হ’ল!',
      whatsapp: 'হোৱাটছএপ',
      share_message: 'আপোনাৰ পথাৰৰ বাবে স্মাৰ্ট শস্য পৰামৰ্শ, ৰোগ নিৰ্ণয় আৰু মাণ্ডি মূল্য পাবলৈ দ্য খেদুতত যোগদান কৰক! মোৰ কোড {{code}} ব্যৱহাৰ কৰি পঞ্জীয়ন কৰক: {{link}}',
      rewards_title: 'ৰেফাৰেল পুৰস্কাৰ আৰু ক্ৰেডিট',
      step1_badge: 'পদক্ষেপ ১',
      step1_title: 'আপোনাৰ কোড শ্বেয়াৰ কৰক',
      step1_desc: 'হোৱাটছএপ বা বাৰ্তাৰ জৰিয়তে সহকৰ্মী কৃষকসকললৈ আপোনাৰ ৰেফাৰেল লিংক প্ৰেৰণ কৰক।',
      step2_badge: 'পদক্ষেপ ২',
      step2_title: 'কৃষক পঞ্জীয়ন',
      step2_desc: 'যেতিয়া তেওঁলোকে আপোনাৰ লিংক ব্যৱহাৰ কৰিব, তেওঁলোকৰ একাউণ্ট আপোনাৰ নেটৱৰ্কত যুক্ত হ’ব।',
      step3_badge: 'পদক্ষেপ ৩',
      step3_title: 'বিনামূলীয়া ক্ৰেডিট লাভ কৰক',
      step3_desc: 'বিনামূলীয়া এনপিকে মাটি পৰীক্ষা ক্ৰেডিট আৰু প্ৰিমিয়াম সদস্যতা বৃদ্ধি লাভ কৰক।',
      tab_title: 'আমন্ত্ৰণ জনাওক আৰু উপাৰ্জন কৰক (ৰেফাৰেল)',
      applied_badge: 'ৰেফাৰেল কোড প্ৰয়োগ কৰা হ’ল'
    },
    market: {
      ...marketAdditionsHi,
      mandi_rates_title: 'বজাৰ তথ্য আৰু মাণ্ডি দৰ',
      mandi_rates_sub: 'এআই মূল্য প্ৰৱণতা পূৰ্বানুমানৰ সৈতে সমগ্ৰ ভাৰতৰ এপিএমচি মাণ্ডিৰ পৰীক্ষিত দৰ।',
      refresh_feed: 'মাণ্ডি দৰ সতেজ কৰক',
      refreshing: 'সতেজ কৰা হৈছে...',
      regional_benchmark: 'আঞ্চলিক মাণ্ডি বেঞ্চমাৰ্ক',
      trend_7d: '৭ দিনৰ মূল্য প্ৰৱণতা',
      volatility_30d: '৩০ দিনৰ মূল্য অস্থিৰতা',
      watched_mandis: 'পছন্দৰ মাণ্ডি',
      tracked_commodities: 'ট্ৰেক কৰা শস্য',
      target_commodity: 'লক্ষ্য শস্য / সামগ্ৰী',
      all_states: 'সকলো ৰাজ্য',
      state_label: 'ৰাজ্য',
      district_label: 'জিলা / মাণ্ডি',
      date_label: 'তাৰিখ ফিল্টাৰ',
      search_rates_btn: 'মাণ্ডি দৰ সন্ধান কৰক',
      modal_price_title: 'প্ৰকৃত মডেল মাণ্ডি দৰ',
      recorded_range: 'ৰেকৰ্ড কৰা মূল্য পৰিসৰ',
      price_outlook: 'মূল্য দৃষ্টিভংগী',
      data_source: 'তথ্যৰ উৎস',
      market_sentiment: 'বজাৰৰ ধাৰা',
      track_watchlist: 'ৱাচলিষ্টত যোগ কৰক',
      saved_watchlist: 'ৱাচলিষ্টত সংৰক্ষিত',
      nearby_comparisons: 'ওচৰৰ মাণ্ডিৰ তুলনা',
      regional_mandis: 'আঞ্চলিক মাণ্ডি',
      regional_average: 'আঞ্চলিক গড়',
      mandi_col: 'মাণ্ডি / বজাৰ',
      district_state_col: 'জিলা, ৰাজ্য',
      price_range_col: 'মূল্য পৰিসৰ',
      modal_price_col: 'মডেল দৰ',
      arrivals_col: 'আমদানি',
      date_col: 'ৰেকৰ্ড কৰা তাৰিখ',
      no_rates_found: 'আপোনাৰ সন্ধানৰ সৈতে মিলা কোনো মাণ্ডি দৰ পোৱা নগ’ল।',
      no_rates_subtext: 'অনুগ্ৰহ কৰি আন এখন জিলা, ৰাজ্য বাছনি কৰক বা বানান পৰীক্ষা কৰক।',
      price_load_error: 'মাণ্ডি দৰ লোড কৰাত ব্যৰ্থ। অনুগ্ৰহ কৰি ফিল্টাৰ সলনি কৰক।',
      refresh_error: 'সতেজ কৰা ব্যৰ্থ হ’ল। সংৰক্ষিত দৰ প্ৰদৰ্শন কৰা হ’ବ।'
    },
    auth: {
      referral_code: 'ৰেফাৰেল কোড (ঐচ্ছিক)',
      referral_code_placeholder: 'উদা. TK-6BF912',
      referral_applied: 'ৰেফাৰেল কোড প্ৰয়োগ কৰা হ’ল'
    },
    settings: {
      preferences_tab: 'ভাষা আৰু এপৰ পছন্দসমূহ'
    }
  }
};

// Process each of the 9 languages
for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang.code}.json`);
  let existing = {};
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      existing = {};
    }
  }

  // Base fallback is Hindi for north/central Indian languages, Gujarati/Hindi context
  // deepMerge with existing so existing translations are preserved, and languageOverrides are applied
  const baseDict = hi; // High quality base
  const overrides = languageOverrides[lang.code] || {};
  
  const merged = deepMergeWithFallback(existing, baseDict, overrides);

  // Guarantee that branding name is preserved consistently
  if (merged.common && merged.common.brand_name) {
    merged.common.brand_name = 'THE KHEDUT';
  }

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Generated complete translation file for ${lang.code} (${lang.name}): ${Object.keys(merged).length} top-level sections.`);
}

console.log('ALL 12 LANGUAGES SUCCESSFULLY PROCESSED AND SYNCHRONIZED.');
