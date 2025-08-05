import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  Settings,
  Play,
  Pause,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { MT5LoginDialog } from './MT5LoginDialog';
import { TradeHistory } from './TradeHistory';
import { mt5Connection } from '@/lib/mt5/connection';
import { mt5Auth } from '@/lib/mt5/auth';
import { marketMindCore } from '@/lib/marketmind/core';
import { tradeManager } from '@/lib/trading/tradeManager';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`flex items-center text-xs ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
        {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {change}
      </div>
    </CardContent>
  </Card>
);

interface StrategyCardProps {
  name: string;
  accuracy: number;
  trades: number;
  pnl: string;
  status: "active" | "learning" | "standby";
}

const StrategyCard = ({ name, accuracy, trades, pnl, status }: StrategyCardProps) => (
  <Card className="relative">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Badge variant={status === 'active' ? 'default' : status === 'learning' ? 'warning' : 'secondary'}>
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Accuracy</span>
        <span className="font-semibold">{accuracy}%</span>
      </div>
      <Progress value={accuracy} className="h-2" />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Trades</div>
          <div className="font-semibold">{trades}</div>
        </div>
        <div>
          <div className="text-muted-foreground">P&L</div>
          <div className={`font-semibold ${pnl.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
            {pnl}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TradingDashboard = () => {
  const [isActive, setIsActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const strategies = [
    { name: "SMC (Smart Money)", accuracy: 87, trades: 156, pnl: "+$12,450", status: "active" as const },
    { name: "ICT (Inner Circle)", accuracy: 82, trades: 203, pnl: "+$8,720", status: "active" as const },
    { name: "ORB (Opening Range)", accuracy: 75, trades: 89, pnl: "+$5,340", status: "learning" as const },
    { name: "Turtle Soup", accuracy: 73, trades: 45, pnl: "+$2,890", status: "learning" as const },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary animate-pulse-glow" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                MarketMind AI
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleTimeString()} • Self-Learning Trading Bot
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={isActive ? "success" : "default"}
            size="lg"
            onClick={() => setIsActive(!isActive)}
            className="relative"
          >
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? "Active" : "Stopped"}
          </Button>
          <Button variant="outline" size="lg">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Equity"
          value="$127,543"
          change="+8.7% today"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Win Rate"
          value="84.2%"
          change="+2.1% this week"
          trend="up"
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Trades"
          value="12"
          change="3 pending"
          trend="up"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Risk Level"
          value="2.1%"
          change="Within limits"
          trend="up"
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategies">AI Strategies</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="learning">Learning Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {strategies.map((strategy, index) => (
              <StrategyCard key={index} {...strategy} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Market Confluence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Support & Resistance</span>
                    <Badge variant="success">Strong</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Order Blocks</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fair Value Gaps</span>
                    <Badge variant="warning">Moderate</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Liquidity Zones</span>
                    <Badge variant="success">Optimal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Real-time Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                  <div>
                    <div className="font-semibold text-success">EUR/USD</div>
                    <div className="text-sm text-muted-foreground">Long Signal</div>
                  </div>
                  <Badge variant="success">High Confidence</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div>
                    <div className="font-semibold text-warning">GBP/JPY</div>
                    <div className="text-sm text-muted-foreground">Waiting for Confirmation</div>
                  </div>
                  <Badge variant="warning">Medium</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-chart rounded-lg flex items-center justify-center text-muted-foreground">
                Interactive Performance Chart Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                AI Learning Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Model Training Progress</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Analysis</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Strategy Optimization</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm font-medium text-primary mb-1">Learning Status</div>
                <div className="text-sm text-muted-foreground">
                  Analyzing 250,000+ historical trades to optimize strategy selection.
                  Next optimization cycle in 2h 34m.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};