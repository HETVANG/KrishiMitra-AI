import { MarketPriceHistory } from '../../models/MarketPriceHistory';

export interface TrendAnalysisResult {
  period: '7d' | '30d' | '90d';
  trend: 'RISING' | 'FALLING' | 'STABLE' | 'MIXED' | 'INSUFFICIENT_DATA';
  volatility: 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_DATA';
  currentPrice: number | null;
  previousPrice: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  highestPrice: number | null;
  lowestPrice: number | null;
  averagePrice: number | null;
  dataPointsCount: number;
  explanation: string;
}

export class MarketTrendService {
  /**
   * Calculate price trend, percentage change, and volatility from MarketPriceHistory
   */
  static async analyzeTrend(
    crop: string,
    options: {
      state?: string;
      district?: string;
      market?: string;
      periodDays?: number;
    } = {}
  ): Promise<TrendAnalysisResult> {
    const periodDays = options.periodDays || 7;
    const periodKey: '7d' | '30d' | '90d' = periodDays >= 90 ? '90d' : periodDays >= 30 ? '30d' : '7d';

    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const filter: any = {
      crop: new RegExp(`^${crop}$`, 'i'),
      date: { $gte: startDate }
    };

    if (options.state) filter.state = new RegExp(`^${options.state}$`, 'i');
    if (options.district) filter.district = new RegExp(`^${options.district}$`, 'i');
    if (options.market) filter.market = new RegExp(`^${options.market}$`, 'i');

    try {
      const records = await MarketPriceHistory.find(filter)
        .sort({ date: 1 }) // Chronological order
        .lean();

      if (records.length < 2) {
        return {
          period: periodKey,
          trend: 'INSUFFICIENT_DATA',
          volatility: 'INSUFFICIENT_DATA',
          currentPrice: records[0]?.modalPrice || records[0]?.avgPrice || null,
          previousPrice: null,
          absoluteChange: null,
          percentageChange: null,
          highestPrice: records[0]?.maxPrice || records[0]?.modalPrice || null,
          lowestPrice: records[0]?.minPrice || records[0]?.modalPrice || null,
          averagePrice: records[0]?.avgPrice || records[0]?.modalPrice || null,
          dataPointsCount: records.length,
          explanation: `Not enough historical market records available over the selected ${periodDays}-day period for trend calculation.`
        };
      }

      const validPrices = records
        .map((r: any) => r.modalPrice || r.avgPrice)
        .filter((p: any) => typeof p === 'number' && p > 0);

      if (validPrices.length < 2) {
        return {
          period: periodKey,
          trend: 'INSUFFICIENT_DATA',
          volatility: 'INSUFFICIENT_DATA',
          currentPrice: null,
          previousPrice: null,
          absoluteChange: null,
          percentageChange: null,
          highestPrice: null,
          lowestPrice: null,
          averagePrice: null,
          dataPointsCount: records.length,
          explanation: 'Price history records exist but lack valid price values.'
        };
      }

      const firstPrice = validPrices[0];
      const lastPrice = validPrices[validPrices.length - 1];
      const absoluteChange = lastPrice - firstPrice;
      const percentageChange = Number(((absoluteChange / firstPrice) * 100).toFixed(2));

      // Compute statistics
      const highestPrice = Math.max(...validPrices);
      const lowestPrice = Math.min(...validPrices);
      const averagePrice = Number((validPrices.reduce((a, b) => a + b, 0) / validPrices.length).toFixed(2));

      // Trend classification
      let trend: 'RISING' | 'FALLING' | 'STABLE' | 'MIXED' = 'STABLE';
      if (percentageChange > 2) {
        trend = 'RISING';
      } else if (percentageChange < -2) {
        trend = 'FALLING';
      } else {
        trend = 'STABLE';
      }

      // Volatility calculation (Standard deviation relative to average)
      const variance = validPrices.reduce((sum, p) => sum + Math.pow(p - averagePrice, 2), 0) / validPrices.length;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / averagePrice) * 100; // Coefficient of Variation %

      let volatility: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
      if (cv > 15) {
        volatility = 'HIGH';
      } else if (cv > 6) {
        volatility = 'MODERATE';
      }

      let explanation = '';
      if (trend === 'RISING') {
        explanation = `Current market data shows an upward movement of +${percentageChange}% (+₹${absoluteChange}/Qtl) over the last ${periodDays} days.`;
      } else if (trend === 'FALLING') {
        explanation = `Current market data shows a downward movement of ${percentageChange}% (₹${absoluteChange}/Qtl) over the last ${periodDays} days.`;
      } else {
        explanation = `Prices have remained relatively stable (${percentageChange}%) over the last ${periodDays} days.`;
      }

      if (volatility === 'HIGH') {
        explanation += ` Price volatility is elevated (fluctuation range: ₹${lowestPrice} to ₹${highestPrice}).`;
      }

      return {
        period: periodKey,
        trend,
        volatility,
        currentPrice: lastPrice,
        previousPrice: firstPrice,
        absoluteChange,
        percentageChange,
        highestPrice,
        lowestPrice,
        averagePrice,
        dataPointsCount: validPrices.length,
        explanation
      };
    } catch (err) {
      console.warn('[MarketTrendService] Analysis error:', err);
      return {
        period: periodKey,
        trend: 'INSUFFICIENT_DATA',
        volatility: 'INSUFFICIENT_DATA',
        currentPrice: null,
        previousPrice: null,
        absoluteChange: null,
        percentageChange: null,
        highestPrice: null,
        lowestPrice: null,
        averagePrice: null,
        dataPointsCount: 0,
        explanation: 'Historical price analysis encountered an error.'
      };
    }
  }
}
