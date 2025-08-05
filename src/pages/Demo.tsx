import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, TrendingUp, Brain, Shield, Zap } from 'lucide-react';
import { TradingDashboard } from '@/components/TradingDashboard';

export default function Demo() {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStats, setDemoStats] = useState({
    profit: 0,
    trades: 0,
    winRate: 0
  });

  const startDemo = () => {
    setIsDemoRunning(true);
    // Simulate demo trading
    const interval = setInterval(() => {
      setDemoStats(prev => ({
        profit: prev.profit + (Math.random() - 0.4) * 50,
        trades: prev.trades + 1,
        winRate: Math.max(0, Math.min(100, prev.winRate + (Math.random() - 0.5) * 10))
      }));
    }, 2000);

    // Store interval ID for cleanup
    (window as any).demoInterval = interval;
  };

  const stopDemo = () => {
    setIsDemoRunning(false);
    if ((window as any).demoInterval) {
      clearInterval((window as any).demoInterval);
    }
  };

  const resetDemo = () => {
    stopDemo();
    setDemoStats({ profit: 0, trades: 0, winRate: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Brain className="h-4 w-4 mr-1" />
            Demo Mode
          </Badge>
          <h1 className="text-4xl font-bold mb-2">
            Try MarketMind AI Risk-Free
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our AI trading system with simulated market data. No real money involved.
          </p>
        </div>

        {/* Demo Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>AI Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Smart Market Structure</li>
                <li>✓ Multi-timeframe Analysis</li>
                <li>✓ Risk Management</li>
                <li>✓ Pattern Recognition</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Risk-Free Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Simulated Trading</li>
                <li>✓ Real Market Data</li>
                <li>✓ No Financial Risk</li>
                <li>✓ Full Feature Access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto text-yellow-600 mb-2" />
              <CardTitle>Live Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Real-time Signals</li>
                <li>✓ Performance Metrics</li>
                <li>✓ Trade History</li>
                <li>✓ Strategy Analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Demo Controls
            </CardTitle>
            <CardDescription>
              Start the demo to see MarketMind AI in action with simulated trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                onClick={isDemoRunning ? stopDemo : startDemo}
                variant={isDemoRunning ? "destructive" : "default"}
                size="lg"
              >
                {isDemoRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Demo
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Demo
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={resetDemo}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Demo Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${demoStats.profit.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Demo P&L</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{demoStats.trades}</div>
                <div className="text-sm text-muted-foreground">Demo Trades</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {demoStats.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Dashboard */}
        <TradingDashboard />

        {/* Call to Action */}
        <Card className="mt-8 text-center">
          <CardContent className="p-8">
            <TrendingUp className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready to Trade Live?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Upgrade to a live account and start earning real profits with MarketMind AI. 
              Connect your MT5 account and let our AI handle the trading while you focus on what matters most.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Start Live Trading
              </Button>
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}