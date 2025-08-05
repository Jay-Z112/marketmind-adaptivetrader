import { Position, OrderResult, StrategySignal } from '../mt5/types';

export interface Trade {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  openTime: number;
  closeTime?: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  commission: number;
  swap: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  strategy: string;
  comment: string;
}

export interface TradeSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalVolume: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  currentDrawdown: number;
}

/**
 * Trade Manager
 * Handles trade execution, tracking, and P&L calculation
 */
export class TradeManager {
  private trades: Map<string, Trade> = new Map();
  private tradeHistory: Trade[] = [];
  private subscribers: Function[] = [];

  /**
   * Execute a trading signal
   */
  async executeTrade(signal: StrategySignal): Promise<OrderResult> {
    try {
      console.log('Executing trade signal:', signal);

      // Generate unique trade ID
      const tradeId = `${signal.symbol}_${Date.now()}`;
      
      // Create trade record
      const trade: Trade = {
        id: tradeId,
        ticket: Math.floor(Math.random() * 1000000), // Mock ticket number
        symbol: signal.symbol,
        type: signal.action as 'BUY' | 'SELL',
        volume: this.calculateVolume(signal),
        openPrice: signal.entry,
        currentPrice: signal.entry,
        openTime: signal.timestamp,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        profit: 0,
        commission: -2.50, // Mock commission
        swap: 0,
        status: 'OPEN',
        strategy: signal.strategy,
        comment: `AI Signal - Confidence: ${(signal.confidence * 100).toFixed(1)}%`
      };

      // Store trade
      this.trades.set(tradeId, trade);
      
      // Notify subscribers
      this.notifySubscribers();

      // Simulate order execution
      return {
        success: true,
        ticket: trade.ticket,
        retcode: 10009 // TRADE_RETCODE_DONE
      };

    } catch (error) {
      console.error('Failed to execute trade:', error);
      return {
        success: false,
        error: 'Trade execution failed'
      };
    }
  }

  /**
   * Close a trade
   */
  async closeTrade(tradeId: string): Promise<OrderResult> {
    const trade = this.trades.get(tradeId);
    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    try {
      // Calculate final profit
      const finalProfit = this.calculateProfit(trade);
      
      // Update trade
      trade.status = 'CLOSED';
      trade.closeTime = Date.now();
      trade.profit = finalProfit;

      // Move to history
      this.tradeHistory.push({ ...trade });
      this.trades.delete(tradeId);

      // Notify subscribers
      this.notifySubscribers();

      return {
        success: true,
        ticket: trade.ticket
      };

    } catch (error) {
      console.error('Failed to close trade:', error);
      return {
        success: false,
        error: 'Trade closure failed'
      };
    }
  }

  /**
   * Update trade prices (called by market data feed)
   */
  updateTradePrices(symbol: string, bid: number, ask: number): void {
    for (const trade of this.trades.values()) {
      if (trade.symbol === symbol) {
        trade.currentPrice = trade.type === 'BUY' ? bid : ask;
        trade.profit = this.calculateProfit(trade);
        
        // Check for SL/TP hits
        this.checkStopLevels(trade);
      }
    }
    this.notifySubscribers();
  }

  /**
   * Get all active trades
   */
  getActiveTrades(): Trade[] {
    return Array.from(this.trades.values());
  }

  /**
   * Get trade history
   */
  getTradeHistory(): Trade[] {
    return [...this.tradeHistory];
  }

  /**
   * Get trade summary statistics
   */
  getTradeSummary(): TradeSummary {
    const allTrades = [...this.tradeHistory];
    const closedTrades = allTrades.filter(t => t.status === 'CLOSED');
    
    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalVolume: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        currentDrawdown: 0
      };
    }

    const winners = closedTrades.filter(t => t.profit > 0);
    const losers = closedTrades.filter(t => t.profit < 0);
    
    const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalVolume = closedTrades.reduce((sum, t) => sum + t.volume, 0);
    
    const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + t.profit, 0) / winners.length : 0;
    const avgLoss = losers.length > 0 ? Math.abs(losers.reduce((sum, t) => sum + t.profit, 0) / losers.length) : 0;
    
    const grossProfit = winners.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    return {
      totalTrades: closedTrades.length,
      winningTrades: winners.length,
      losingTrades: losers.length,
      totalProfit,
      totalVolume,
      winRate: (winners.length / closedTrades.length) * 100,
      avgWin,
      avgLoss,
      profitFactor,
      maxDrawdown: this.calculateMaxDrawdown(closedTrades),
      currentDrawdown: this.calculateCurrentDrawdown()
    };
  }

  /**
   * Subscribe to trade updates
   */
  subscribe(callback: Function): void {
    this.subscribers.push(callback);
  }

  /**
   * Unsubscribe from trade updates
   */
  unsubscribe(callback: Function): void {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  private calculateVolume(signal: StrategySignal): number {
    // Simple position sizing - 1% risk per trade
    const riskPercent = 0.01;
    const accountBalance = 10000; // Mock balance
    const riskAmount = accountBalance * riskPercent;
    const stopDistance = Math.abs(signal.entry - signal.stopLoss);
    
    if (stopDistance === 0) return 0.01;
    
    const volume = riskAmount / (stopDistance * 100000); // Assuming 5-digit broker
    return Math.max(0.01, Math.min(1.0, Math.round(volume * 100) / 100));
  }

  private calculateProfit(trade: Trade): number {
    const pointValue = 10; // $10 per pip for standard lot
    const pips = trade.type === 'BUY' 
      ? (trade.currentPrice - trade.openPrice) * 100000
      : (trade.openPrice - trade.currentPrice) * 100000;
    
    return (pips * pointValue * trade.volume) + trade.commission + trade.swap;
  }

  private checkStopLevels(trade: Trade): void {
    if (trade.type === 'BUY') {
      if (trade.currentPrice <= trade.stopLoss || trade.currentPrice >= trade.takeProfit) {
        this.closeTrade(trade.id);
      }
    } else {
      if (trade.currentPrice >= trade.stopLoss || trade.currentPrice <= trade.takeProfit) {
        this.closeTrade(trade.id);
      }
    }
  }

  private calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let runningBalance = 0;

    for (const trade of trades) {
      runningBalance += trade.profit;
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const currentDrawdown = peak - runningBalance;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    }

    return maxDrawdown;
  }

  private calculateCurrentDrawdown(): number {
    const activeTrades = this.getActiveTrades();
    return activeTrades.reduce((sum, trade) => sum + Math.min(0, trade.profit), 0);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
}

// Singleton instance
export const tradeManager = new TradeManager();