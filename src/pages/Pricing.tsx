import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Rocket, Brain } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: "Demo",
      price: "Free",
      description: "Perfect for testing our AI strategies",
      icon: Brain,
      features: [
        "Simulated trading environment",
        "All AI strategies included",
        "Real market data",
        "Performance analytics",
        "7-day access",
        "Community support"
      ],
      limitations: [
        "No live trading",
        "Limited demo time"
      ],
      buttonText: "Try Demo",
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For serious traders ready to automate",
      icon: Zap,
      features: [
        "Live MT5 trading",
        "All AI strategies",
        "Risk management tools",
        "Real-time signals",
        "Trade history & analytics",
        "Email & SMS alerts",
        "Priority support",
        "Strategy customization"
      ],
      limitations: [],
      buttonText: "Start Trading",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Advanced features for professional traders",
      icon: Crown,
      features: [
        "Everything in Professional",
        "Multiple MT5 accounts",
        "Advanced risk controls",
        "Custom strategy development",
        "API access",
        "White-label solution",
        "Dedicated account manager",
        "24/7 phone support"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How does the AI trading work?",
      answer: "MarketMind AI uses advanced machine learning algorithms to analyze market data, identify patterns, and execute trades based on proven strategies. The system continuously learns and adapts to market conditions."
    },
    {
      question: "Is my money safe?",
      answer: "Yes. MarketMind AI only connects to your MT5 account for trading execution. We never have access to your funds or personal banking information. All connections are encrypted and secure."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time. There are no long-term contracts or hidden fees. Your access will continue until the end of your current billing period."
    },
    {
      question: "What brokers do you support?",
      answer: "We support all MT5 brokers. Simply connect your existing MT5 account and start trading. Popular brokers include IC Markets, Pepperstone, FXCM, and many others."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for new subscribers. If you're not satisfied with the performance, we'll refund your subscription fee."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="h-4 w-4 mr-1" />
            Pricing Plans
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with our free demo, then upgrade to live trading when you're ready. 
            All plans include our advanced AI strategies and risk management tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                <plan.icon className={`h-12 w-12 mx-auto mb-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Feature Comparison</CardTitle>
            <CardDescription className="text-center">
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-2">Features</th>
                    <th className="text-center py-4 px-2">Demo</th>
                    <th className="text-center py-4 px-2">Professional</th>
                    <th className="text-center py-4 px-2">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ["AI Trading Strategies", "✓", "✓", "✓"],
                    ["Live MT5 Trading", "✗", "✓", "✓"],
                    ["Risk Management", "✓", "✓", "✓"],
                    ["Real-time Alerts", "✗", "✓", "✓"],
                    ["Multiple Accounts", "✗", "✗", "✓"],
                    ["API Access", "✗", "✗", "✓"],
                    ["Custom Strategies", "✗", "✗", "✓"],
                    ["24/7 Support", "✗", "✗", "✓"]
                  ].map(([feature, demo, pro, enterprise], idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 px-2 font-medium">{feature}</td>
                      <td className="text-center py-3 px-2">
                        {demo === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : "✗"}
                      </td>
                      <td className="text-center py-3 px-2">
                        {pro === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : "✗"}
                      </td>
                      <td className="text-center py-3 px-2">
                        {enterprise === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : "✗"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Get answers to common questions about MarketMind AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-16 text-center">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders who trust MarketMind AI to automate their trading 
              and maximize their profits.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Start Free Demo
              </Button>
              <Button variant="outline" size="lg">
                Schedule Demo Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}