import { usePortfolio } from "@/context/PortfolioContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const TrendsPage = () => {
  const { coins, getTotalValue } = usePortfolio();
  const [selectedCoin, setSelectedCoin] = useState<string>("all");

  const getChartData = () => {
    if (selectedCoin === "all") {
      const dateMap: Record<string, number> = {};
      coins.forEach((coin) => {
        coin.entries.forEach((e) => {
          dateMap[e.date] = (dateMap[e.date] || 0) + e.value;
        });
      });
      return Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({ date, value }));
    }
    const coin = coins.find((c) => c.id === selectedCoin);
    return (coin?.entries || []).map((e) => ({ date: e.date, value: e.value, pl: e.profitLoss }));
  };

  const getPLChartData = () => {
    if (selectedCoin === "all") {
      const dateMap: Record<string, number> = {};
      coins.forEach((coin) => {
        coin.entries.forEach((e) => {
          dateMap[e.date] = (dateMap[e.date] || 0) + (e.value * e.profitLoss / 100);
        });
      });
      return Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pl]) => ({ date, pl: parseFloat(pl.toFixed(2)) }));
    }
    const coin = coins.find((c) => c.id === selectedCoin);
    return (coin?.entries || []).map((e) => ({ date: e.date, pl: e.profitLoss }));
  };

  const chartData = getChartData();
  const plData = getPLChartData();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Trends</h1>
        <p className="mb-6 text-sm text-muted-foreground">Profit & loss visualization</p>

        {/* Coin Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCoin("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              selectedCoin === "all" ? "gradient-primary text-foreground" : "bg-card text-muted-foreground border border-border"
            }`}
          >
            Overall
          </button>
          {coins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => setSelectedCoin(coin.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                selectedCoin === coin.id ? "gradient-primary text-foreground" : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {coin.symbol}
            </button>
          ))}
        </div>

        {/* Value Chart */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Portfolio Value</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 22%)", borderRadius: "8px", color: "#fff" }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(263 100% 75%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P/L Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Profit / Loss</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 22%)", borderRadius: "8px", color: "#fff" }}
                />
                <Line type="monotone" dataKey="pl" stroke="hsl(142 70% 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default TrendsPage;
