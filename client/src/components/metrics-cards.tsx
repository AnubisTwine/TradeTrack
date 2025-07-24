import { DollarSign, Percent, TrendingUp, List, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsData {
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
}

interface MetricsCardsProps {
  data: MetricsData;
  isLoading?: boolean;
}

export default function MetricsCards({ data, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-dark-border rounded mb-2"></div>
                <div className="h-8 bg-dark-border rounded mb-2"></div>
                <div className="h-4 bg-dark-border rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const pnlColor = data.totalPnL >= 0 ? "text-profit-green" : "text-loss-red";
  const pnlTrend = data.totalPnL >= 0 ? "up" : "down";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total P&L</p>
              <p className={`text-2xl font-bold ${pnlColor}`}>
                {formatCurrency(data.totalPnL)}
              </p>
              <p className={`${pnlColor} text-sm mt-1`}>
                <TrendingUp className={`inline w-3 h-3 mr-1 ${pnlTrend === 'down' ? 'rotate-180' : ''}`} />
                Performance
              </p>
            </div>
            <div className="w-12 h-12 bg-profit-green/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-profit-green" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatPercentage(data.winRate)}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {data.winningTrades}W / {data.losingTrades}L
              </p>
            </div>
            <div className="w-12 h-12 bg-info-blue/10 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-info-blue" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Avg. Win</p>
              <p className="text-2xl font-bold text-profit-green">
                {formatCurrency(data.avgWin)}
              </p>
              <p className="text-text-muted text-sm mt-1">
                vs {formatCurrency(data.avgLoss)} avg loss
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-yellow/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning-yellow" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-text-primary">
                {data.totalTrades}
              </p>
              <p className="text-info-blue text-sm mt-1">
                <Plus className="inline w-3 h-3 mr-1" />
                Track performance
              </p>
            </div>
            <div className="w-12 h-12 bg-loss-red/10 rounded-lg flex items-center justify-center">
              <List className="w-6 h-6 text-loss-red" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
