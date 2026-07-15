import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WeatherService } from '../services/WeatherService';
import { WeatherHistory } from '../models/WeatherHistory';

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
}
