# TradeZilla - Trading Journal Application

## Overview

TradeZilla is a comprehensive trading journal application designed to help traders track, analyze, and improve their trading performance. The application provides functionality for importing trades from CSV files, manual trade entry, performance analytics, and trade history management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React** with **TypeScript** and follows a modern component-based architecture:

- **Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with custom dark theme variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
The backend uses **Express.js** with TypeScript in an ESM configuration:

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **File Uploads**: Multer for CSV file handling
- **CSV Processing**: csv-parse library for parsing trading data

### Build System
- **Frontend Build**: Vite for fast development and optimized production builds
- **Backend Build**: esbuild for server-side bundling
- **Development**: Hot Module Replacement (HMR) with Vite dev server

## Key Components

### Database Schema
The application uses a single primary table for trade data:

**Trades Table**:
- `id`: Serial primary key
- `symbol`: Stock/asset symbol
- `side`: Trade direction (LONG/SHORT)
- `quantity`: Number of shares/units
- `entryPrice`, `exitPrice`: Trade execution prices
- `entryDate`, `exitDate`: Trade timestamps
- `pnl`: Profit and loss calculation
- `commission`: Trading fees
- `instrumentType`: Asset type (stock, option, futures, forex, crypto)
- `strategy`: Trading strategy name
- `notes`: Trade notes
- `isOpen`: Boolean flag for open positions

### Core Features

1. **Trade Import System**
   - CSV file upload with drag-and-drop interface
   - Support for multiple broker formats
   - Data validation and error handling
   - Bulk trade creation

2. **Manual Trade Entry**
   - Form-based trade creation
   - Real-time validation with Zod schemas
   - Support for both open and closed positions

3. **Analytics Dashboard**
   - Key performance metrics (P&L, win rate, profit factor)
   - Performance charts using Recharts
   - Date range filtering

4. **Trade History**
   - Searchable and filterable trade table
   - Pagination for large datasets
   - Export functionality

## Data Flow

1. **Trade Data Input**: Users can import trades via CSV upload or manual entry forms
2. **Validation**: All trade data is validated using Zod schemas before database insertion
3. **Storage**: Validated trades are stored in PostgreSQL using Drizzle ORM
4. **Analytics**: Performance metrics are calculated on-demand from stored trade data
5. **Display**: React Query manages data fetching and caching for optimal UI performance

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database queries and migrations
- **Drizzle Kit**: Database migration management

### UI Libraries
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library for performance visualization
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Fast build tool and dev server
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Mode**: 
   - Vite dev server with HMR
   - Express server with development middleware
   - File watching and auto-restart

2. **Production Mode**:
   - Vite builds optimized client bundle
   - esbuild creates production server bundle
   - Static file serving from Express

3. **Database**:
   - Environment variable `DATABASE_URL` for Neon connection
   - Drizzle migrations stored in `/migrations` directory
   - Schema defined in `/shared/schema.ts`

The architecture prioritizes developer experience with hot reloading, type safety, and fast build times while maintaining production-ready performance and scalability.