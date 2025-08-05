import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { MarketMindDiagram } from "@/components/MarketMindDiagram";
import { TradingDashboard } from "@/components/TradingDashboard";
import { Link } from "react-router-dom";
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
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">MarketMind AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/demo">
                <Button variant="ghost">Demo</Button>
              </Link>
              <Link to="/docs">
                <Button variant="ghost">Documentation</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link to="/demo">
                <Button>Try Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <MarketMindDiagram />
      <div className="container mx-auto px-4 py-8">
        <TradingDashboard />
      </div>
    </div>
  );
};


export default Index;