import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, DollarSign, Target, Clock } from 'lucide-react';
import { tradeManager, Trade, TradeSummary } from '@/lib/trading/tradeManager';

export function TradeHistory() {
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<TradeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setActiveTrades(tradeManager.getActiveTrades());
      setTradeHistory(tradeManager.getTradeHistory());
      setSummary(tradeManager.getTradeSummary());
    };

    // Initial load
    updateData();

    // Subscribe to updates
    tradeManager.subscribe(updateData);

    return () => {
      tradeManager.unsubscribe(updateData);
    };
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTrades(tradeManager.getActiveTrades());
      setTradeHistory(tradeManager.getTradeHistory());
      setSummary(tradeManager.getTradeSummary());
      setIsLoading(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const closeTrade = async (tradeId: string) => {
    await tradeManager.closeTrade(tradeId);
  };

  const TradeRow = ({ trade, showActions = false }: { trade: Trade; showActions?: boolean }) => (
    <TableRow>
      <TableCell className="font-medium">{trade.symbol}</TableCell>
      <TableCell>
        <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
          {trade.type}
        </Badge>
      </TableCell>
      <TableCell>{trade.volume}</TableCell>
      <TableCell>{trade.openPrice.toFixed(5)}</TableCell>
      <TableCell>{trade.currentPrice.toFixed(5)}</TableCell>
      <TableCell>
        <span className={formatProfitColor(trade.profit)}>
          {formatCurrency(trade.profit)}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatDateTime(trade.openTime)}
      </TableCell>
      <TableCell className="text-xs">{trade.strategy}</TableCell>
      {showActions && (
        <TableCell>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => closeTrade(trade.id)}
          >
            Close
          </Button>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Trades</p>
                  <p className="text-2xl font-bold">{summary.totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Win Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.winRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className={`h-4 w-4 ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-sm font-medium">Total P&L</p>
                  <p className={`text-2xl font-bold ${formatProfitColor(summary.totalProfit)}`}>
                    {formatCurrency(summary.totalProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Avg Win</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.avgWin)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Avg Loss</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{formatCurrency(summary.avgLoss)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Profit Factor</p>
                  <p className="text-2xl font-bold">
                    {summary.profitFactor.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Trade Management
              </CardTitle>
              <CardDescription>
                Track your active positions and trading history
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active Trades ({activeTrades.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                Trade History ({tradeHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeTrades.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active trades</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start the AI trading bot to see trades appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Open Price</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Open Time</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTrades.map((trade) => (
                      <TradeRow key={trade.id} trade={trade} showActions={true} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {tradeHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trade history</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Closed trades will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Open Price</TableHead>
                      <TableHead>Close Price</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Open Time</TableHead>
                      <TableHead>Strategy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.slice(-50).reverse().map((trade) => (
                      <TradeRow key={trade.id} trade={trade} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}