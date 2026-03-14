import { Link, useLocation } from "react-router";
import { Home, BarChart3, TrendingDown, Target, TrendingUp, Settings, Repeat } from "lucide-react";

export default function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/transactions", icon: TrendingDown, label: "Transactions" },
    { to: "/subscriptions", icon: Repeat, label: "Subscriptions" },
    { to: "/investments", icon: TrendingUp, label: "Investments" },
    { to: "/budget-goals", icon: Target, label: "Budget & Goals" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-3 sticky top-[72px] z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="size-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}