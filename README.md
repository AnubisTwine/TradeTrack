# TradeZilla - Trading Journal Application

A comprehensive trading journal application designed to help traders track, analyze, and improve their trading performance.

## Features

- **CSV Trade Import**: Upload and import trades from various broker formats
- **Manual Trade Entry**: Add trades through an intuitive form interface
- **Performance Analytics**: View key metrics including P&L, win rate, and profit factor
- **Interactive Charts**: Visualize trading performance with responsive charts
- **Trade History**: Browse, search, and filter your complete trading history
- **Dark Mode**: Modern dark theme for comfortable viewing

## Tech Stack

### Frontend
- **React** with TypeScript for type safety
- **Tailwind CSS** with custom dark theme
- **Radix UI** components for accessibility
- **Wouter** for lightweight routing
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Recharts** for performance visualization

### Backend
- **Express.js** with TypeScript (ESM)
- **PostgreSQL** with Drizzle ORM
- **Multer** for CSV file handling
- **csv-parse** for data processing

### Build Tools
- **Vite** for fast development and optimized builds
- **esbuild** for server-side bundling
- **TypeScript** for static type checking

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/TradeZilla.git
cd TradeZilla
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy and configure your database URL
DATABASE_URL=your_postgresql_connection_string
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Run TypeScript type checking

## Database Schema

The application uses a single `trades` table with the following structure:

- `id` - Primary key
- `symbol` - Stock/asset symbol
- `side` - Trade direction (LONG/SHORT)
- `quantity` - Number of shares/units
- `entryPrice` / `exitPrice` - Trade execution prices
- `entryDate` / `exitDate` - Trade timestamps
- `pnl` - Profit and loss calculation
- `commission` - Trading fees
- `instrumentType` - Asset type (stock, option, futures, forex, crypto)
- `strategy` - Trading strategy name
- `notes` - Trade notes
- `isOpen` - Open position flag

## CSV Import Format

The application accepts CSV files with the following columns:

```csv
symbol,side,quantity,entryPrice,exitPrice,entryDate,exitDate,commission,instrumentType,strategy,notes
AAPL,LONG,100,150.00,155.00,2024-01-15,2024-01-16,2.50,stock,momentum,Great breakout
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

This application is optimized for deployment on Replit and other modern hosting platforms. The build process creates optimized bundles for both frontend and backend components.