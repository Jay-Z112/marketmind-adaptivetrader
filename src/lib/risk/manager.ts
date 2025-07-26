import { mt5Connection } from '../mt5/connection';
import { mt5Trading } from '../mt5/trading';
import { RiskParams, AccountInfo, Position, StrategySignal } from '../mt5/types';

/**
 * Risk Management System
 * Handles position sizing, stop losses, daily limits, and overall portfolio risk
 */
export class RiskManager {
  private riskParams: RiskParams;
  private dailyStartBalance: number = 0;
  private dailyPL: number = 0;
  private isTradeBlocked: boolean = false;

  constructor(riskParams: RiskParams) {
    this.riskParams = riskParams;
    this.initializeDailyTracking();
  }

  /**
   * Initialize daily tracking
   */
  private async initializeDailyTracking(): Promise<void> {
    try {
      const accountInfo = await mt5Connection.getAccountInfo();
      if (accountInfo) {
        this.dailyStartBalance = accountInfo.balance;
        this.dailyPL = 0;
      }
    } catch (error) {
      console.error('Failed to initialize daily tracking:', error);
    }
  }

  /**
   * Validate if trade can be executed based on risk parameters
   */
  async validateTrade(signal: StrategySignal): Promise<TradeValidationResult> {
    try {
      // Check if trading is blocked due to daily loss limit
      if (this.isTradeBlocked) {
        return {
          isValid: false,
          reason: 'Trading blocked due to daily loss limit',
          adjustedSignal: null
        };
      }

      // Get current account info
      const accountInfo = await mt5Connection.getAccountInfo();
      if (!accountInfo) {
        return {
          isValid: false,
          reason: 'Cannot retrieve account information',
          adjustedSignal: null
        };
      }

      // Check daily P&L limit
      const dailyLossCheck = await this.checkDailyLossLimit(accountInfo);
      if (!dailyLossCheck.passed) {
        return {
          isValid: false,
          reason: dailyLossCheck.reason,
          adjustedSignal: null
        };
      }

      // Check maximum open positions
      const positionCheck = await this.checkMaxPositions();
      if (!positionCheck.passed) {
        return {
          isValid: false,
          reason: positionCheck.reason,
          adjustedSignal: null
        };
      }

      // Check spread limits
      const spreadCheck = await this.checkSpread(signal.symbol);
      if (!spreadCheck.passed) {
        return {
          isValid: false,
          reason: spreadCheck.reason,
          adjustedSignal: null
        };
      }

      // Calculate appropriate position size
      const positionSize = await this.calculatePositionSize(signal, accountInfo);
      if (positionSize <= 0) {
        return {
          isValid: false,
          reason: 'Unable to calculate valid position size',
          adjustedSignal: null
        };
      }

      // Adjust stop loss and take profit if necessary
      const adjustedSL = this.adjustStopLoss(signal);
      const adjustedTP = this.adjustTakeProfit(signal);

      // Create adjusted signal
      const adjustedSignal: StrategySignal = {
        ...signal,
        stopLoss: adjustedSL,
        takeProfit: adjustedTP
      };

      return {
        isValid: true,
        reason: 'Trade validated successfully',
        adjustedSignal,
        positionSize
      };

    } catch (error) {
      console.error('Trade validation error:', error);
      return {
        isValid: false,
        reason: `Validation error: ${error}`,
        adjustedSignal: null
      };
    }
  }

  /**
   * Check daily loss limit
   */
  private async checkDailyLossLimit(accountInfo: AccountInfo): Promise<ValidationCheck> {
    const maxDailyLoss = (this.dailyStartBalance * this.riskParams.maxDailyLoss) / 100;
    const currentDailyLoss = this.dailyStartBalance - accountInfo.balance;

    if (currentDailyLoss >= maxDailyLoss) {
      this.isTradeBlocked = true;
      return {
        passed: false,
        reason: `Daily loss limit reached: ${currentDailyLoss.toFixed(2)} / ${maxDailyLoss.toFixed(2)}`
      };
    }

    return { passed: true, reason: 'Daily loss limit check passed' };
  }

  /**
   * Check maximum open positions
   */
  private async checkMaxPositions(): Promise<ValidationCheck> {
    const positions = await mt5Connection.getPositions();
    
    if (positions.length >= this.riskParams.maxOpenPositions) {
      return {
        passed: false,
        reason: `Maximum open positions reached: ${positions.length} / ${this.riskParams.maxOpenPositions}`
      };
    }

    return { passed: true, reason: 'Position count check passed' };
  }

  /**
   * Check spread limits
   */
  private async checkSpread(symbol: string): Promise<ValidationCheck> {
    const marketData = await mt5Connection.getMarketData(symbol);
    
    if (!marketData) {
      return { passed: false, reason: 'Cannot retrieve market data for spread check' };
    }

    const spreadPips = marketData.spread;
    
    if (spreadPips > this.riskParams.maxSpread) {
      return {
        passed: false,
        reason: `Spread too wide: ${spreadPips} > ${this.riskParams.maxSpread} pips`
      };
    }

    return { passed: true, reason: 'Spread check passed' };
  }

  /**
   * Calculate position size based on risk parameters
   */
  private async calculatePositionSize(signal: StrategySignal, accountInfo: AccountInfo): Promise<number> {
    try {
      const riskAmount = (accountInfo.equity * this.riskParams.maxRiskPerTrade) / 100;
      const stopLossDistance = Math.abs(signal.entry - signal.stopLoss);
      
      // Get symbol info for calculations
      const symbolInfo = await mt5Connection.getSymbolInfo(signal.symbol);
      if (!symbolInfo) return 0;

      // Calculate position size based on risk amount and stop loss distance
      const pointValue = symbolInfo.point;
      const tickValue = 1; // Simplified - in real implementation, get from symbol info
      
      const positionSize = riskAmount / (stopLossDistance / pointValue * tickValue);
      
      // Ensure position size is within symbol limits
      return Math.max(
        symbolInfo.volumeMin,
        Math.min(symbolInfo.volumeMax, Math.round(positionSize / symbolInfo.volumeStep) * symbolInfo.volumeStep)
      );

    } catch (error) {
      console.error('Position size calculation error:', error);
      return 0;
    }
  }

  /**
   * Adjust stop loss based on volatility and broker requirements
   */
  private adjustStopLoss(signal: StrategySignal): number {
    // In real implementation, consider:
    // - Minimum stop loss distance (broker requirements)
    // - ATR-based dynamic stops
    // - Support/resistance levels
    
    return signal.stopLoss;
  }

  /**
   * Adjust take profit based on market conditions
   */
  private adjustTakeProfit(signal: StrategySignal): number {
    // Ensure minimum risk-reward ratio
    const riskDistance = Math.abs(signal.entry - signal.stopLoss);
    const rewardDistance = Math.abs(signal.takeProfit - signal.entry);
    const currentRR = rewardDistance / riskDistance;

    if (currentRR < this.riskParams.minRiskReward) {
      // Adjust take profit to meet minimum RR
      const minReward = riskDistance * this.riskParams.minRiskReward;
      
      if (signal.action === 'BUY') {
        return signal.entry + minReward;
      } else {
        return signal.entry - minReward;
      }
    }

    return signal.takeProfit;
  }

  /**
   * Monitor open positions and apply risk management
   */
  async monitorPositions(): Promise<void> {
    try {
      const positions = await mt5Connection.getPositions();
      
      for (const position of positions) {
        await this.applyPositionRiskManagement(position);
      }

    } catch (error) {
      console.error('Position monitoring error:', error);
    }
  }

  /**
   * Apply risk management to individual position
   */
  private async applyPositionRiskManagement(position: Position): Promise<void> {
    try {
      // Move stop loss to break-even when in profit
      if (this.shouldMoveToBreakEven(position)) {
        await this.moveToBreakEven(position);
      }

      // Trail stop loss for profitable positions
      if (this.shouldTrailStop(position)) {
        await this.trailStopLoss(position);
      }

      // Emergency close if position exceeds maximum loss
      if (this.shouldEmergencyClose(position)) {
        await mt5Trading.closePosition(position.ticket);
        console.log(`Emergency close position ${position.ticket} due to excessive loss`);
      }

    } catch (error) {
      console.error(`Risk management error for position ${position.ticket}:`, error);
    }
  }

  /**
   * Check if position should be moved to break-even
   */
  private shouldMoveToBreakEven(position: Position): boolean {
    const riskDistance = Math.abs(position.openPrice - position.stopLoss);
    const currentProfit = position.currentPrice - position.openPrice;
    
    // Move to break-even when profit is 1.5x the risk
    return Math.abs(currentProfit) >= riskDistance * 1.5 && position.stopLoss !== position.openPrice;
  }

  /**
   * Move position stop loss to break-even
   */
  private async moveToBreakEven(position: Position): Promise<void> {
    await mt5Trading.modifyPosition(position.ticket, position.openPrice, position.takeProfit);
    console.log(`Moved position ${position.ticket} to break-even`);
  }

  /**
   * Check if stop loss should be trailed
   */
  private shouldTrailStop(position: Position): boolean {
    // Implement trailing stop logic based on ATR or fixed distance
    return false; // Simplified for this example
  }

  /**
   * Trail stop loss for profitable position
   */
  private async trailStopLoss(position: Position): Promise<void> {
    // Implement trailing stop logic
    console.log(`Trailing stop for position ${position.ticket}`);
  }

  /**
   * Check if position should be emergency closed
   */
  private shouldEmergencyClose(position: Position): boolean {
    const maxLossAmount = (this.dailyStartBalance * this.riskParams.maxRiskPerTrade * 2) / 100;
    return Math.abs(position.profit) >= maxLossAmount && position.profit < 0;
  }

  /**
   * Update daily P&L tracking
   */
  async updateDailyPL(): Promise<void> {
    try {
      const accountInfo = await mt5Connection.getAccountInfo();
      if (accountInfo) {
        this.dailyPL = accountInfo.balance - this.dailyStartBalance;
      }
    } catch (error) {
      console.error('Failed to update daily P&L:', error);
    }
  }

  /**
   * Reset daily tracking (call at start of new trading day)
   */
  async resetDailyTracking(): Promise<void> {
    await this.initializeDailyTracking();
    this.isTradeBlocked = false;
    console.log('Daily tracking reset');
  }

  /**
   * Get current risk status
   */
  async getRiskStatus(): Promise<RiskStatus> {
    const accountInfo = await mt5Connection.getAccountInfo();
    const positions = await mt5Connection.getPositions();
    
    return {
      dailyPL: this.dailyPL,
      dailyLossPercent: this.dailyStartBalance > 0 ? (this.dailyPL / this.dailyStartBalance) * 100 : 0,
      openPositions: positions.length,
      maxPositions: this.riskParams.maxOpenPositions,
      isTradeBlocked: this.isTradeBlocked,
      totalExposure: positions.reduce((sum, pos) => sum + Math.abs(pos.profit), 0),
      accountEquity: accountInfo?.equity || 0
    };
  }

  /**
   * Update risk parameters
   */
  updateRiskParams(newParams: Partial<RiskParams>): void {
    this.riskParams = { ...this.riskParams, ...newParams };
    console.log('Risk parameters updated:', this.riskParams);
  }
}

// Interfaces
interface TradeValidationResult {
  isValid: boolean;
  reason: string;
  adjustedSignal: StrategySignal | null;
  positionSize?: number;
}

interface ValidationCheck {
  passed: boolean;
  reason: string;
}

interface RiskStatus {
  dailyPL: number;
  dailyLossPercent: number;
  openPositions: number;
  maxPositions: number;
  isTradeBlocked: boolean;
  totalExposure: number;
  accountEquity: number;
}

// Export singleton instance
export const riskManager = new RiskManager({
  maxRiskPerTrade: 2.0, // 2% per trade
  maxDailyLoss: 6.0, // 6% daily loss limit
  maxOpenPositions: 5,
  minRiskReward: 1.5,
  maxSpread: 3.0, // 3 pips
  newsFilterEnabled: true
});