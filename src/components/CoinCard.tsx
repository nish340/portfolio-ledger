import { type Coin } from "@/context/PortfolioContext";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const coinColors: Record<string, string> = {
  BTC: "bg-amber-500/20 text-amber-400",
  ETH: "bg-blue-500/20 text-blue-400",
  SOL: "bg-green-500/20 text-green-400",
  ADA: "bg-sky-500/20 text-sky-400",
};

const CoinCard = ({ coin }: { coin: Coin }) => {
  const navigate = useNavigate();
  const latest = coin.entries[coin.entries.length - 1];
  const value = latest?.value || 0;
  const pl = latest?.profitLoss || 0;
  const date = latest?.date || coin.createdAt;
  const colorClass = coinColors[coin.symbol] || "bg-accent/20 text-accent";

  return (
    <button
      onClick={() => navigate(`/coin/${coin.id}`)}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/30 animate-fade-in"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorClass}`}>
        {coin.image ? (
          <img src={coin.image} alt={coin.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          coin.symbol.charAt(0)
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{coin.name}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {coin.symbol}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <div className="text-right">
        <div className="font-semibold text-foreground">
          ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center justify-end gap-1 text-xs ${pl > 0 ? "text-success" : pl < 0 ? "text-danger" : "text-muted-foreground"}`}>
          {pl > 0 ? <TrendingUp className="h-3 w-3" /> : pl < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {pl > 0 ? "+" : ""}{pl}%
        </div>
      </div>
    </button>
  );
};

export default CoinCard;
