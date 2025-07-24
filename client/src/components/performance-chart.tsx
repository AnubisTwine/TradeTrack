import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

interface Trade {
  id: number;
  symbol: string;
  entryDate: string;
  pnl: number | null;
}

interface PerformanceChartProps {
  trades: Trade[];
  isLoading?: boolean;
}

export default function PerformanceChart({ trades, isLoading }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState('1M');

  // Calculate cumulative P&L data for chart
  const chartData = trades
    .filter(trade => trade.pnl !== null)
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .reduce((acc, trade, index) => {
      const date = new Date(trade.entryDate).toLocaleDateString();
      const cumulativePnL = (acc[acc.length - 1]?.cumulativePnL || 0) + (trade.pnl || 0);
      
      acc.push({
        date,
        pnl: trade.pnl || 0,
        cumulativePnL,
        tradeNumber: index + 1,
      });
      
      return acc;
    }, [] as Array<{ date: string; pnl: number; cumulativePnL: number; tradeNumber: number }>);

  const timeframeButtons = [
    { label: '1D', value: '1D' },
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
  ];

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">P&L Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-dark-bg rounded-lg flex items-center justify-center border border-dark-border">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 bg-dark-border rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-dark-border rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-dark-border rounded w-48 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 bg-dark-card border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">P&L Performance</CardTitle>
          <div className="flex space-x-2">
            {timeframeButtons.map(({ label, value }) => (
              <Button
                key={value}
                variant={timeframe === value ? "default" : "ghost"}
                size="sm"
                className={
                  timeframe === value
                    ? "bg-info-blue/10 text-info-blue border border-info-blue/20"
                    : "text-text-muted hover:bg-dark-border hover:text-white"
                }
                onClick={() => setTimeframe(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 20%, 18%)" />
                <XAxis 
                  dataKey="tradeNumber" 
                  stroke="hsl(218, 11%, 58%)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(218, 11%, 58%)"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(218, 23%, 13%)',
                    border: '1px solid hsl(218, 20%, 18%)',
                    borderRadius: '8px',
                    color: 'hsl(218, 11%, 94%)',
                  }}
                  labelFormatter={(label) => `Trade #${label}`}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'cumulativePnL' ? 'Cumulative P&L' : 'Trade P&L'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativePnL"
                  stroke="hsl(207, 90%, 54%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(207, 90%, 54%)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(207, 90%, 54%)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-dark-bg rounded-lg flex items-center justify-center border border-dark-border">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-text-muted mb-4 mx-auto" />
              <p className="text-text-muted mb-2">No Trading Data</p>
              <p className="text-sm text-text-muted">Import trades to see performance chart</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
