import { usePortfolio } from "@/context/PortfolioContext";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { searchIcon } from "@/assets/images/index";
import CoinCard from "@/components/CoinCard";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const CoinsPage = () => {
  const { coins, loading, fetchCoins } = usePortfolio();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      fetchCoins({
        search: search || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, dateFrom, dateTo, fetchCoins]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">All Coins</h1>
          <button
            onClick={() => navigate("/add-coin")}
            className="flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Coin
          </button>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">Search and filter your assets</p>

        <div className="relative mb-4">
          <img src={searchIcon} alt="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain" />
          <input type="text" placeholder="Search coins..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
        </div>

        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none" />
          </div>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{coins.length} asset{coins.length !== 1 ? "s" : ""}</p>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-3">
            {coins.map((coin) => <CoinCard key={coin._id} coin={coin} />)}
            {coins.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No coins match your filters</p>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default CoinsPage;
