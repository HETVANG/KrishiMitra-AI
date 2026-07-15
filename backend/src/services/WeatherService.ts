import axios from 'axios';
import { Weather } from '../models/Weather';

const apiKey = process.env.OPENWEATHER_API_KEY;

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    rainProb: number;
    aqi: number;
    condition: string;
    description: string;
  };
  forecast: Array<{
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    rainProb: number;
  }>;
  alerts: Array<{
    type: 'heatwave' | 'frost' | 'storm' | 'rain' | 'wind' | 'none';
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
  aiAdvice: string;
}

// Localized weather warning alerts and advisories
const weatherAdvisories: Record<string, {
  criticalHeat: string;
  criticalFrost: string;
  warningStorm: string;
  warningRain: string;
  infoNone: string;
  adviceRain: string;
  adviceHeat: string;
  adviceOptimal: string;
  weatherReport: string;
}> = {
  en: {
    criticalHeat: 'Severe Heatwave Warning! Maintain high irrigation rates, protect crops using shade netting where possible.',
    criticalFrost: 'Ground Frost Hazard! Ground temperature is critically low. Implement light watering or mulching to insulate roots.',
    warningStorm: 'High Wind speed! Provide stakes for tall crops like sugarcane and avoid spraying liquid pesticides.',
    warningRain: 'Heavy rain probability detected! Clear drainage paths in fields immediately to prevent crop waterlogging.',
    infoNone: 'No severe weather alerts. Ideal conditions for standard field operations.',
    adviceRain: 'Rainfall is expected. Postpone irrigation activities to save water. Hold off on pesticide sprays as rain will wash it away.',
    adviceHeat: 'Temperatures are high today. Schedule irrigation early in the morning. Inspect crops for moisture stress signs.',
    adviceOptimal: 'Weather conditions are stable and favorable. Ideal time for applying nitrogen fertilizer, sowing seeds, or manual weeding.',
    weatherReport: 'weather conditions clear'
  },
  hi: {
    criticalHeat: 'गंभीर लू की चेतावनी! सिंचाई की दर उच्च रखें, जहां संभव हो छायादार जाली का उपयोग करके फसलों की रक्षा करें।',
    criticalFrost: 'पाला पड़ने का खतरा! जमीनी तापमान गंभीर रूप से कम है। जड़ों को बचाने के लिए हल्की सिंचाई या मल्चिंग करें।',
    warningStorm: 'तेज हवा की गति! गन्ना जैसी लंबी फसलों को सहारा दें और तरल कीटनाशकों के छिड़काव से बचें।',
    warningRain: 'भारी बारिश की संभावना! जलभराव से बचने के लिए खेतों में जल निकासी के रास्ते तुरंत साफ करें।',
    infoNone: 'कोई गंभीर मौसम चेतावनी नहीं। सामान्य कृषि कार्यों के लिए आदर्श परिस्थितियां।',
    adviceRain: 'बारिश होने की उम्मीद है। पानी बचाने के लिए सिंचाई कार्य स्थगित करें। कीटनाशकों का छिड़काव रोकें क्योंकि बारिश इसे धो देगी।',
    adviceHeat: 'आज तापमान अधिक है। सुबह जल्दी सिंचाई की योजना बनाएं। फसलों में नमी के तनाव के संकेतों की जांच करें।',
    adviceOptimal: 'मौसम की स्थिति स्थिर और अनुकूल है। नाइट्रोजन उर्वरक डालने, बीज बोने या निराई-गुड़ाई करने का आदर्श समय।',
    weatherReport: 'मौसम साफ रहेगा'
  },
  gu: {
    criticalHeat: 'અતિશય ગરમીની ચેતવણી! પિયતનું પ્રમાણ વધારો, શક્ય હોય ત્યાં શેડ નેટનો ઉપયોગ કરીને પાકનું રક્ષણ કરો.',
    criticalFrost: 'ઝાકળ અને ઠંડીનો ખતરો! જમીનનું તાપમાન ખૂબ નીચું છે. મૂળને બચાવવા માટે હળવું પિયત આપો અથવા મલ્ચિંગ કરો.',
    warningStorm: 'પવનની તીવ્ર ઝડપ! શેરડી જેવા ઊંચા પાકને ટેકો આપો અને પ્રવાહી જંતુનાશકોનો છંટકાવ ટાળો.',
    warningRain: 'ભારે વરસાદની ચેતવણી! ખેતરમાં પાણી ભરાઈ ન જાય તે માટે નિકાસની જગ્યાઓ તાત્કાલિક સાફ કરો.',
    infoNone: 'હવામાનની કોઈ ગંભીર ચેતવણી નથી. ખેતી કાર્યો માટે અનુકૂળ હવામાન.',
    adviceRain: 'વરસાદની સંભાવના છે. પિયત આપવાનું બંધ રાખો. જંતુનાશક દવા ન છાંટવી કારણ કે વરસાદથી ધોવાઈ જશે.',
    adviceHeat: 'આજે તાપમાન ઊંચું છે. સવારે વહેલા પિયત આપવાનું આયોજન કરો. પાકમાં ભેજની અછત તપાસો.',
    adviceOptimal: 'હવામાન અનુકૂળ અને સ્થિર છે. ખાતર આપવા, વાવણી કરવા અથવા નીંદણ કરવા માટે ઉત્તમ સમય.',
    weatherReport: 'હવામાન ચોખ્ખું રહેશે'
  }
};

export class WeatherService {
  private static getAdvisoryToken(language: string) {
    const code = (language || 'en').toLowerCase().slice(0, 2);
    return weatherAdvisories[code] || weatherAdvisories.en;
  }

  static async getWeatherData(lat: number, lon: number, language: string = 'en'): Promise<WeatherData> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    try {
      const cached = await Weather.findOne({
        latitude: lat,
        longitude: lon,
        updatedAt: { $gte: oneHourAgo }
      });

      if (cached) {
        console.log(`[Weather Service] Cache Hit for coordinates (${lat}, ${lon})`);
        const weatherData = cached.forecastData as WeatherData;
        
        // Translate Cached Advice dynamically to target language
        const tokens = this.getAdvisoryToken(language);
        const temp = weatherData.current.temp;
        const condition = weatherData.current.condition;
        
        // Recompute alerts and advice in target language
        weatherData.alerts = this.computeAlerts(temp, weatherData.current.windSpeed, weatherData.current.humidity, weatherData.current.rainProb, language);
        weatherData.aiAdvice = this.generateAiWeatherAdvice(temp, condition, weatherData.alerts, language);
        return weatherData;
      }
    } catch (dbError) {
      console.warn(`[Weather Cache Warning] Failed to query cache database: ${dbError}`);
    }

    let weatherResult: WeatherData;

    if (apiKey) {
      try {
        console.log(`[Weather Service] Live OpenWeather request for (${lat}, ${lon})`);
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        const [currRes, foreRes] = await Promise.all([
          axios.get(currentUrl),
          axios.get(forecastUrl)
        ]);

        const currData = currRes.data;
        const foreList = foreRes.data.list;

        const temp = currData.main.temp;
        const humidity = currData.main.humidity;
        const windSpeed = currData.wind.speed;
        const rainProb = currData.rain ? 80 : 10;
        const condition = currData.weather[0].main;
        const description = currData.weather[0].description;

        const dailyForecast: any[] = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 0; i < foreList.length; i += 8) {
          const item = foreList[i];
          const date = new Date(item.dt * 1000);
          dailyForecast.push({
            day: daysOfWeek[date.getDay()],
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            condition: item.weather[0].main,
            rainProb: item.pop ? Math.round(item.pop * 100) : 15
          });
        }

        const alerts = this.computeAlerts(temp, windSpeed, humidity, rainProb, language);
        const aiAdvice = this.generateAiWeatherAdvice(temp, condition, alerts, language);

        weatherResult = {
          current: {
            temp: Math.round(temp),
            humidity,
            windSpeed: Number(windSpeed.toFixed(1)),
            rainProb,
            aqi: 45,
            condition,
            description
          },
          forecast: dailyForecast.slice(0, 7),
          alerts,
          aiAdvice
        };

      } catch (error) {
        console.error('[Weather Service Live Error] Falling back to Mock weather engines:', error);
        weatherResult = this.generateMockWeatherData(lat, lon, language);
      }
    } else {
      weatherResult = this.generateMockWeatherData(lat, lon, language);
    }

    // Cache the result in MongoDB
    try {
      await Weather.findOneAndUpdate(
        { latitude: lat, longitude: lon },
        { latitude: lat, longitude: lon, forecastData: weatherResult },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (saveError) {
      console.error('[Weather Cache Error] Failed to write weather cache:', saveError);
    }

    return weatherResult;
  }

  private static computeAlerts(temp: number, windSpeed: number, humidity: number, rainProb: number, language: string): WeatherData['alerts'] {
    const alerts: WeatherData['alerts'] = [];
    const tokens = this.getAdvisoryToken(language);

    if (temp > 40) {
      alerts.push({
        type: 'heatwave',
        severity: 'critical',
        message: tokens.criticalHeat
      });
    } else if (temp < 5) {
      alerts.push({
        type: 'frost',
        severity: 'critical',
        message: tokens.criticalFrost
      });
    }

    if (windSpeed > 12) {
      alerts.push({
        type: 'storm',
        severity: 'warning',
        message: tokens.warningStorm
      });
    }

    if (rainProb > 75) {
      alerts.push({
        type: 'rain',
        severity: 'warning',
        message: tokens.warningRain
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'none',
        severity: 'info',
        message: tokens.infoNone
      });
    }

    return alerts;
  }

  private static generateMockWeatherData(lat: number, lon: number, language: string): WeatherData {
    const seed = Math.abs(Math.sin(lat) * Math.cos(lon));
    const baseTemp = 25 + Math.round(seed * 15);
    const humidity = 40 + Math.round(seed * 50);
    const windSpeed = 2 + Number((seed * 12).toFixed(1));
    const rainProb = Math.round(seed * 100);

    const condition = rainProb > 60 ? 'Rain' : rainProb > 30 ? 'Clouds' : 'Clear';
    const tokens = this.getAdvisoryToken(language);
    const description = tokens.weatherReport;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const forecast: WeatherData['forecast'] = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      const tMin = baseTemp - 5 - Math.round(Math.random() * 3);
      const tMax = baseTemp + 2 + Math.round(Math.random() * 4);
      forecast.push({
        day: daysOfWeek[dayIndex],
        tempMin: tMin,
        tempMax: tMax,
        condition: i === 0 ? condition : Math.random() > 0.5 ? 'Clear' : 'Clouds',
        rainProb: Math.max(0, Math.min(100, rainProb + Math.round((Math.random() - 0.5) * 30)))
      });
    }

    const alerts = this.computeAlerts(baseTemp, windSpeed, humidity, rainProb, language);
    const aiAdvice = this.generateAiWeatherAdvice(baseTemp, condition, alerts, language);

    return {
      current: {
        temp: baseTemp,
        humidity,
        windSpeed,
        rainProb,
        aqi: Math.round(30 + seed * 80),
        condition,
        description
      },
      forecast,
      alerts,
      aiAdvice
    };
  }

  private static generateAiWeatherAdvice(temp: number, condition: string, alerts: WeatherData['alerts'], language: string): string {
    const tokens = this.getAdvisoryToken(language);
    const hasCritical = alerts.some(a => a.severity === 'critical');
    
    if (hasCritical) {
      const criticalAlert = alerts.find(a => a.severity === 'critical');
      return criticalAlert?.message || '';
    }

    if (condition === 'Rain') {
      return tokens.adviceRain;
    }

    if (temp > 35) {
      return tokens.adviceHeat;
    }

    return tokens.adviceOptimal;
  }
}
