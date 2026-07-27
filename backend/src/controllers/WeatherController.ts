import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WeatherService } from '../services/WeatherService';
import { WeatherHistory } from '../models/WeatherHistory';
import axios from 'axios';

export class WeatherController {
  /**
   * Fetches weather telemetry and translates alerts and agricultural advices
   */
  static async getWeather(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { lat, lon } = req.query;
      const lang = req.query.lang || req.user?.settings?.language || 'en';

      if (!lat || !lon) {
        return res.status(400).json({ success: false, message: 'Latitude and Longitude query parameters are required.' });
      }

      const weather = await WeatherService.getWeatherData(
        Number(lat),
        Number(lon),
        lang as string
      );

      // Save weather history logs to MongoDB
      try {
        await WeatherHistory.create({
          latitude: Number(lat),
          longitude: Number(lon),
          temp: weather.current?.temp || 0,
          humidity: weather.current?.humidity || 0,
          description: weather.current?.description || ''
        });
      } catch (logErr) {
        console.warn('[Weather Log Warning] Failed to log query:', logErr);
      }

      return res.json({
        success: true,
        weather,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reverseGeocode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        try {
          const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
          const geoRes = await axios.get(url);
          if (geoRes.data && geoRes.data.length > 0) {
            const { name, state, country } = geoRes.data[0];
            return res.json({
              success: true,
              city: name,
              state: state || '',
              country
            });
          }
        } catch (apiErr) {
          console.warn('[Weather Controller] OpenWeather reverse geocode error:', apiErr);
        }
      }

      // Fallback to Nominatim
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
        const geoRes = await axios.get(url, {
          headers: { 'User-Agent': 'KrishiMitra-AI-Agent/1.0' }
        });
        if (geoRes.data) {
          const address = geoRes.data.address;
          const city = address.city || address.town || address.village || address.suburb || address.county || 'Detected Location';
          const state = address.state || '';
          return res.json({
            success: true,
            city,
            state,
            country: address.country_code?.toUpperCase() || 'IN'
          });
        }
      } catch (nomErr) {
        console.warn('[Weather Controller] Nominatim reverse geocode error:', nomErr);
      }

      return res.json({
        success: true,
        city: 'Detected Location',
        state: 'India',
        country: 'IN'
      });
    } catch (error) {
      next(error);
    }
  }

  static async geocode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required.' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        try {
          const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query as string)},IN&limit=5&appid=${apiKey}`;
          const geoRes = await axios.get(url);
          if (geoRes.data && geoRes.data.length > 0) {
            const suggestions = geoRes.data.map((item: any) => ({
              city: item.name,
              state: item.state || '',
              country: item.country,
              lat: item.lat,
              lon: item.lon
            }));
            return res.json({ success: true, suggestions });
          }
        } catch (apiErr) {
          console.warn('[Weather Controller] OpenWeather geocode error:', apiErr);
        }
      }

      // Fallback to Nominatim
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query as string)}&format=json&limit=5&countrycodes=in&accept-language=en`;
        const geoRes = await axios.get(url, {
          headers: { 'User-Agent': 'KrishiMitra-AI-Agent/1.0' }
        });
        if (geoRes.data && geoRes.data.length > 0) {
          const suggestions = geoRes.data.map((item: any) => {
            const parts = item.display_name.split(',');
            const city = parts[0] || 'Unknown';
            const state = parts[parts.length - 3]?.trim() || parts[parts.length - 2]?.trim() || '';
            return {
              city,
              state,
              country: 'IN',
              lat: Number(item.lat),
              lon: Number(item.lon)
            };
          });
          return res.json({ success: true, suggestions });
        }
      } catch (nomErr) {
        console.warn('[Weather Controller] Nominatim geocode error:', nomErr);
      }

      // Default static suggestions list for Indian farming regions
      const localSuggestions = [
        { city: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
        { city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
        { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
        { city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
        { city: 'Bathinda', state: 'Punjab', lat: 30.2110, lon: 74.9455 },
        { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
        { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
        { city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
        { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 }
      ];

      const filtered = localSuggestions.filter(item =>
        item.city.toLowerCase().includes((query as string).toLowerCase()) ||
        item.state.toLowerCase().includes((query as string).toLowerCase())
      );

      return res.json({
        success: true,
        suggestions: filtered.map(item => ({ ...item, country: 'IN' }))
      });
    } catch (error) {
      next(error);
    }
  }
}
