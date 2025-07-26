import { mt5Connection } from '../mt5/connection';
import { mt5Trading } from '../mt5/trading';
import { riskManager } from '../risk/manager';
import { SMCStrategy } from '../strategies/smc';
import { BaseStrategy } from '../strategies/base';
import { StrategySignal, OHLC, MarketData, OrderResult } from '../mt5/types';

/**
 * MarketMind AI Core Engine
 * Main orchestrator for the self-learning trading system
 */
export class MarketMindCore {
  private strategies: Map<string, BaseStrategy> = new Map();
  private activeSymbols: Set<string> = new Set();
  private isRunning: boolean = false;
  private analysisInterval: NodeJS.Timeout | null = null;
  private learningEngine: LearningEngine;
  private signalHistory: SignalHistory[] = [];

  constructor() {
    this.initializeStrategies();
    this.learningEngine = new LearningEngine();
  }

  /**
   * Initialize trading strategies
   */
  private initializeStrategies(): void {
    // Add SMC strategy
    const smcStrategy = new SMCStrategy();
    this.strategies.set('SMC', smcStrategy);

    // Add other strategies here
    // const ictStrategy = new ICTStrategy();
    // this.strategies.set('ICT', ictStrategy);
    
    console.log(`Initialized ${this.strategies.size} trading strategies`);
  }

  /**
   * Start the MarketMind AI system
   */
  async start(): Promise<boolean> {
    try {
      console.log('Starting MarketMind AI...');

      // Connect to MT5
      const connected = await mt5Connection.connect();
      if (!connected) {
        console.error('Failed to connect to MT5');
        return false;
      }

      // Activate strategies
      this.strategies.forEach(strategy => strategy.activate());

      // Set default symbols to monitor
      this.activeSymbols.add('EURUSD');
      this.activeSymbols.add('GBPUSD');
      this.activeSymbols.add('USDCAD');
      this.activeSymbols.add('AUDUSD');

      // Start analysis loop
      this.startAnalysisLoop();

      // Start position monitoring
      this.startPositionMonitoring();

      this.isRunning = true;
      console.log('MarketMind AI started successfully');
      return true;

    } catch (error) {
      console.error('Failed to start MarketMind AI:', error);
      return false;
    }
  }

  /**
   * Stop the MarketMind AI system
   */
  async stop(): Promise<void> {
    console.log('Stopping MarketMind AI...');

    this.isRunning = false;

    // Stop analysis loop
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    // Deactivate strategies
    this.strategies.forEach(strategy => strategy.deactivate());

    // Disconnect from MT5
    mt5Connection.disconnect();

    console.log('MarketMind AI stopped');
  }

  /**
   * Start the main analysis loop
   */
  private startAnalysisLoop(): void {
    this.analysisInterval = setInterval(async () => {
      if (!this.isRunning) return;

      for (const symbol of this.activeSymbols) {
        await this.analyzeSymbol(symbol);
      }
    }, 15000); // Analyze every 15 seconds (M15 timeframe)
  }

  /**
   * Analyze a specific symbol across all strategies
   */
  private async analyzeSymbol(symbol: string): Promise<void> {
    try {
      // Get market data
      const marketData = await mt5Connection.getMarketData(symbol);
      if (!marketData) return;

      // Get OHLC data
      const ohlc = await mt5Connection.getOHLC(symbol, 'M15', 100);
      if (ohlc.length < 50) return;

      // Collect signals from all active strategies
      const signals: StrategySignal[] = [];
      
      for (const [name, strategy] of this.strategies) {
        if (!strategy.isStrategyActive()) continue;

        const signal = strategy.analyze(symbol, ohlc, marketData);
        if (signal) {
          signals.push(signal);
        }
      }

      // Process signals through learning engine
      if (signals.length > 0) {
        const bestSignal = await this.learningEngine.selectBestSignal(signals, symbol, ohlc);
        if (bestSignal) {
          await this.executeSignal(bestSignal);
        }
      }

    } catch (error) {
      console.error(`Analysis error for ${symbol}:`, error);
    }
  }

  /**
   * Execute a trading signal
   */
  private async executeSignal(signal: StrategySignal): Promise<void> {
    try {
      console.log(`Processing signal: ${signal.action} ${signal.symbol} (${signal.strategy})`);

      // Validate trade through risk manager
      const validation = await riskManager.validateTrade(signal);
      if (!validation.isValid) {
        console.log(`Trade rejected: ${validation.reason}`);
        return;
      }

      const adjustedSignal = validation.adjustedSignal!;
      const positionSize = validation.positionSize!;

      // Execute the trade
      let result: OrderResult;
      
      if (adjustedSignal.action === 'BUY') {
        result = await mt5Trading.placeMarketOrder(
          adjustedSignal.symbol,
          positionSize,
          0, // BUY
          adjustedSignal.stopLoss,
          adjustedSignal.takeProfit,
          `MarketMind-${adjustedSignal.strategy}`
        );
      } else if (adjustedSignal.action === 'SELL') {
        result = await mt5Trading.placeMarketOrder(
          adjustedSignal.symbol,
          positionSize,
          1, // SELL
          adjustedSignal.stopLoss,
          adjustedSignal.takeProfit,
          `MarketMind-${adjustedSignal.strategy}`
        );
      } else {
        // Handle CLOSE action
        await mt5Trading.closeAllPositions(adjustedSignal.symbol);
        return;
      }

      // Log trade execution
      if (result.success) {
        console.log(`Trade executed: ${result.ticket} - ${adjustedSignal.action} ${adjustedSignal.symbol}`);
        
        // Store signal for learning
        this.signalHistory.push({
          signal: adjustedSignal,
          ticket: result.ticket!,
          executionTime: Date.now(),
          outcome: null // Will be updated when trade closes
        });
      } else {
        console.error(`Trade execution failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Signal execution error:', error);
    }
  }

  /**
   * Start position monitoring for risk management
   */
  private startPositionMonitoring(): void {
    setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await riskManager.monitorPositions();
        await riskManager.updateDailyPL();
        
        // Update learning engine with closed trades
        await this.updateLearningData();
        
      } catch (error) {
        console.error('Position monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Update learning engine with trade outcomes
   */
  private async updateLearningData(): Promise<void> {
    try {
      const currentPositions = await mt5Connection.getPositions();
      const openTickets = new Set(currentPositions.map(p => p.ticket));

      // Find completed trades
      for (const history of this.signalHistory) {
        if (history.outcome === null && !openTickets.has(history.ticket)) {
          // Trade is closed, calculate outcome
          // In real implementation, get trade history from MT5
          const outcome = Math.random() > 0.5 ? 'win' : 'loss'; // Simplified
          const profit = Math.random() * 200 - 100; // Simplified
          
          history.outcome = {
            result: outcome,
            profit,
            closeTime: Date.now()
          };

          // Update strategy performance
          const strategy = this.strategies.get(history.signal.strategy);
          if (strategy) {
            strategy.updatePerformance({
              symbol: history.signal.symbol,
              strategy: history.signal.strategy,
              entry: history.signal.entry,
              exit: history.signal.entry + (outcome === 'win' ? 50 : -25), // Simplified
              profit,
              duration: Date.now() - history.executionTime,
              timestamp: history.executionTime
            });
          }

          // Feed data to learning engine
          await this.learningEngine.updateFromTrade(history);
        }
      }
    } catch (error) {
      console.error('Learning data update error:', error);
    }
  }

  /**
   * Add a symbol to monitoring
   */
  addSymbol(symbol: string): void {
    this.activeSymbols.add(symbol.toUpperCase());
    console.log(`Added ${symbol} to monitoring`);
  }

  /**
   * Remove a symbol from monitoring
   */
  removeSymbol(symbol: string): void {
    this.activeSymbols.delete(symbol.toUpperCase());
    console.log(`Removed ${symbol} from monitoring`);
  }

  /**
   * Get system status
   */
  getStatus(): SystemStatus {
    return {
      isRunning: this.isRunning,
      connectedToMT5: mt5Connection.isConnectionActive(),
      activeStrategies: Array.from(this.strategies.keys()).filter(
        name => this.strategies.get(name)?.isStrategyActive()
      ),
      monitoredSymbols: Array.from(this.activeSymbols),
      totalSignals: this.signalHistory.length,
      learningProgress: this.learningEngine.getLearningProgress()
    };
  }

  /**
   * Get strategy performances
   */
  getStrategyPerformances(): Map<string, any> {
    const performances = new Map();
    
    this.strategies.forEach((strategy, name) => {
      performances.set(name, strategy.getPerformance());
    });
    
    return performances;
  }
}

/**
 * Learning Engine for strategy optimization
 */
class LearningEngine {
  private strategyWeights: Map<string, number> = new Map();
  private symbolPerformance: Map<string, Map<string, number>> = new Map();
  private marketConditions: Map<string, any> = new Map();

  constructor() {
    // Initialize default weights
    this.strategyWeights.set('SMC', 1.0);
    this.strategyWeights.set('ICT', 1.0);
    this.strategyWeights.set('ORB', 1.0);
    this.strategyWeights.set('TurtleSoup', 1.0);
  }

  /**
   * Select the best signal using learned weights
   */
  async selectBestSignal(signals: StrategySignal[], symbol: string, ohlc: OHLC[]): Promise<StrategySignal | null> {
    if (signals.length === 0) return null;
    if (signals.length === 1) return signals[0];

    // Calculate weighted scores for each signal
    let bestSignal: StrategySignal | null = null;
    let bestScore = 0;

    for (const signal of signals) {
      const baseConfidence = signal.confidence;
      const strategyWeight = this.strategyWeights.get(signal.strategy) || 1.0;
      const symbolWeight = this.getSymbolWeight(signal.strategy, symbol);
      const marketConditionWeight = this.getMarketConditionWeight(ohlc);

      const totalScore = baseConfidence * strategyWeight * symbolWeight * marketConditionWeight;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSignal = signal;
      }
    }

    return bestSignal;
  }

  /**
   * Update learning data from completed trade
   */
  async updateFromTrade(history: SignalHistory): Promise<void> {
    if (!history.outcome) return;

    const strategy = history.signal.strategy;
    const symbol = history.signal.symbol;
    const isWin = history.outcome.result === 'win';

    // Update strategy weights based on outcome
    const currentWeight = this.strategyWeights.get(strategy) || 1.0;
    const adjustment = isWin ? 0.05 : -0.02;
    const newWeight = Math.max(0.1, Math.min(2.0, currentWeight + adjustment));
    
    this.strategyWeights.set(strategy, newWeight);

    // Update symbol-specific performance
    if (!this.symbolPerformance.has(symbol)) {
      this.symbolPerformance.set(symbol, new Map());
    }
    
    const symbolMap = this.symbolPerformance.get(symbol)!;
    const symbolWeight = symbolMap.get(strategy) || 1.0;
    const symbolAdjustment = isWin ? 0.03 : -0.01;
    const newSymbolWeight = Math.max(0.1, Math.min(2.0, symbolWeight + symbolAdjustment));
    
    symbolMap.set(strategy, newSymbolWeight);

    console.log(`Learning update: ${strategy} weight: ${newWeight.toFixed(2)}, ${symbol} weight: ${newSymbolWeight.toFixed(2)}`);
  }

  /**
   * Get symbol-specific weight for strategy
   */
  private getSymbolWeight(strategy: string, symbol: string): number {
    const symbolMap = this.symbolPerformance.get(symbol);
    return symbolMap?.get(strategy) || 1.0;
  }

  /**
   * Calculate market condition weight
   */
  private getMarketConditionWeight(ohlc: OHLC[]): number {
    // Simplified market condition analysis
    // In real implementation, analyze volatility, trend, session, etc.
    return 1.0;
  }

  /**
   * Get learning progress
   */
  getLearningProgress(): LearningProgress {
    return {
      totalTrades: 0, // Would track from database
      trainingCycles: 0,
      accuracyImprovement: 0,
      lastUpdate: Date.now()
    };
  }
}

// Interfaces
interface SignalHistory {
  signal: StrategySignal;
  ticket: number;
  executionTime: number;
  outcome: TradeOutcome | null;
}

interface TradeOutcome {
  result: 'win' | 'loss';
  profit: number;
  closeTime: number;
}

interface SystemStatus {
  isRunning: boolean;
  connectedToMT5: boolean;
  activeStrategies: string[];
  monitoredSymbols: string[];
  totalSignals: number;
  learningProgress: LearningProgress;
}

interface LearningProgress {
  totalTrades: number;
  trainingCycles: number;
  accuracyImprovement: number;
  lastUpdate: number;
}

// Export singleton instance
export const marketMindCore = new MarketMindCore();