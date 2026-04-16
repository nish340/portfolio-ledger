import { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import { searchIcon, coinActiveIcon } from "@/assets/images/index";
import CoinCard from "@/components/CoinCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const Dashboard = () => {
  const { coins, summary, loading, fetchCoins } = usePortfolio();
  const { email } = useAuth();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => fetchCoins(search ? { search } : undefined), 300);
    return () => clearTimeout(t);
  }, [search, fetchCoins]);

  const totalValue = summary?.totalValue ?? 0;
  const totalPL = summary?.totalProfitLoss ?? 0;
  const totalPLPct = summary?.totalProfitLossPct ?? 0;
  const isProfit = totalPL >= 0;
  const username = email ? email.split("@")[0] : "User";

  return (
    <div className="min-h-screen gradient-dark pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm font-bold text-accent shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{getGreeting()} 👋</p>
              <p className="text-[15px] font-bold text-foreground capitalize">{username}</p>
            </div>
          </div>
        </div>

        {/* ── Portfolio Hero Card ── */}
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          {/* Dynamic tinted background */}
          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background: isProfit
                ? "linear-gradient(145deg, hsl(142 60% 8%) 0%, hsl(0 0% 14%) 60%)"
                : "linear-gradient(145deg, hsl(0 60% 10%) 0%, hsl(0 0% 14%) 60%)",
            }}
          />
          {/* Glowing top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px transition-colors duration-700"
            style={{ background: isProfit ? "hsl(142 70% 45% / 0.5)" : "hsl(0 80% 55% / 0.5)" }}
          />
          {/* Soft radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isProfit
                ? "radial-gradient(ellipse 70% 55% at 50% 0%, hsl(142 70% 45% / 0.10) 0%, transparent 70%)"
                : "radial-gradient(ellipse 70% 55% at 50% 0%, hsl(0 80% 55% / 0.10) 0%, transparent 70%)",
            }}
          />

          <div className="relative px-6 py-7 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Portfolio Value
            </p>

            <h2 className="text-[2.4rem] font-extrabold text-foreground leading-none tracking-tight">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>

            <div className="mt-3 flex items-center justify-center gap-2.5">
              <span className={`flex items-center gap-1 text-sm font-semibold ${
                isProfit ? "text-success" : "text-danger"
              }`}>
                {isProfit
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
                {isProfit ? "+" : "-"}${Math.abs(totalPL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${
                isProfit
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-danger/10 text-danger border-danger/20"
              }`}>
                {isProfit ? "+" : ""}{totalPLPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <img src={searchIcon} alt="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain" />
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
          <span className="text-xs font-medium text-accent">{summary?.coinCount ?? 0} COINS</span>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-3">
            {coins.map((coin) => <CoinCard key={coin._id} coin={coin} />)}
            {coins.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No assets found</p>
            )}
          </div>
        )}

        {/* Add Coin FAB */}
        <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2">
          <button
            onClick={() => navigate("/add-coin")}
            className="flex items-center rounded-full shadow-lg gradient-primary transition-transform hover:scale-105 overflow-hidden"
          >
            {/* Left icon circle */}
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/15 ml-1">
              <img src={coinActiveIcon} alt="" className="h-5 w-5 object-contain" />
            </div>
            {/* Label */}
            <span className="px-4 text-sm font-semibold text-white tracking-wide">Add Coin</span>
            {/* Right arrow circle */}
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/15 mr-1 text-white font-bold text-base">
              ›
            </div>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
