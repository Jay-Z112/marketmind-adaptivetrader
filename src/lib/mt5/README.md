# MarketMind AI - MT5 Integration Starter Kit

This directory contains the complete codebase for integrating MarketMind AI with MetaTrader 5 (MT5).

## Architecture Overview

```
src/lib/
├── mt5/               # MT5 connection and trading operations
├── strategies/        # Trading strategy implementations
├── risk/             # Risk management system
└── marketmind/       # Core AI engine and orchestration
```

## Components

### 1. MT5 Connection (`mt5/`)
- **connection.ts**: WebSocket/API connection to MT5 terminal
- **trading.ts**: Order execution and position management
- **types.ts**: TypeScript interfaces for MT5 data structures

### 2. Trading Strategies (`strategies/`)
- **base.ts**: Abstract base class for all strategies
- **smc.ts**: Smart Money Concepts strategy implementation
- Additional strategies: ICT, ORB, CTR, Turtle Soup (to be implemented)

### 3. Risk Management (`risk/`)
- **manager.ts**: Comprehensive risk management system
- Position sizing, stop losses, daily limits, portfolio risk

### 4. Core Engine (`marketmind/`)
- **core.ts**: Main orchestrator and learning engine
- Signal processing, strategy selection, AI decision making

## Setup Instructions

### Prerequisites
1. MetaTrader 5 terminal installed and running
2. Python bridge service (for MT5 API communication)
3. Node.js and npm/yarn for the web interface

### 1. Python MT5 Bridge Setup

Create a Python service to bridge between your web app and MT5:

```python
# mt5_bridge.py
import asyncio
import websockets
import json
import MetaTrader5 as mt5
from datetime import datetime

class MT5Bridge:
    def __init__(self):
        self.clients = set()
        
    async def handle_client(self, websocket, path):
        self.clients.add(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                response = await self.process_request(data)
                await websocket.send(json.dumps(response))
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.remove(websocket)
    
    async def process_request(self, data):
        action = data.get('action')
        params = data.get('params', {})
        
        if action == 'GET_ACCOUNT_INFO':
            account_info = mt5.account_info()
            return {
                'id': data['id'],
                'data': {
                    'balance': account_info.balance,
                    'equity': account_info.equity,
                    'profit': account_info.profit,
                    'margin': account_info.margin,
                    'freeMargin': account_info.margin_free,
                    'marginLevel': account_info.margin_level,
                    'currency': account_info.currency,
                    'leverage': account_info.leverage
                } if account_info else None
            }
        
        elif action == 'GET_MARKET_DATA':
            symbol = params['symbol']
            tick = mt5.symbol_info_tick(symbol)
            return {
                'id': data['id'],
                'data': {
                    'symbol': symbol,
                    'bid': tick.bid,
                    'ask': tick.ask,
                    'spread': (tick.ask - tick.bid) * 100000,  # in pips
                    'volume': tick.volume,
                    'timestamp': tick.time
                } if tick else None
            }
        
        elif action == 'PLACE_ORDER':
            # Implement order placement logic
            pass
            
        return {'id': data['id'], 'data': None}

if __name__ == '__main__':
    if not mt5.initialize():
        print("MT5 initialization failed")
        exit()
    
    bridge = MT5Bridge()
    start_server = websockets.serve(bridge.handle_client, "localhost", 8765)
    
    print("MT5 Bridge started on ws://localhost:8765")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
```

### 2. Install Dependencies

```bash
pip install MetaTrader5 websockets asyncio
```

### 3. Configuration

Update the MT5 connection configuration in `connection.ts`:

```typescript
export const mt5Connection = new MT5Connection({
  server: 'your-broker-server',
  login: 12345, // Your MT5 login
  password: 'your-password',
  timeout: 5000
});
```

### 4. Risk Parameters

Configure risk parameters in `risk/manager.ts`:

```typescript
export const riskManager = new RiskManager({
  maxRiskPerTrade: 2.0,     // 2% per trade
  maxDailyLoss: 6.0,        // 6% daily loss limit
  maxOpenPositions: 5,       // Maximum concurrent positions
  minRiskReward: 1.5,       // Minimum risk-reward ratio
  maxSpread: 3.0,           // Maximum spread in pips
  newsFilterEnabled: true    // Enable news filtering
});
```

## Usage

### Basic Usage

```typescript
import { marketMindCore } from '@/lib/marketmind/core';

// Start the system
await marketMindCore.start();

// Add symbols to monitor
marketMindCore.addSymbol('EURUSD');
marketMindCore.addSymbol('GBPUSD');

// Check system status
const status = marketMindCore.getStatus();
console.log('System running:', status.isRunning);

// Get strategy performances
const performances = marketMindCore.getStrategyPerformances();
```

### Strategy Implementation

To add a new strategy, extend the `BaseStrategy` class:

```typescript
export class MyCustomStrategy extends BaseStrategy {
  constructor() {
    super('MyStrategy', 'M15', ['EURUSD', 'GBPUSD']);
  }

  analyze(symbol: string, ohlc: OHLC[], marketData: MarketData): StrategySignal | null {
    // Your strategy logic here
    if (/* your conditions */) {
      return {
        symbol,
        action: 'BUY',
        confidence: 0.85,
        entry: marketData.ask,
        stopLoss: marketData.ask - 0.0020,
        takeProfit: marketData.ask + 0.0040,
        strategy: this.name,
        timestamp: Date.now()
      };
    }
    return null;
  }
}
```

## Features

### ✅ Implemented
- MT5 connection and data retrieval
- SMC (Smart Money Concepts) strategy
- Comprehensive risk management
- Position monitoring and management
- Learning engine foundation
- Order execution system

### 🔄 In Development
- Additional strategies (ICT, ORB, CTR, Turtle Soup)
- Advanced ML learning algorithms
- News impact analysis
- Multi-timeframe analysis
- Performance analytics dashboard

### 📋 Planned
- Backtesting framework
- Strategy optimization
- Cloud deployment options
- Mobile app integration
- Social trading features

## Important Notes

### Security
- Store MT5 credentials securely (use environment variables)
- Implement proper authentication for production use
- Use HTTPS/WSS in production environments

### Testing
- Always test with demo accounts first
- Implement comprehensive logging
- Use paper trading mode for strategy validation

### Performance
- Monitor system resource usage
- Implement connection retry logic
- Use connection pooling for high-frequency trading

### Compliance
- Ensure compliance with local trading regulations
- Implement proper audit trails
- Follow broker-specific requirements

## Support

For issues and questions:
1. Check the error logs in browser console
2. Verify MT5 terminal is running and connected
3. Ensure Python bridge service is operational
4. Review risk management settings

## License

This code is provided as a starter kit for educational and development purposes. Please ensure compliance with your broker's API terms and local trading regulations.