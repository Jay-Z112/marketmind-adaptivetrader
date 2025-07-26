import { MT5Config, AccountInfo, MarketData, SymbolInfo, Position, OHLC } from './types';

/**
 * MT5 Connection Manager
 * Handles connection to MetaTrader 5 terminal via Python bridge or WebSocket
 */
export class MT5Connection {
  private config: MT5Config;
  private isConnected: boolean = false;
  private websocket: WebSocket | null = null;
  private subscribers: Map<string, Function[]> = new Map();

  constructor(config: MT5Config) {
    this.config = config;
  }

  /**
   * Initialize connection to MT5 terminal
   */
  async connect(): Promise<boolean> {
    try {
      // In real implementation, this would connect to your MT5 bridge service
      // For now, we'll simulate the connection
      console.log('Connecting to MT5...', this.config);
      
      // Simulate WebSocket connection to MT5 bridge
      this.websocket = new WebSocket('ws://localhost:8765/mt5');
      
      return new Promise((resolve) => {
        if (!this.websocket) {
          resolve(false);
          return;
        }

        this.websocket.onopen = () => {
          console.log('MT5 WebSocket connected');
          this.isConnected = true;
          this.setupMessageHandlers();
          resolve(true);
        };

        this.websocket.onerror = (error) => {
          console.error('MT5 connection error:', error);
          this.isConnected = false;
          resolve(false);
        };

        this.websocket.onclose = () => {
          console.log('MT5 connection closed');
          this.isConnected = false;
        };
      });
    } catch (error) {
      console.error('Failed to connect to MT5:', error);
      return false;
    }
  }

  /**
   * Disconnect from MT5 terminal
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    console.log('Disconnected from MT5');
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<AccountInfo | null> {
    if (!this.isConnected) return null;

    return this.sendRequest('GET_ACCOUNT_INFO');
  }

  /**
   * Get current market data for symbol
   */
  async getMarketData(symbol: string): Promise<MarketData | null> {
    if (!this.isConnected) return null;

    return this.sendRequest('GET_MARKET_DATA', { symbol });
  }

  /**
   * Get symbol information
   */
  async getSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
    if (!this.isConnected) return null;

    return this.sendRequest('GET_SYMBOL_INFO', { symbol });
  }

  /**
   * Get current positions
   */
  async getPositions(): Promise<Position[]> {
    if (!this.isConnected) return [];

    return this.sendRequest('GET_POSITIONS') || [];
  }

  /**
   * Get historical price data
   */
  async getOHLC(symbol: string, timeframe: string, count: number): Promise<OHLC[]> {
    if (!this.isConnected) return [];

    return this.sendRequest('GET_OHLC', { symbol, timeframe, count }) || [];
  }

  /**
   * Subscribe to real-time data
   */
  subscribe(symbol: string, callback: (data: MarketData) => void): void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    
    this.subscribers.get(symbol)?.push(callback);

    // Send subscription request
    this.sendRequest('SUBSCRIBE', { symbol });
  }

  /**
   * Unsubscribe from real-time data
   */
  unsubscribe(symbol: string, callback?: Function): void {
    if (callback) {
      const callbacks = this.subscribers.get(symbol) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.subscribers.delete(symbol);
    }

    // Send unsubscription request
    this.sendRequest('UNSUBSCRIBE', { symbol });
  }

  /**
   * Check if connected
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Send request to MT5 bridge
   */
  private async sendRequest(action: string, params?: any): Promise<any> {
    return new Promise((resolve) => {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        resolve(null);
        return;
      }

      const requestId = Date.now().toString();
      const message = {
        id: requestId,
        action,
        params: params || {}
      };

      // Store promise resolver for response handling
      const responseHandler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        if (response.id === requestId) {
          this.websocket?.removeEventListener('message', responseHandler);
          resolve(response.data);
        }
      };

      this.websocket.addEventListener('message', responseHandler);
      this.websocket.send(JSON.stringify(message));

      // Timeout after 5 seconds
      setTimeout(() => {
        this.websocket?.removeEventListener('message', responseHandler);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Setup message handlers for real-time data
   */
  private setupMessageHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'MARKET_DATA') {
          const data: MarketData = message.data;
          const callbacks = this.subscribers.get(data.symbol);
          callbacks?.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }
}

// Singleton instance
export const mt5Connection = new MT5Connection({
  server: 'demo-server',
  login: 12345,
  password: 'password',
  timeout: 5000
});