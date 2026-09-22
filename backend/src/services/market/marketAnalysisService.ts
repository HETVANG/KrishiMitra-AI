import { GeminiService } from '../GeminiService';
import { TrendAnalysisResult } from './marketTrendService';
import { RegionalMarketComparison } from './marketComparisonService';

export class MarketAnalysisService {
  /**
   * Generate structured factual market explanation and advisory
   */
  static async generateMarketAdvisory(
    commodity: string,
    trend: TrendAnalysisResult,
    comparison: RegionalMarketComparison,
    language: string = 'en'
  ): Promise<{
    summary: string;
    keyInsights: string[];
    sellingConsiderations: string[];
    disclaimer: string;
  }> {
    const currentPriceStr = trend.currentPrice ? `₹${trend.currentPrice}/Quintal` : 'Price data unavailable';
    const trendStr = trend.trend;
    const changeStr = trend.percentageChange !== null ? `${trend.percentageChange > 0 ? '+' : ''}${trend.percentageChange}%` : 'N/A';

    // Factual rule-based fallback insights
    const keyInsights: string[] = [];
    const sellingConsiderations: string[] = [];

    if (trend.trend === 'RISING') {
      keyInsights.push(`Current market data indicates an upward price movement (+${changeStr}) over the last ${trend.period}.`);
    } else if (trend.trend === 'FALLING') {
      keyInsights.push(`Current market data indicates a downward price movement (${changeStr}) over the last ${trend.period}.`);
    } else {
      keyInsights.push(`Prices for ${commodity} have remained relatively stable over the selected period.`);
    }

    if (comparison.highestMarket && comparison.lowestMarket && comparison.highestPrice && comparison.lowestPrice) {
      const spread = comparison.highestPrice - comparison.lowestPrice;
      keyInsights.push(`Price spread across nearby markets is ₹${spread}/Qtl (Highest: ${comparison.highestMarket} at ₹${comparison.highestPrice}, Lowest: ${comparison.lowestMarket} at ₹${comparison.lowestPrice}).`);
    }

    sellingConsiderations.push('Evaluate transportation and loading costs relative to mandi price differences before choosing a destination market.');
    sellingConsiderations.push('Ensure crop moisture content meets standard Mandi FAQ grades for maximum price realization.');
    sellingConsiderations.push('Note: Future price direction remains subject to market supply-demand shifts and local weather events.');

    const summary = `${commodity} is currently trading at an average modal price of ${currentPriceStr}. Market trend over the past ${trend.period} is classified as ${trendStr} (${changeStr}).`;
    const disclaimer = 'Market prices are based on reported government mandi data. Future price movements are uncertain. Farmers should verify live rates at the physical mandi before dispatching crops.';

    return {
      summary,
      keyInsights,
      sellingConsiderations,
      disclaimer
    };
  }
}
