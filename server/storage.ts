import { trades, type Trade, type InsertTrade, type UpdateTrade } from "@shared/schema";

export interface IStorage {
  // Trade operations
  getTrade(id: number): Promise<Trade | undefined>;
  getAllTrades(): Promise<Trade[]>;
  getTradesByDateRange(startDate: Date, endDate: Date): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(trade: UpdateTrade): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  
  // Bulk operations
  createTrades(trades: InsertTrade[]): Promise<Trade[]>;
  
  // Analytics
  getTradingMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalPnL: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
  }>;
}

export class MemStorage implements IStorage {
  private trades: Map<number, Trade>;
  private currentId: number;

  constructor() {
    this.trades = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Add some sample trades for demonstration
    const sampleTrades: InsertTrade[] = [
      {
        symbol: "AAPL",
        side: "LONG",
        quantity: 100,
        entryPrice: 175.42,
        exitPrice: 178.91,
        entryDate: new Date("2024-12-15T09:30:00Z"),
        exitDate: new Date("2024-12-15T15:30:00Z"),
        pnl: 349.00,
        commission: 2.50,
        instrumentType: "stock",
        strategy: "Momentum",
        notes: "Good breakout above resistance with strong volume",
        isOpen: false,
      },
      {
        symbol: "TSLA",
        side: "SHORT",
        quantity: 50,
        entryPrice: 248.76,
        exitPrice: 245.32,
        entryDate: new Date("2024-12-14T10:15:00Z"),
        exitDate: new Date("2024-12-14T14:45:00Z"),
        pnl: 172.00,
        commission: 1.50,
        instrumentType: "stock",
        strategy: "Reversal",
        notes: "Failed to hold support level",
        isOpen: false,
      },
      {
        symbol: "SPY",
        side: "LONG",
        quantity: 5,
        entryPrice: 2.45,
        exitPrice: 1.89,
        entryDate: new Date("2024-12-13T11:00:00Z"),
        exitDate: new Date("2024-12-13T16:00:00Z"),
        pnl: -280.00,
        commission: 5.00,
        instrumentType: "option",
        strategy: "Breakout",
        notes: "False breakout, cut losses quickly",
        isOpen: false,
      },
    ];

    sampleTrades.forEach(trade => {
      this.createTrade(trade);
    });
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }

  async getTradesByDateRange(startDate: Date, endDate: Date): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(trade => {
      const tradeDate = new Date(trade.entryDate);
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentId++;
    
    // Calculate P&L if not provided and trade is closed
    let pnl = insertTrade.pnl;
    if (!pnl && insertTrade.exitPrice && !insertTrade.isOpen) {
      const priceChange = insertTrade.exitPrice - insertTrade.entryPrice;
      const multiplier = insertTrade.side === "LONG" ? 1 : -1;
      pnl = (priceChange * multiplier * insertTrade.quantity) - (insertTrade.commission || 0);
    }

    const trade: Trade = { 
      ...insertTrade, 
      id,
      pnl: pnl || null,
    };
    
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(updateTrade: UpdateTrade): Promise<Trade | undefined> {
    const existingTrade = this.trades.get(updateTrade.id);
    if (!existingTrade) return undefined;

    // Recalculate P&L if prices changed
    let pnl = updateTrade.pnl;
    if (updateTrade.exitPrice !== undefined && updateTrade.entryPrice !== undefined) {
      const priceChange = updateTrade.exitPrice - updateTrade.entryPrice;
      const side = updateTrade.side || existingTrade.side;
      const quantity = updateTrade.quantity || existingTrade.quantity;
      const commission = updateTrade.commission || existingTrade.commission || 0;
      const multiplier = side === "LONG" ? 1 : -1;
      pnl = (priceChange * multiplier * quantity) - commission;
    }

    const updatedTrade: Trade = {
      ...existingTrade,
      ...updateTrade,
      pnl: pnl !== undefined ? pnl : existingTrade.pnl,
    };

    this.trades.set(updateTrade.id, updatedTrade);
    return updatedTrade;
  }

  async deleteTrade(id: number): Promise<boolean> {
    return this.trades.delete(id);
  }

  async createTrades(insertTrades: InsertTrade[]): Promise<Trade[]> {
    const createdTrades = [];
    for (const trade of insertTrades) {
      createdTrades.push(await this.createTrade(trade));
    }
    return createdTrades;
  }

  async getTradingMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalPnL: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    profitFactor: number;
  }> {
    let tradesData: Trade[] = Array.from(this.trades.values());
    
    // Filter by date range if provided
    if (startDate && endDate) {
      tradesData = tradesData.filter(trade => {
        const tradeDate = new Date(trade.entryDate);
        return tradeDate >= startDate && tradeDate <= endDate;
      });
    }

    // Only consider closed trades for metrics
    const closedTrades = tradesData.filter(trade => !trade.isOpen && trade.pnl !== null);
    
    const totalTrades = closedTrades.length;
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    const winningTrades = closedTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    return {
      totalPnL,
      winRate,
      avgWin,
      avgLoss,
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      profitFactor,
    };
  }
}

export const storage = new MemStorage();
