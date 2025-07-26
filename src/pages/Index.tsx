import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TradingDashboard } from "@/components/TradingDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <TradingDashboard />;
  }

  const strategies = [
    {
      name: "SMC (Smart Money Concepts)",
      description: "Institutional trading methodology focusing on market structure and liquidity",
      accuracy: "87%",
      markets: ["Forex", "Indices"]
    },
    {
      name: "ICT (Inner Circle Trader)",
      description: "Advanced price action concepts with precise entry models",
      accuracy: "82%",
      markets: ["Forex", "Crypto"]
    },
    {
      name: "ORB (Opening Range Breakout)",
      description: "Session-based momentum trading strategy",
      accuracy: "75%",
      markets: ["Stocks", "Indices"]
    },
    {
      name: "CTR (Countertrend Reversal)",
      description: "Mean reversion strategy for oversold/overbought conditions",
      accuracy: "69%",
      markets: ["All Markets"]
    },
    {
      name: "Turtle Soup",
      description: "False breakout reversal strategy for range-bound markets",
      accuracy: "73%",
      markets: ["Forex", "Crypto"]
    }
  ];

  const analysisTopics = [
    "Support and Resistance", "Trendlines and Channels", "Chart Patterns", "Candlestick Patterns",
    "Price Action", "Market Structure", "Break of Structure (BOS)", "Change of Character (CHoCH)",
    "Liquidity Zones", "Supply and Demand Zones", "Order Blocks", "Fair Value Gaps (FVGs)",
    "Inducement", "Internal vs External Structure", "Fibonacci Levels", "Timeframes Analysis",
    "Volume Analysis", "Divergence Analysis", "Entry Models", "Risk-to-Reward Analysis",
    "Confirmation Tools", "Trend vs Reversal Setups", "Swing Highs and Lows", "Re-entry Points", "News Impact Analysis"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Trading
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Revolutionary Trading Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of automated trading with our self-learning AI that adapts 
              to market conditions and optimizes strategies in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>Multi-Strategy Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Combines 5 proven trading strategies with dynamic selection based on market conditions and historical performance.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <Brain className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>Self-Learning AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reinforcement learning algorithm that continuously improves strategy selection and trade execution based on outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>Advanced Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automated SL/TP management, daily loss caps, break-even logic, and position sizing based on account equity.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>Real-time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  25+ confluence factors analyzed simultaneously for maximum trade precision and optimal entry/exit timing.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>Multi-Market Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trade across Forex, Crypto, Stocks, and Synthetic Indices with unified strategy management and execution.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow-primary/20 transition-all duration-300">
              <CardHeader>
                <Clock className="h-10 w-10 text-primary group-hover:animate-pulse-glow" />
                <CardTitle>24/7 Operation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Continuous market monitoring with session-aware trading logic and automated news impact filtering.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setShowDashboard(true)}
              className="group"
            >
              <Brain className="h-5 w-5 mr-2" />
              Launch Trading Dashboard
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Strategies Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Adaptive Strategy Selection
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI dynamically selects the optimal strategy based on current market conditions, 
              historical performance, and real-time confluence analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {strategies.map((strategy, index) => (
              <Card key={index} className="group hover:shadow-glow-primary/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge variant="success">{strategy.accuracy}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{strategy.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.markets.map((market, idx) => (
                      <Badge key={idx} variant="outline">{market}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Topics Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Comprehensive Market Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              25+ key trading concepts analyzed simultaneously to identify high-probability setups 
              with maximum confluence and precision.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analysisTopics.map((topic, index) => (
              <div 
                key={index} 
                className="group p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary group-hover:animate-pulse-glow" />
                  <span className="text-sm font-medium">{topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the future of automated trading with MarketMind AI's adaptive, 
            self-learning technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setShowDashboard(true)}
              className="group"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl">
              Schedule Demo
            </Button>
          </div>

          <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              1000+ Active Traders
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              4.9/5 Rating
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Enterprise Security
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;