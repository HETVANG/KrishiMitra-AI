import { Request, Response, NextFunction } from 'express';
import { MarketPrice } from '../models/MarketPrice';

export class MarketPriceController {
  /**
   * Search crop mandi prices
   */
  static async searchPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { state, district, crop } = req.query;

      // Live MongoDB Mode - Seed price list if empty
      const count = await MarketPrice.countDocuments();
      if (count === 0) {
        const seedPrices = [
          { state: 'Haryana', district: 'Karnal', mandiName: 'Karnal Mandi', crop: 'Wheat', minPrice: 2150, maxPrice: 2275, avgPrice: 2225 },
          { state: 'Haryana', district: 'Karnal', mandiName: 'Karnal Mandi', crop: 'Rice (Basmati)', minPrice: 3800, maxPrice: 4200, avgPrice: 4000 },
          { state: 'Punjab', district: 'Amritsar', mandiName: 'Amritsar Mandi', crop: 'Wheat', minPrice: 2125, maxPrice: 2300, avgPrice: 2215 },
          { state: 'Punjab', district: 'Amritsar', mandiName: 'Amritsar Mandi', crop: 'Paddy', minPrice: 1980, maxPrice: 2060, avgPrice: 2020 },
          { state: 'Uttar Pradesh', district: 'Hapur', mandiName: 'Hapur Mandi', crop: 'Mustard', minPrice: 5350, maxPrice: 5650, avgPrice: 5500 },
          { state: 'Gujarat', district: 'Rajkot', mandiName: 'Rajkot Mandi', crop: 'Cotton', minPrice: 6200, maxPrice: 6800, avgPrice: 6500 },
        ];
        await MarketPrice.insertMany(seedPrices);
      }

      const query: any = {};
      if (state) query.state = new RegExp(state as string, 'i');
      if (district) query.district = new RegExp(district as string, 'i');
      if (crop) query.crop = new RegExp(crop as string, 'i');

      const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(100);

      return res.json({
        success: true,
        prices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin-only CRUD to update pricing updates
   */
  static async updateMandiPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { state, district, mandiName, crop, minPrice, maxPrice, avgPrice } = req.body;

      const priceLog = await MarketPrice.create({
        state,
        district,
        mandiName,
        crop,
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
        avgPrice: Number(avgPrice),
        date: new Date(),
      });

      return res.status(201).json({
        success: true,
        priceLog,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns price history trends
   */
  static async getPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, district } = req.query;

      if (!crop || !district) {
        return res.status(400).json({ success: false, message: 'Crop and district are required query params.' });
      }

      // Live Mode
      const history = await MarketPrice.find({
        crop: new RegExp(crop as string, 'i'),
        district: new RegExp(district as string, 'i')
      }).sort({ date: 1 }).limit(30);

      if (history.length === 0) {
        const dummyHistory = [];
        const base = crop.toString().toLowerCase().includes('wheat') ? 2200 : 5000;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        
        for (let i = 0; i < months.length; i++) {
          const shift = Math.sin(i) * 150 + (Math.random() - 0.5) * 80;
          dummyHistory.push({
            date: months[i],
            avgPrice: Math.round(base + shift),
            minPrice: Math.round(base - 100 + shift),
            maxPrice: Math.round(base + 120 + shift),
            crop: crop.toString(),
            mandiName: `${district} Mandi`
          });
        }
        return res.json({ success: true, history: dummyHistory });
      }

      const formatted = history.map(h => ({
        date: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        avgPrice: h.avgPrice,
        minPrice: h.minPrice,
        maxPrice: h.maxPrice,
        crop: h.crop,
        mandiName: h.mandiName
      }));

      return res.json({
        success: true,
        history: formatted
      });
    } catch (error) {
      next(error);
    }
  }
}
