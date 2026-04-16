import { usePortfolio } from "@/context/PortfolioContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const CoinDetailPage = () => {
  const { coins, addEntry, deleteEntry, deleteCoin } = usePortfolio();
  const { id } = useParams();
  const navigate = useNavigate();
  const coin = coins.find((c) => c.id === id);

  const [showAdd, setShowAdd] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newPL, setNewPL] = useState("");
  const [newDate, setNewDate] = useState("");

  if (!coin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Coin not found</p>
      </div>
    );
  }

  const latest = coin.entries[coin.entries.length - 1];

  const handleAddEntry = () => {
    if (!newValue) return;
    addEntry(coin.id, {
      date: newDate || new Date().toISOString().split("T")[0],
      value: parseFloat(newValue),
      profitLoss: parseFloat(newPL) || 0,
    });
    setShowAdd(false);
    setNewValue("");
    setNewPL("");
    setNewDate("");
  };

  const handleDelete = () => {
    if (confirm("Delete this coin?")) {
      deleteCoin(coin.id);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-8">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        {/* Coin Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
            {coin.image ? (
              <img src={coin.image} alt={coin.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              coin.symbol.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{coin.name}</h1>
            <span className="text-sm text-muted-foreground">{coin.symbol}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              ${latest?.value.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Profit / Loss</p>
            <p className={`mt-1 text-xl font-bold ${(latest?.profitLoss || 0) >= 0 ? "text-success" : "text-danger"}`}>
              {(latest?.profitLoss || 0) >= 0 ? "+" : ""}{latest?.profitLoss || 0}%
            </p>
          </div>
        </div>

        {/* Ledger */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Ledger History</h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 rounded-lg bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent"
          >
            <Plus className="h-3 w-3" /> Add Entry
          </button>
        </div>

        {showAdd && (
          <div className="mb-4 space-y-3 rounded-xl border border-accent/30 bg-card p-4 animate-fade-in">
            <input
              type="number"
              step="0.01"
              placeholder="Value (USD)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              placeholder="P/L %"
              value={newPL}
              onChange={(e) => setNewPL(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <button
              onClick={handleAddEntry}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-primary"
            >
              Save Entry
            </button>
          </div>
        )}

        <div className="space-y-2">
          {coin.entries.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No entries yet</p>
          )}
          {[...coin.entries].reverse().map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  ${entry.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{entry.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 text-sm font-medium ${entry.profitLoss >= 0 ? "text-success" : "text-danger"}`}>
                  {entry.profitLoss >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {entry.profitLoss >= 0 ? "+" : ""}{entry.profitLoss}%
                </span>
                <button
                  onClick={() => deleteEntry(coin.id, entry.id)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit / Delete */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate(`/edit-coin/${coin.id}`)}
            className="w-full rounded-xl py-3 font-semibold text-foreground gradient-primary"
          >
            Edit Coin
          </button>
          <button
            onClick={handleDelete}
            className="w-full rounded-xl border border-destructive/30 py-3 font-semibold text-danger transition-colors hover:bg-destructive/10"
          >
            Delete Coin
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage;
