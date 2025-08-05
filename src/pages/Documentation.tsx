import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Brain, 
  Shield, 
  Settings, 
  TrendingUp, 
  Zap,
  FileText,
  Code,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Documentation() {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      description: "Learn how to set up and use MarketMind AI"
    },
    {
      id: "strategies",
      title: "AI Strategies",
      icon: Brain,
      description: "Understanding our trading algorithms"
    },
    {
      id: "risk-management",
      title: "Risk Management",
      icon: Shield,
      description: "How to protect your capital"
    },
    {
      id: "api",
      title: "API Reference",
      icon: Code,
      description: "Technical documentation for developers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <FileText className="h-4 w-4 mr-1" />
            Documentation
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            MarketMind AI Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about using MarketMind AI for automated trading. 
            From basic setup to advanced strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="text-sm">{section.title}</span>
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                <TabsTrigger value="strategies">AI Strategies</TabsTrigger>
                <TabsTrigger value="risk-management">Risk Management</TabsTrigger>
                <TabsTrigger value="api">API Reference</TabsTrigger>
              </TabsList>

              <TabsContent value="getting-started" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Getting Started with MarketMind AI
                    </CardTitle>
                    <CardDescription>
                      Follow these steps to start automated trading
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">1. Account Setup</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Create your MarketMind AI account</li>
                        <li>• Choose your subscription plan</li>
                        <li>• Download and install MetaTrader 5</li>
                        <li>• Open a trading account with a supported broker</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">2. MT5 Connection</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Click "Connect MT5" in the dashboard</li>
                        <li>• Enter your MT5 server, login, and password</li>
                        <li>• Verify the connection is successful</li>
                        <li>• Check your account balance and trading permissions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">3. Configure Risk Settings</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Set your maximum risk per trade (recommended: 1-2%)</li>
                        <li>• Configure daily loss limits</li>
                        <li>• Choose maximum number of open positions</li>
                        <li>• Enable news filter if desired</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">4. Start Trading</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Review active strategies and their performance</li>
                        <li>• Start with demo mode to test the system</li>
                        <li>• Monitor the dashboard for trade signals</li>
                        <li>• Enable live trading when ready</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Minimum Requirements</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• MetaTrader 5 platform</li>
                          <li>• Stable internet connection</li>
                          <li>• Modern web browser</li>
                          <li>• Valid trading account</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Recommended</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• VPS for 24/7 operation</li>
                          <li>• Multiple monitors</li>
                          <li>• Backup internet connection</li>
                          <li>• Dedicated trading computer</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strategies" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Trading Strategies
                    </CardTitle>
                    <CardDescription>
                      Learn about our advanced trading algorithms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Smart Market Structure (SMS)</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Our flagship strategy that analyzes market structure, order flow, and institutional behavior.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Identifies key support and resistance levels</li>
                        <li>• Analyzes liquidity pools and fair value gaps</li>
                        <li>• Detects institutional order flow</li>
                        <li>• Adapts to different market conditions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Multi-Timeframe Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Combines signals from multiple timeframes for higher probability trades.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Higher timeframe bias identification</li>
                        <li>• Lower timeframe entry optimization</li>
                        <li>• Confluence detection across timeframes</li>
                        <li>• Dynamic stop loss and take profit levels</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Machine Learning Engine</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Continuously learns from market data and trade outcomes to improve performance.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Pattern recognition and adaptation</li>
                        <li>• Strategy weight optimization</li>
                        <li>• Market regime detection</li>
                        <li>• Performance feedback loops</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk-management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Risk Management
                    </CardTitle>
                    <CardDescription>
                      Protect your capital with our advanced risk controls
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Position Sizing</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatic position sizing based on your risk tolerance and account size.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Fixed percentage risk per trade</li>
                        <li>• Dynamic sizing based on volatility</li>
                        <li>• Account balance protection</li>
                        <li>• Maximum position limits</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Stop Loss Management</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Intelligent stop loss placement and management.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Technical level-based stops</li>
                        <li>• Trailing stop functionality</li>
                        <li>• Break-even management</li>
                        <li>• Partial profit taking</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Daily Limits</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Protect against excessive losses during volatile market conditions.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>• Maximum daily loss limits</li>
                        <li>• Trade frequency controls</li>
                        <li>• Drawdown protection</li>
                        <li>• Emergency stop functionality</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      API Reference
                    </CardTitle>
                    <CardDescription>
                      Technical documentation for developers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Authentication</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm">
                          POST /api/auth/login<br/>
                          Content-Type: application/json<br/><br/>
                          {JSON.stringify({
                            "server": "MetaQuotes-Demo",
                            "login": 12345678,
                            "password": "your_password"
                          }, null, 2)}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Market Data</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm">
                          GET /api/market-data/EURUSD<br/>
                          Authorization: Bearer your_token
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Place Order</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm">
                          POST /api/orders<br/>
                          Content-Type: application/json<br/><br/>
                          {JSON.stringify({
                            "symbol": "EURUSD",
                            "type": "BUY",
                            "volume": 0.1,
                            "price": 1.1234,
                            "stop_loss": 1.1200,
                            "take_profit": 1.1300
                          }, null, 2)}
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">WebSocket Feeds</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Real-time market data and trade updates via WebSocket connection.
                      </p>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm">
                          wss://api.marketmind.ai/ws<br/>
                          ?token=your_token&symbols=EURUSD,GBPUSD
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="#"
                        className="flex items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <div>
                          <h4 className="font-semibold">API Playground</h4>
                          <p className="text-xs text-muted-foreground">Test API endpoints</p>
                        </div>
                      </a>
                      
                      <a
                        href="#"
                        className="flex items-center gap-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <div>
                          <h4 className="font-semibold">Support Forum</h4>
                          <p className="text-xs text-muted-foreground">Community help</p>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}