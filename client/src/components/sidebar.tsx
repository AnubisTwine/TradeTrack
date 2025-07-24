import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Upload, 
  History, 
  TrendingUp, 
  Play, 
  Plus, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: BarChart3 },
  { path: "/import", label: "Import Trades", icon: Upload },
  { path: "/history", label: "Trade History", icon: History },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/replay", label: "Trade Replay", icon: Play },
  { path: "/manual-entry", label: "Manual Entry", icon: Plus },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold text-white">TradeZilla</h1>
        <p className="text-text-muted text-sm">Trading Journal</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-info-blue/10 text-info-blue border border-info-blue/20"
                        : "text-text-muted hover:bg-dark-border hover:text-white"
                    )}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    {item.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-info-blue rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">John Trader</p>
            <p className="text-xs text-text-muted">Premium Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
