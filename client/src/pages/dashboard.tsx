import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MetricsCards from "@/components/metrics-cards";
import PerformanceChart from "@/components/performance-chart";
import TradeTable from "@/components/trade-table";
import CsvImport from "@/components/csv-import";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import type { Trade } from "@shared/schema";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState("last_30_days");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [, navigate] = useLocation();

  // Fetch trades
  const { data: trades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    totalPnL: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
  }>({
    queryKey: ['/api/metrics'],
  });

  const handleViewTrade = (trade: any) => {
    // TODO: Open trade detail modal
    console.log('View trade:', trade);
  };

  const handleEditTrade = (trade: any) => {
    // TODO: Open trade edit modal
    console.log('Edit trade:', trade);
  };

  const handleImportComplete = () => {
    setImportDialogOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-text-muted text-sm">Trading performance overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="bg-dark-bg border-dark-border w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="bg-info-blue hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Trades
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Key Metrics */}
        <MetricsCards data={metrics || {
          totalPnL: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          profitFactor: 0
        }} isLoading={metricsLoading} />

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PerformanceChart trades={trades} isLoading={tradesLoading} />
          
          {/* Quick Import Card */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => setImportDialogOpen(true)}
                className="w-full bg-info-blue hover:bg-blue-600 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button
                onClick={() => navigate('/manual-entry')}
                variant="outline"
                className="w-full border-dark-border hover:bg-dark-border"
              >
                Manual Entry
              </Button>
              <Button
                onClick={() => navigate('/history')}
                variant="outline"
                className="w-full border-dark-border hover:bg-dark-border"
              >
                View All Trades
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-info-blue/10 border border-info-blue/20 rounded-lg">
              <h4 className="text-sm font-medium text-info-blue mb-2">Pro Tip</h4>
              <p className="text-xs text-text-muted">
                Import your broker statements regularly to keep your performance tracking up to date.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Trades Table */}
        <TradeTable
          trades={trades.slice(0, 10)} // Show only recent trades on dashboard
          isLoading={tradesLoading}
          onViewTrade={handleViewTrade}
          onEditTrade={handleEditTrade}
        />
      </main>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-dark-card border-dark-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Trades</DialogTitle>
          </DialogHeader>
          <CsvImport onImportComplete={handleImportComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
}
