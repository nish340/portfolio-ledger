import { useState } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { Search, ChevronDown } from "lucide-react";
import CoinCard from "@/components/CoinCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { coins, getTotalValue, getTotalProfitLoss, getTotalProfitLossPercent } = usePortfolio();
  const { username } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Overall");
  const navigate = useNavigate();

  const totalValue = getTotalValue();
  const totalPL = getTotalProfitLoss();
  const totalPLPct = getTotalProfitLossPercent();

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-dark pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-accent">
              {username.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Good Morning 👋</p>
              <p className="font-semibold text-foreground">{username}</p>
            </div>
          </div>
          <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-foreground">
            {filter} <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Portfolio Value */}
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Portfolio Value</p>
          <h2 className="mt-1 text-4xl font-extrabold text-foreground">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${totalPL >= 0 ? "text-success" : "text-danger"}`}>
              ${totalPL >= 0 ? "+" : ""}{Math.abs(totalPL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${totalPLPct >= 0 ? "bg-success text-success" : "bg-danger text-danger"}`}>
              {totalPLPct >= 0 ? "+" : ""}{totalPLPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />
        </div>

        {/* Asset List */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Your Assets</h3>
          <span className="text-xs font-medium text-accent">MARKET OPEN</span>
        </div>

        <div className="space-y-3">
          {filtered.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No assets found</p>
          )}
        </div>

        {/* Add Coin FAB */}
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2">
          <button
            onClick={() => navigate("/add-coin")}
            className="flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-foreground shadow-lg gradient-primary transition-transform hover:scale-105"
          >
            Add Coin →
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
