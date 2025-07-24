import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CsvImport from "@/components/csv-import";
import { FileText, TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Support for CSV files from 100+ brokers including Interactive Brokers, TradeStation, and more."
  },
  {
    icon: TrendingUp,
    title: "Auto Calculations",
    description: "Automatically calculate P&L, win rates, and other key metrics from your imported data."
  },
  {
    icon: Shield,
    title: "Data Validation",
    description: "Built-in validation ensures your trade data is accurate and complete."
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get immediate insights and analytics as soon as your data is imported."
  }
];

export default function ImportTrades() {
  return (
    <>
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold">Import Trades</h2>
          <p className="text-text-muted text-sm">Upload your trading data from CSV files</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Import Form */}
            <div className="lg:col-span-2">
              <CsvImport />
              
              {/* Sample CSV Format */}
              <Card className="mt-6 bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg">Sample CSV Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-dark-bg rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-text-muted">
{`Symbol,Side,Quantity,EntryPrice,ExitPrice,EntryDate,Commission
AAPL,LONG,100,175.42,178.91,2024-12-15 09:30:00,2.50
TSLA,SHORT,50,248.76,245.32,2024-12-14 10:15:00,1.50
SPY,LONG,5,2.45,1.89,2024-12-13 11:00:00,5.00`}
                    </pre>
                  </div>
                  <p className="text-sm text-text-muted mt-3">
                    Download our{" "}
                    <a href="#" className="text-info-blue hover:underline">
                      sample CSV template
                    </a>{" "}
                    to get started.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features Sidebar */}
            <div className="space-y-6">
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg">Why Import?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-info-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-info-blue" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                          <p className="text-xs text-text-muted">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Supported Brokers */}
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg">Supported Brokers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "Interactive Brokers",
                      "TradeStation", 
                      "TastyTrade",
                      "Robinhood",
                      "E*TRADE",
                      "TD Ameritrade",
                      "Schwab",
                      "Fidelity",
                      "Generic CSV",
                      "And 90+ more..."
                    ].map((broker, index) => (
                      <div key={index} className="flex items-center text-sm text-text-muted">
                        <div className="w-2 h-2 bg-profit-green rounded-full mr-3"></div>
                        {broker}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
