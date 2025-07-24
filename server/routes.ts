import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, updateTradeSchema, csvTradeSchema } from "@shared/schema";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all trades
  app.get("/api/trades", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let trades;
      if (startDate && endDate) {
        trades = await storage.getTradesByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        trades = await storage.getAllTrades();
      }
      
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  // Get single trade
  app.get("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trade = await storage.getTrade(id);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      res.json(trade);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  // Create new trade
  app.post("/api/trades", async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      res.status(201).json(trade);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trade" });
    }
  });

  // Update trade
  app.put("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tradeData = updateTradeSchema.parse({ ...req.body, id });
      
      const trade = await storage.updateTrade(tradeData);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      res.json(trade);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  // Delete trade
  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrade(id);
      
      if (!success) {
        return res.status(404).json({ message: "Trade not found" });
      }
      
      res.json({ message: "Trade deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // Get trading metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const metrics = await storage.getTradingMetrics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // CSV import endpoint
  app.post("/api/trades/import", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file provided" });
      }

      const { broker } = req.body;
      const csvContent = req.file.buffer.toString('utf8');
      
      // Parse CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (records.length === 0) {
        return res.status(400).json({ message: "CSV file is empty" });
      }

      // Transform and validate trades based on broker format
      const trades = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        try {
          let tradeData;
          
          // Handle different broker formats
          if (broker === "interactive_brokers") {
            tradeData = parseIBFormat(records[i]);
          } else if (broker === "tradestation") {
            tradeData = parseTradeStationFormat(records[i]);
          } else {
            // Generic format
            tradeData = parseGenericFormat(records[i]);
          }

          // Validate the trade data
          const validatedTrade = csvTradeSchema.parse(tradeData);
          
          // Convert to InsertTrade format
          const insertTrade = {
            symbol: validatedTrade.symbol,
            side: validatedTrade.side,
            quantity: validatedTrade.quantity,
            entryPrice: validatedTrade.entryPrice,
            exitPrice: validatedTrade.exitPrice,
            entryDate: validatedTrade.entryDate,
            exitDate: validatedTrade.exitDate,
            commission: validatedTrade.commission || 0,
            instrumentType: validatedTrade.instrumentType || "stock",
            strategy: validatedTrade.strategy,
            notes: validatedTrade.notes,
            isOpen: !validatedTrade.exitPrice,
          };

          trades.push(insertTrade);
        } catch (error: any) {
          errors.push({
            row: i + 1,
            error: error.message || "Invalid trade data",
            data: records[i]
          });
        }
      }

      if (errors.length > 0 && trades.length === 0) {
        return res.status(400).json({ 
          message: "All trades failed validation", 
          errors: errors.slice(0, 10) // Limit error responses
        });
      }

      // Import valid trades
      const importedTrades = await storage.createTrades(trades);

      res.json({
        message: `Successfully imported ${importedTrades.length} trades`,
        imported: importedTrades.length,
        errors: errors.length,
        errorDetails: errors.slice(0, 5), // Show first 5 errors
        trades: importedTrades
      });

    } catch (error: any) {
      console.error("CSV import error:", error);
      res.status(500).json({ 
        message: "Failed to import CSV", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for parsing different broker formats
function parseIBFormat(record: any) {
  return {
    symbol: record.Symbol || record.symbol,
    side: record.Side?.toUpperCase() === "BUY" ? "LONG" : "SHORT",
    quantity: parseInt(record.Quantity || record.quantity),
    entryPrice: parseFloat(record.Price || record.price),
    exitPrice: record.ExitPrice ? parseFloat(record.ExitPrice) : undefined,
    entryDate: record.DateTime || record.dateTime,
    exitDate: record.ExitDateTime || undefined,
    commission: parseFloat(record.Commission || record.commission || 0),
    instrumentType: record.AssetCategory?.toLowerCase() || "stock",
  };
}

function parseTradeStationFormat(record: any) {
  return {
    symbol: record.Symbol,
    side: record.BuySell?.toUpperCase() === "BUY" ? "LONG" : "SHORT",
    quantity: parseInt(record.Qty),
    entryPrice: parseFloat(record.Price),
    exitPrice: record.ExitPrice ? parseFloat(record.ExitPrice) : undefined,
    entryDate: record.ExecTime,
    commission: parseFloat(record.Comm || 0),
    instrumentType: "stock",
  };
}

function parseGenericFormat(record: any) {
  return {
    symbol: record.Symbol || record.symbol,
    side: (record.Side || record.side)?.toUpperCase(),
    quantity: parseInt(record.Quantity || record.quantity),
    entryPrice: parseFloat(record.EntryPrice || record.entryPrice || record.Price || record.price),
    exitPrice: record.ExitPrice || record.exitPrice ? parseFloat(record.ExitPrice || record.exitPrice) : undefined,
    entryDate: record.EntryDate || record.entryDate || record.Date || record.date,
    exitDate: record.ExitDate || record.exitDate,
    commission: parseFloat(record.Commission || record.commission || 0),
    instrumentType: (record.InstrumentType || record.instrumentType || "stock").toLowerCase(),
    strategy: record.Strategy || record.strategy,
    notes: record.Notes || record.notes,
  };
}
