import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { portfolioApi, type TrendPoint } from "@/lib/api";

const RANGES = ["1W", "1M", "3M", "ALL"] as const;
type Range = typeof RANGES[number];

const TrendsPage = () => {
  const [range, setRange] = useState<Range>("1M");
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    portfolioApi.trend(range)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Trends</h1>
        <p className="mb-6 text-sm text-muted-foreground">Portfolio performance over time</p>

        {/* Range Selector */}
        <div className="mb-6 flex gap-2">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${
                range === r ? "gradient-primary text-foreground" : "bg-card text-muted-foreground border border-border"
              }`}>
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No trend data yet. Add ledger entries to see trends.</p>
        ) : (
          <>
            {/* Value Chart */}
            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Portfolio Value (USD)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 22%)", borderRadius: "8px", color: "#fff" }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                    />
                    <Line type="monotone" dataKey="totalValue" stroke="hsl(263 100% 75%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* P/L Chart */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Profit / Loss (USD)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 22%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 22%)", borderRadius: "8px", color: "#fff" }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "P/L"]}
                    />
                    <Line type="monotone" dataKey="totalProfitLoss" stroke="hsl(142 70% 45%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default TrendsPage;
