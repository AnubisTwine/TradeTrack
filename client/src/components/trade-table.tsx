import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Edit2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Trade {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number | null;
  pnl: number | null;
  entryDate: string;
  instrumentType: string;
  isOpen: boolean;
}

interface TradeTableProps {
  trades: Trade[];
  isLoading?: boolean;
  onViewTrade?: (trade: Trade) => void;
  onEditTrade?: (trade: Trade) => void;
}

export default function TradeTable({ 
  trades, 
  isLoading, 
  onViewTrade, 
  onEditTrade 
}: TradeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  // Filter trades based on search term
  const filteredTrades = trades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.side.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const currentTrades = filteredTrades.slice(startIndex, endIndex);

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSideColor = (side: string) => {
    return side === "LONG" ? "bg-profit-green/10 text-profit-green" : "bg-loss-red/10 text-loss-red";
  };

  const getPnLColor = (pnl: number | null) => {
    if (pnl === null) return "text-text-muted";
    return pnl >= 0 ? "text-profit-green" : "text-loss-red";
  };

  const getInstrumentColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock':
        return "bg-info-blue/10 text-info-blue";
      case 'option':
        return "bg-warning-yellow/10 text-warning-yellow";
      case 'futures':
        return "bg-purple-500/10 text-purple-400";
      case 'forex':
        return "bg-green-500/10 text-green-400";
      case 'crypto':
        return "bg-orange-500/10 text-orange-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-card border-dark-border">
        <CardHeader className="border-b border-dark-border">
          <div className="animate-pulse">
            <div className="h-6 bg-dark-border rounded w-32 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-dark-border rounded w-64"></div>
              <div className="h-10 bg-dark-border rounded w-20"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-4 bg-dark-border rounded w-16"></div>
                <div className="h-4 bg-dark-border rounded w-12"></div>
                <div className="h-4 bg-dark-border rounded w-20"></div>
                <div className="h-4 bg-dark-border rounded w-24"></div>
                <div className="h-4 bg-dark-border rounded w-24"></div>
                <div className="h-4 bg-dark-border rounded w-20"></div>
                <div className="h-4 bg-dark-border rounded w-24"></div>
                <div className="h-4 bg-dark-border rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-card border-dark-border overflow-hidden">
      <CardHeader className="border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Trades</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-bg border-dark-border pl-9 pr-3 py-2 text-sm w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-dark-bg border-dark-border hover:bg-dark-border"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-dark-bg">
              <TableRow className="border-dark-border">
                <TableHead className="text-text-muted">Symbol</TableHead>
                <TableHead className="text-text-muted">Side</TableHead>
                <TableHead className="text-text-muted">Quantity</TableHead>
                <TableHead className="text-text-muted">Entry Price</TableHead>
                <TableHead className="text-text-muted">Exit Price</TableHead>
                <TableHead className="text-text-muted">P&L</TableHead>
                <TableHead className="text-text-muted">Date</TableHead>
                <TableHead className="text-text-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-dark-border">
              {currentTrades.length > 0 ? (
                currentTrades.map((trade) => (
                  <TableRow
                    key={trade.id}
                    className="hover:bg-dark-bg/50 border-dark-border cursor-pointer"
                    onClick={() => onViewTrade?.(trade)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{trade.symbol}</span>
                        <Badge className={getInstrumentColor(trade.instrumentType)}>
                          {trade.instrumentType.charAt(0).toUpperCase() + trade.instrumentType.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSideColor(trade.side)}>
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{trade.quantity}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(trade.entryPrice)}</TableCell>
                    <TableCell className="text-sm">
                      {trade.isOpen ? (
                        <Badge variant="outline" className="text-warning-yellow border-warning-yellow/20">
                          Open
                        </Badge>
                      ) : (
                        formatCurrency(trade.exitPrice)
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPnLColor(trade.pnl)}`}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {formatDate(trade.entryDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTrade?.(trade);
                          }}
                          className="text-info-blue hover:text-info-blue/80 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTrade?.(trade);
                          }}
                          className="text-text-muted hover:text-white p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-text-muted">
                      {searchTerm ? "No trades match your search" : "No trades found"}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTrades.length)} of{" "}
                {filteredTrades.length} trades
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-dark-border hover:bg-dark-border"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 2)
                  .map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        page === currentPage
                          ? "bg-info-blue text-white"
                          : "border-dark-border hover:bg-dark-border"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-dark-border hover:bg-dark-border"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
