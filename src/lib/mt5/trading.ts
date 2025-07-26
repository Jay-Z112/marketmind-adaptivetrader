import { mt5Connection } from './connection';
import { OrderRequest, OrderResult, Position, PositionType, OrderType, OrderAction } from './types';

/**
 * MT5 Trading Manager
 * Handles order execution, position management, and trade operations
 */
export class MT5Trading {
  private magicNumber: number;

  constructor(magicNumber: number = 12345) {
    this.magicNumber = magicNumber;
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    volume: number,
    type: PositionType,
    stopLoss?: number,
    takeProfit?: number,
    comment?: string
  ): Promise<OrderResult> {
    try {
      const orderRequest: OrderRequest = {
        action: OrderAction.DEAL,
        symbol,
        volume,
        type: type === PositionType.BUY ? OrderType.BUY : OrderType.SELL,
        stopLoss,
        takeProfit,
        comment: comment || `MarketMind-${Date.now()}`,
        magic: this.magicNumber
      };

      return await this.sendOrderRequest(orderRequest);
    } catch (error) {
      console.error('Error placing market order:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Place a pending order
   */
  async placePendingOrder(
    symbol: string,
    volume: number,
    type: OrderType,
    price: number,
    stopLoss?: number,
    takeProfit?: number,
    comment?: string
  ): Promise<OrderResult> {
    try {
      const orderRequest: OrderRequest = {
        action: OrderAction.PENDING,
        symbol,
        volume,
        type,
        price,
        stopLoss,
        takeProfit,
        comment: comment || `MarketMind-Pending-${Date.now()}`,
        magic: this.magicNumber
      };

      return await this.sendOrderRequest(orderRequest);
    } catch (error) {
      console.error('Error placing pending order:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Close position by ticket
   */
  async closePosition(ticket: number): Promise<OrderResult> {
    try {
      const positions = await mt5Connection.getPositions();
      const position = positions.find(p => p.ticket === ticket);
      
      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      const closeType = position.type === PositionType.BUY ? OrderType.SELL : OrderType.BUY;
      
      const orderRequest: OrderRequest = {
        action: OrderAction.DEAL,
        symbol: position.symbol,
        volume: position.volume,
        type: closeType,
        comment: `Close-${ticket}`,
        magic: this.magicNumber
      };

      return await this.sendOrderRequest(orderRequest);
    } catch (error) {
      console.error('Error closing position:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Close all positions for a symbol
   */
  async closeAllPositions(symbol?: string): Promise<OrderResult[]> {
    try {
      const positions = await mt5Connection.getPositions();
      const targetPositions = symbol 
        ? positions.filter(p => p.symbol === symbol)
        : positions;

      const results: OrderResult[] = [];
      
      for (const position of targetPositions) {
        const result = await this.closePosition(position.ticket);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error closing all positions:', error);
      return [{ success: false, error: String(error) }];
    }
  }

  /**
   * Modify position stop loss and take profit
   */
  async modifyPosition(
    ticket: number,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<OrderResult> {
    try {
      const positions = await mt5Connection.getPositions();
      const position = positions.find(p => p.ticket === ticket);
      
      if (!position) {
        return { success: false, error: 'Position not found' };
      }

      const orderRequest: OrderRequest = {
        action: OrderAction.SLTP,
        symbol: position.symbol,
        volume: position.volume,
        type: position.type === PositionType.BUY ? OrderType.BUY : OrderType.SELL,
        stopLoss: stopLoss || position.stopLoss,
        takeProfit: takeProfit || position.takeProfit,
        magic: this.magicNumber
      };

      return await this.sendOrderRequest(orderRequest);
    } catch (error) {
      console.error('Error modifying position:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get total profit/loss
   */
  async getTotalPL(): Promise<number> {
    try {
      const positions = await mt5Connection.getPositions();
      return positions.reduce((total, pos) => total + pos.profit, 0);
    } catch (error) {
      console.error('Error getting total P/L:', error);
      return 0;
    }
  }

  /**
   * Get positions by symbol
   */
  async getPositionsBySymbol(symbol: string): Promise<Position[]> {
    try {
      const positions = await mt5Connection.getPositions();
      return positions.filter(p => p.symbol === symbol);
    } catch (error) {
      console.error('Error getting positions by symbol:', error);
      return [];
    }
  }

  /**
   * Check if symbol has open positions
   */
  async hasOpenPositions(symbol: string): Promise<boolean> {
    const positions = await this.getPositionsBySymbol(symbol);
    return positions.length > 0;
  }

  /**
   * Calculate position size based on risk percentage
   */
  async calculatePositionSize(
    symbol: string,
    riskPercent: number,
    entryPrice: number,
    stopLoss: number
  ): Promise<number> {
    try {
      const accountInfo = await mt5Connection.getAccountInfo();
      const symbolInfo = await mt5Connection.getSymbolInfo(symbol);
      
      if (!accountInfo || !symbolInfo) return 0;

      const riskAmount = (accountInfo.equity * riskPercent) / 100;
      const pointValue = symbolInfo.point;
      const pipsRisk = Math.abs(entryPrice - stopLoss) / pointValue;
      
      // Simplified calculation - in real implementation, consider tick value, contract size, etc.
      const positionSize = riskAmount / (pipsRisk * pointValue);
      
      // Ensure within min/max limits
      return Math.max(
        symbolInfo.volumeMin,
        Math.min(symbolInfo.volumeMax, positionSize)
      );
    } catch (error) {
      console.error('Error calculating position size:', error);
      return 0;
    }
  }

  /**
   * Send order request to MT5
   */
  private async sendOrderRequest(request: OrderRequest): Promise<OrderResult> {
    if (!mt5Connection.isConnectionActive()) {
      return { success: false, error: 'MT5 not connected' };
    }

    try {
      // In real implementation, this would send the order via WebSocket/API
      const response = await this.simulateOrderExecution(request);
      return response;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Simulate order execution (replace with real MT5 API call)
   */
  private async simulateOrderExecution(request: OrderRequest): Promise<OrderResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate successful execution
    const ticket = Math.floor(Math.random() * 1000000) + 100000;
    
    return {
      success: true,
      ticket,
      retcode: 10009 // TRADE_RETCODE_DONE
    };
  }
}

// Export singleton instance
export const mt5Trading = new MT5Trading();