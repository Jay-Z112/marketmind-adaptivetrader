// MT5 Integration Types
export interface MT5Config {
  server: string;
  login: number;
  password: string;
  timeout: number;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  timestamp: number;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: PositionType;
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss: number;
  takeProfit: number;
  openTime: number;
  comment: string;
}

export interface OrderRequest {
  action: OrderAction;
  symbol: string;
  volume: number;
  type: OrderType;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  magic?: number;
}

export interface OrderResult {
  success: boolean;
  ticket?: number;
  error?: string;
  retcode?: number;
}

export enum PositionType {
  BUY = 0,
  SELL = 1
}

export enum OrderType {
  BUY = 0,
  SELL = 1,
  BUY_LIMIT = 2,
  SELL_LIMIT = 3,
  BUY_STOP = 4,
  SELL_STOP = 5
}

export enum OrderAction {
  DEAL = 1,
  PENDING = 2,
  SLTP = 3,
  MODIFY = 4,
  REMOVE = 5
}

export interface SymbolInfo {
  name: string;
  digits: number;
  point: number;
  spread: number;
  tradeMode: number;
  volumeMin: number;
  volumeMax: number;
  volumeStep: number;
  marginRequired: number;
}

export interface AccountInfo {
  balance: number;
  equity: number;
  profit: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
}

export interface OHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StrategySignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'CLOSE';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  strategy: string;
  timestamp: number;
}

export interface RiskParams {
  maxRiskPerTrade: number; // percentage
  maxDailyLoss: number; // percentage
  maxOpenPositions: number;
  minRiskReward: number;
  maxSpread: number;
  newsFilterEnabled: boolean;
}