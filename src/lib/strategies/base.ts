import { OHLC, StrategySignal, MarketData } from '../mt5/types';

/**
 * Base class for all trading strategies
 */
export abstract class BaseStrategy {
  protected name: string;
  protected timeframe: string;
  protected symbols: string[];
  protected isActive: boolean = false;
  protected performance: StrategyPerformance;

  constructor(name: string, timeframe: string = 'M15', symbols: string[] = []) {
    this.name = name;
    this.timeframe = timeframe;
    this.symbols = symbols;
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0
    };
  }

  /**
   * Abstract method to be implemented by each strategy
   */
  abstract analyze(symbol: string, ohlc: OHLC[], marketData: MarketData): StrategySignal | null;

  /**
   * Get strategy name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get supported timeframe
   */
  getTimeframe(): string {
    return this.timeframe;
  }

  /**
   * Get supported symbols
   */
  getSymbols(): string[] {
    return this.symbols;
  }

  /**
   * Check if strategy is active
   */
  isStrategyActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate strategy
   */
  activate(): void {
    this.isActive = true;
    console.log(`Strategy ${this.name} activated`);
  }

  /**
   * Deactivate strategy
   */
  deactivate(): void {
    this.isActive = false;
    console.log(`Strategy ${this.name} deactivated`);
  }

  /**
   * Update strategy performance
   */
  updatePerformance(trade: TradeResult): void {
    this.performance.totalTrades++;
    
    if (trade.profit > 0) {
      this.performance.winningTrades++;
      this.performance.avgWin = 
        (this.performance.avgWin * (this.performance.winningTrades - 1) + trade.profit) / 
        this.performance.winningTrades;
    } else {
      this.performance.losingTrades++;
      this.performance.avgLoss = 
        (this.performance.avgLoss * (this.performance.losingTrades - 1) + Math.abs(trade.profit)) / 
        this.performance.losingTrades;
    }

    this.performance.totalProfit += trade.profit;
    this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
    
    if (this.performance.avgLoss > 0) {
      this.performance.profitFactor = this.performance.avgWin / this.performance.avgLoss;
    }

    // Update max drawdown if current loss exceeds previous maximum
    if (trade.profit < 0 && Math.abs(trade.profit) > this.performance.maxDrawdown) {
      this.performance.maxDrawdown = Math.abs(trade.profit);
    }
  }

  /**
   * Get strategy performance metrics
   */
  getPerformance(): StrategyPerformance {
    return { ...this.performance };
  }

  /**
   * Reset strategy performance
   */
  resetPerformance(): void {
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0
    };
  }

  /**
   * Validate signal before execution
   */
  protected validateSignal(signal: StrategySignal): boolean {
    // Basic validation
    if (!signal.symbol || !signal.action || signal.confidence < 0.5) {
      return false;
    }

    // Check risk-reward ratio
    const riskReward = Math.abs(signal.takeProfit - signal.entry) / Math.abs(signal.entry - signal.stopLoss);
    if (riskReward < 1.5) {
      return false;
    }

    return true;
  }

  /**
   * Calculate technical indicators (helper methods)
   */
  protected calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  protected calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const k = 2 / (period + 1);
    
    ema[0] = data[0];
    for (let i = 1; i < data.length; i++) {
      ema[i] = data[i] * k + ema[i - 1] * (1 - k);
    }
    return ema;
  }

  protected calculateRSI(data: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const changes = data.slice(1).map((price, i) => price - data[i]);
    
    for (let i = period; i < changes.length; i++) {
      const gains = changes.slice(i - period, i).filter(change => change > 0);
      const losses = changes.slice(i - period, i).filter(change => change < 0).map(loss => Math.abs(loss));
      
      const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
      const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;
      
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  }

  protected findPivotHighs(highs: number[], leftBars: number = 2, rightBars: number = 2): number[] {
    const pivots: number[] = [];
    
    for (let i = leftBars; i < highs.length - rightBars; i++) {
      let isPivot = true;
      
      // Check left side
      for (let j = i - leftBars; j < i; j++) {
        if (highs[j] >= highs[i]) {
          isPivot = false;
          break;
        }
      }
      
      // Check right side
      if (isPivot) {
        for (let j = i + 1; j <= i + rightBars; j++) {
          if (highs[j] >= highs[i]) {
            isPivot = false;
            break;
          }
        }
      }
      
      pivots.push(isPivot ? highs[i] : 0);
    }
    
    return pivots;
  }

  protected findPivotLows(lows: number[], leftBars: number = 2, rightBars: number = 2): number[] {
    const pivots: number[] = [];
    
    for (let i = leftBars; i < lows.length - rightBars; i++) {
      let isPivot = true;
      
      // Check left side
      for (let j = i - leftBars; j < i; j++) {
        if (lows[j] <= lows[i]) {
          isPivot = false;
          break;
        }
      }
      
      // Check right side
      if (isPivot) {
        for (let j = i + 1; j <= i + rightBars; j++) {
          if (lows[j] <= lows[i]) {
            isPivot = false;
            break;
          }
        }
      }
      
      pivots.push(isPivot ? lows[i] : 0);
    }
    
    return pivots;
  }
}

export interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface TradeResult {
  symbol: string;
  strategy: string;
  entry: number;
  exit: number;
  profit: number;
  duration: number;
  timestamp: number;
}