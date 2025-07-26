import { BaseStrategy } from './base';
import { OHLC, StrategySignal, MarketData } from '../mt5/types';

/**
 * Smart Money Concepts (SMC) Strategy
 * Focuses on institutional trading patterns, order blocks, and liquidity zones
 */
export class SMCStrategy extends BaseStrategy {
  private orderBlocks: OrderBlock[] = [];
  private liquidityZones: LiquidityZone[] = [];
  private fairValueGaps: FairValueGap[] = [];

  constructor() {
    super('SMC (Smart Money)', 'M15', ['EURUSD', 'GBPUSD', 'USDCAD', 'AUDUSD']);
  }

  /**
   * Analyze market using Smart Money Concepts
   */
  analyze(symbol: string, ohlc: OHLC[], marketData: MarketData): StrategySignal | null {
    if (!this.isActive || ohlc.length < 50) return null;

    try {
      // Update market structure analysis
      this.updateOrderBlocks(ohlc);
      this.updateLiquidityZones(ohlc);
      this.updateFairValueGaps(ohlc);

      const currentPrice = marketData.bid;
      const latest = ohlc[ohlc.length - 1];
      
      // Check for valid order block interaction
      const orderBlockSignal = this.checkOrderBlockEntry(currentPrice, ohlc);
      if (orderBlockSignal) {
        orderBlockSignal.symbol = symbol;
        orderBlockSignal.strategy = this.name;
        orderBlockSignal.timestamp = Date.now();
        
        if (this.validateSignal(orderBlockSignal)) {
          return orderBlockSignal;
        }
      }

      // Check for liquidity grab and reversal
      const liquiditySignal = this.checkLiquidityGrabReversal(currentPrice, ohlc);
      if (liquiditySignal) {
        liquiditySignal.symbol = symbol;
        liquiditySignal.strategy = this.name;
        liquiditySignal.timestamp = Date.now();
        
        if (this.validateSignal(liquiditySignal)) {
          return liquiditySignal;
        }
      }

      // Check for Fair Value Gap fills
      const fvgSignal = this.checkFairValueGapFill(currentPrice, ohlc);
      if (fvgSignal) {
        fvgSignal.symbol = symbol;
        fvgSignal.strategy = this.name;
        fvgSignal.timestamp = Date.now();
        
        if (this.validateSignal(fvgSignal)) {
          return fvgSignal;
        }
      }

      return null;
    } catch (error) {
      console.error('SMC Strategy analysis error:', error);
      return null;
    }
  }

  /**
   * Identify and update order blocks
   */
  private updateOrderBlocks(ohlc: OHLC[]): void {
    this.orderBlocks = [];
    
    for (let i = 10; i < ohlc.length - 5; i++) {
      const current = ohlc[i];
      const prev = ohlc[i - 1];
      const next = ohlc[i + 1];

      // Bullish Order Block (strong rejection from low)
      if (this.isBullishOrderBlock(ohlc, i)) {
        this.orderBlocks.push({
          type: 'bullish',
          high: current.high,
          low: current.low,
          index: i,
          strength: this.calculateOrderBlockStrength(ohlc, i, 'bullish'),
          tested: false
        });
      }

      // Bearish Order Block (strong rejection from high)
      if (this.isBearishOrderBlock(ohlc, i)) {
        this.orderBlocks.push({
          type: 'bearish',
          high: current.high,
          low: current.low,
          index: i,
          strength: this.calculateOrderBlockStrength(ohlc, i, 'bearish'),
          tested: false
        });
      }
    }

    // Keep only the most recent and strong order blocks
    this.orderBlocks = this.orderBlocks
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
  }

  /**
   * Check if current bar forms a bullish order block
   */
  private isBullishOrderBlock(ohlc: OHLC[], index: number): boolean {
    const current = ohlc[index];
    const lookback = 3;
    const lookahead = 3;

    // Strong bullish candle with long lower wick
    const bodySize = Math.abs(current.close - current.open);
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const upperWick = current.high - Math.max(current.open, current.close);

    if (lowerWick < bodySize * 0.5 || current.close <= current.open) {
      return false;
    }

    // Check for subsequent bullish movement
    let bullishMove = 0;
    for (let i = index + 1; i < Math.min(index + lookahead + 1, ohlc.length); i++) {
      if (ohlc[i].close > current.high) {
        bullishMove++;
      }
    }

    return bullishMove >= 2;
  }

  /**
   * Check if current bar forms a bearish order block
   */
  private isBearishOrderBlock(ohlc: OHLC[], index: number): boolean {
    const current = ohlc[index];
    const lookback = 3;
    const lookahead = 3;

    // Strong bearish candle with long upper wick
    const bodySize = Math.abs(current.close - current.open);
    const upperWick = current.high - Math.max(current.open, current.close);
    const lowerWick = Math.min(current.open, current.close) - current.low;

    if (upperWick < bodySize * 0.5 || current.close >= current.open) {
      return false;
    }

    // Check for subsequent bearish movement
    let bearishMove = 0;
    for (let i = index + 1; i < Math.min(index + lookahead + 1, ohlc.length); i++) {
      if (ohlc[i].close < current.low) {
        bearishMove++;
      }
    }

    return bearishMove >= 2;
  }

  /**
   * Calculate order block strength
   */
  private calculateOrderBlockStrength(ohlc: OHLC[], index: number, type: 'bullish' | 'bearish'): number {
    let strength = 0;
    const current = ohlc[index];

    // Volume factor (if available)
    strength += current.volume > 1000 ? 20 : 10;

    // Wick size factor
    const bodySize = Math.abs(current.close - current.open);
    const wickSize = type === 'bullish' 
      ? Math.min(current.open, current.close) - current.low
      : current.high - Math.max(current.open, current.close);

    strength += (wickSize / bodySize) * 30;

    // Time factor (more recent = stronger)
    const recency = (ohlc.length - index) / ohlc.length;
    strength += recency * 20;

    return Math.min(strength, 100);
  }

  /**
   * Update liquidity zones
   */
  private updateLiquidityZones(ohlc: OHLC[]): void {
    this.liquidityZones = [];
    
    const highs = ohlc.map(bar => bar.high);
    const lows = ohlc.map(bar => bar.low);
    
    const pivotHighs = this.findPivotHighs(highs, 3, 3);
    const pivotLows = this.findPivotLows(lows, 3, 3);

    // Identify liquidity zones around pivot points
    for (let i = 0; i < pivotHighs.length; i++) {
      if (pivotHighs[i] > 0) {
        this.liquidityZones.push({
          type: 'resistance',
          level: pivotHighs[i],
          strength: this.calculateLiquidityStrength(ohlc, i + 3, pivotHighs[i]),
          touches: 1
        });
      }
    }

    for (let i = 0; i < pivotLows.length; i++) {
      if (pivotLows[i] > 0) {
        this.liquidityZones.push({
          type: 'support',
          level: pivotLows[i],
          strength: this.calculateLiquidityStrength(ohlc, i + 3, pivotLows[i]),
          touches: 1
        });
      }
    }
  }

  /**
   * Calculate liquidity zone strength
   */
  private calculateLiquidityStrength(ohlc: OHLC[], index: number, level: number): number {
    let touches = 0;
    let strength = 0;

    // Count how many times price touched this level
    for (let i = index + 1; i < ohlc.length; i++) {
      if (Math.abs(ohlc[i].high - level) < level * 0.001 || 
          Math.abs(ohlc[i].low - level) < level * 0.001) {
        touches++;
      }
    }

    strength = touches * 25;
    return Math.min(strength, 100);
  }

  /**
   * Update Fair Value Gaps
   */
  private updateFairValueGaps(ohlc: OHLC[]): void {
    this.fairValueGaps = [];

    for (let i = 1; i < ohlc.length - 1; i++) {
      const prev = ohlc[i - 1];
      const current = ohlc[i];
      const next = ohlc[i + 1];

      // Bullish FVG: gap between prev high and next low
      if (prev.high < next.low && current.close > current.open) {
        this.fairValueGaps.push({
          type: 'bullish',
          top: next.low,
          bottom: prev.high,
          index: i,
          filled: false
        });
      }

      // Bearish FVG: gap between prev low and next high
      if (prev.low > next.high && current.close < current.open) {
        this.fairValueGaps.push({
          type: 'bearish',
          top: prev.low,
          bottom: next.high,
          index: i,
          filled: false
        });
      }
    }
  }

  /**
   * Check for order block entry signals
   */
  private checkOrderBlockEntry(currentPrice: number, ohlc: OHLC[]): StrategySignal | null {
    for (const orderBlock of this.orderBlocks) {
      if (orderBlock.tested) continue;

      const tolerance = (orderBlock.high - orderBlock.low) * 0.1;

      if (orderBlock.type === 'bullish' && 
          currentPrice >= orderBlock.low - tolerance && 
          currentPrice <= orderBlock.high + tolerance) {
        
        return {
          symbol: '',
          action: 'BUY',
          confidence: orderBlock.strength / 100,
          entry: currentPrice,
          stopLoss: orderBlock.low - (orderBlock.high - orderBlock.low) * 0.2,
          takeProfit: currentPrice + (currentPrice - orderBlock.low) * 2,
          strategy: this.name,
          timestamp: 0
        };
      }

      if (orderBlock.type === 'bearish' && 
          currentPrice >= orderBlock.low - tolerance && 
          currentPrice <= orderBlock.high + tolerance) {
        
        return {
          symbol: '',
          action: 'SELL',
          confidence: orderBlock.strength / 100,
          entry: currentPrice,
          stopLoss: orderBlock.high + (orderBlock.high - orderBlock.low) * 0.2,
          takeProfit: currentPrice - (orderBlock.high - currentPrice) * 2,
          strategy: this.name,
          timestamp: 0
        };
      }
    }

    return null;
  }

  /**
   * Check for liquidity grab and reversal
   */
  private checkLiquidityGrabReversal(currentPrice: number, ohlc: OHLC[]): StrategySignal | null {
    const recent = ohlc.slice(-10);
    if (recent.length < 5) return null;

    // Look for liquidity grab (stop hunt)
    for (const zone of this.liquidityZones) {
      const tolerance = zone.level * 0.001;

      if (zone.type === 'resistance' && currentPrice > zone.level + tolerance) {
        // Price broke above resistance, look for reversal
        const lastBar = recent[recent.length - 1];
        if (lastBar.close < lastBar.open) { // Bearish reversal candle
          return {
            symbol: '',
            action: 'SELL',
            confidence: zone.strength / 100,
            entry: currentPrice,
            stopLoss: zone.level + zone.level * 0.002,
            takeProfit: currentPrice - (currentPrice - zone.level) * 1.5,
            strategy: this.name,
            timestamp: 0
          };
        }
      }

      if (zone.type === 'support' && currentPrice < zone.level - tolerance) {
        // Price broke below support, look for reversal
        const lastBar = recent[recent.length - 1];
        if (lastBar.close > lastBar.open) { // Bullish reversal candle
          return {
            symbol: '',
            action: 'BUY',
            confidence: zone.strength / 100,
            entry: currentPrice,
            stopLoss: zone.level - zone.level * 0.002,
            takeProfit: currentPrice + (zone.level - currentPrice) * 1.5,
            strategy: this.name,
            timestamp: 0
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for Fair Value Gap fill signals
   */
  private checkFairValueGapFill(currentPrice: number, ohlc: OHLC[]): StrategySignal | null {
    for (const fvg of this.fairValueGaps) {
      if (fvg.filled) continue;

      if (fvg.type === 'bullish' && 
          currentPrice >= fvg.bottom && 
          currentPrice <= fvg.top) {
        
        return {
          symbol: '',
          action: 'BUY',
          confidence: 0.75,
          entry: currentPrice,
          stopLoss: fvg.bottom - (fvg.top - fvg.bottom) * 0.5,
          takeProfit: currentPrice + (fvg.top - fvg.bottom) * 2,
          strategy: this.name,
          timestamp: 0
        };
      }

      if (fvg.type === 'bearish' && 
          currentPrice >= fvg.bottom && 
          currentPrice <= fvg.top) {
        
        return {
          symbol: '',
          action: 'SELL',
          confidence: 0.75,
          entry: currentPrice,
          stopLoss: fvg.top + (fvg.top - fvg.bottom) * 0.5,
          takeProfit: currentPrice - (fvg.top - fvg.bottom) * 2,
          strategy: this.name,
          timestamp: 0
        };
      }
    }

    return null;
  }
}

interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  index: number;
  strength: number;
  tested: boolean;
}

interface LiquidityZone {
  type: 'support' | 'resistance';
  level: number;
  strength: number;
  touches: number;
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  index: number;
  filled: boolean;
}
