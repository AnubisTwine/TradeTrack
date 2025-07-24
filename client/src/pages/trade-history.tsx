import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TradeTable from "@/components/trade-table";
import { Card, CardContent } from "@/components/ui/card";
import type { Trade } from "@shared/schema";

export default function TradeHistory() {
  const [filters, setFilters] = useState({
    search: "",
    side: "",
    instrument: "",
    dateRange: "all",
  });

  // Fetch all trades
  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  // Apply filters to trades
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = !filters.search || 
      trade.symbol.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSide = !filters.side || trade.side === filters.side;
    
    const matchesInstrument = !filters.instrument || 
      trade.instrumentType === filters.instrument;
    
    // TODO: Implement date range filtering
    
    return matchesSearch && matchesSide && matchesInstrument;
  });

  const handleViewTrade = (trade: any) => {
    // TODO: Open trade detail modal
    console.log('View trade:', trade);
  };

  const handleEditTrade = (trade: any) => {
    // TODO: Open trade edit modal
    console.log('Edit trade:', trade);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export trades to CSV');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Trade History</h2>
            <p className="text-text-muted text-sm">Complete record of all your trades</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-dark-border hover:bg-dark-border"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <Card className="mb-6 bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Search symbol..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="bg-dark-bg border-dark-border"
                />
              </div>
              
              <Select
                value={filters.side}
                onValueChange={(value) => setFilters({ ...filters, side: value })}
              >
                <SelectTrigger className="bg-dark-bg border-dark-border">
                  <SelectValue placeholder="All Sides" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  <SelectItem value="">All Sides</SelectItem>
                  <SelectItem value="LONG">Long</SelectItem>
                  <SelectItem value="SHORT">Short</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.instrument}
                onValueChange={(value) => setFilters({ ...filters, instrument: value })}
              >
                <SelectTrigger className="bg-dark-bg border-dark-border">
                  <SelectValue placeholder="All Instruments" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  <SelectItem value="">All Instruments</SelectItem>
                  <SelectItem value="stock">Stocks</SelectItem>
                  <SelectItem value="option">Options</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger className="bg-dark-bg border-dark-border">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setFilters({ search: "", side: "", instrument: "", dateRange: "all" })}
                variant="outline"
                className="border-dark-border hover:bg-dark-border"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{filteredTrades.length}</p>
              <p className="text-sm text-text-muted">Total Trades</p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-profit-green">
                {filteredTrades.filter((t: any) => (t.pnl || 0) > 0).length}
              </p>
              <p className="text-sm text-text-muted">Winning Trades</p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-loss-red">
                {filteredTrades.filter((t: any) => (t.pnl || 0) < 0).length}
              </p>
              <p className="text-sm text-text-muted">Losing Trades</p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">
                {filteredTrades.filter((t: any) => t.isOpen).length}
              </p>
              <p className="text-sm text-text-muted">Open Positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Trade Table */}
        <TradeTable
          trades={filteredTrades}
          isLoading={isLoading}
          onViewTrade={handleViewTrade}
          onEditTrade={handleEditTrade}
        />
      </main>
    </>
  );
}
