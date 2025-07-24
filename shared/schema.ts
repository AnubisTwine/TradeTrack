import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'LONG', 'SHORT'
  quantity: integer("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  entryDate: timestamp("entry_date").notNull(),
  exitDate: timestamp("exit_date"),
  pnl: real("pnl"),
  commission: real("commission").default(0),
  instrumentType: text("instrument_type").notNull().default("stock"), // 'stock', 'option', 'futures', 'forex', 'crypto'
  strategy: text("strategy"),
  notes: text("notes"),
  isOpen: boolean("is_open").notNull().default(false),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
});

export const updateTradeSchema = insertTradeSchema.partial().extend({
  id: z.number(),
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type UpdateTrade = z.infer<typeof updateTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// CSV import schema for validation
export const csvTradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  side: z.enum(["LONG", "SHORT"], { message: "Side must be LONG or SHORT" }),
  quantity: z.number().positive("Quantity must be positive"),
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive").optional(),
  entryDate: z.string().transform(str => new Date(str)),
  exitDate: z.string().transform(str => new Date(str)).optional(),
  commission: z.number().min(0).optional(),
  instrumentType: z.enum(["stock", "option", "futures", "forex", "crypto"]).optional(),
  strategy: z.string().optional(),
  notes: z.string().optional(),
});

export type CsvTrade = z.infer<typeof csvTradeSchema>;
