import { usePortfolio } from "@/context/PortfolioContext";
import { useState } from "react";
import { Search } from "lucide-react";
import CoinCard from "@/components/CoinCard";
import BottomNav from "@/components/BottomNav";

const CoinsPage = () => {
  const { coins } = usePortfolio();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = coins.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase());

    const latest = c.entries[c.entries.length - 1];
    const entryDate = latest?.date || c.createdAt;
    const matchesFrom = dateFrom ? entryDate >= dateFrom : true;
    const matchesTo = dateTo ? entryDate <= dateTo : true;

    return matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">All Coins</h1>
        <p className="mb-6 text-sm text-muted-foreground">Search and filter your assets</p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          />
        </div>

        {/* Date Filters */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</p>

        <div className="space-y-3">
          {filtered.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No coins match your filters</p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default CoinsPage;
