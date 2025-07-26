import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  TrendingUp,
  Bot,
  ArrowRight,
  Play,
  ChevronDown
} from "lucide-react";
import heroImage from "@/assets/hero-trading-ai.jpg";

export const HeroSection = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Self-Learning AI",
      description: "Reinforcement learning adapts to market conditions in real-time"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Multi-Strategy Engine",
      description: "SMC, ICT, ORB, CTR, and Turtle Soup strategies combined"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "25+ Analysis Topics",
      description: "Advanced confluence analysis for maximum precision"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Management",
      description: "Automated SL/TP with daily loss caps and break-even logic"
    }
  ];

  const stats = [
    { label: "Win Rate", value: "84.7%" },
    { label: "Strategies", value: "5+" },
    { label: "Markets", value: "All" },
    { label: "Uptime", value: "99.9%" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary animate-pulse-glow" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MarketMind AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">Docs</Button>
            <Button variant="hero" size="lg">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </nav>

        {/* Main Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Bot className="h-3 w-3 mr-1" />
                  Next-Gen Trading AI
                </Badge>
                
                <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                  Adaptive
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Self-Learning
                  </span>
                  Trading Bot
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Harness the power of reinforcement learning and advanced market analysis. 
                  MarketMind AI dynamically selects optimal strategies across Forex, Crypto, 
                  Stocks, and Synthetic Indices.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" className="group">
                  <Play className="h-5 w-5 mr-2" />
                  Start Trading
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="xl">
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 pt-8 border-t border-border/50">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 group hover:shadow-glow-primary/20 transition-all duration-300">
                  <div className="space-y-3">
                    <div className="text-primary group-hover:animate-pulse-glow">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center pb-8">
          <Button variant="ghost" size="sm" className="animate-bounce">
            <ChevronDown className="h-4 w-4 mr-2" />
            Explore Features
          </Button>
        </div>
      </div>
    </div>
  );
};