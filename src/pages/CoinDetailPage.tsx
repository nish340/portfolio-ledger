import { usePortfolio, type LedgerEntry } from "@/context/PortfolioContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { uploadApi } from "@/lib/api";
import { toast } from "sonner";

const CoinDetailPage = () => {
  const { coins, deleteCoin, addLedgerEntry, deleteLedgerEntry, getLedgerEntries } = usePortfolio();
  const { id } = useParams();
  const navigate = useNavigate();
  const coin = coins.find((c) => c._id === id);

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newPL, setNewPL] = useState("");
  const [newPLPct, setNewPLPct] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const handleNewValueChange = (val: string) => {
    setNewValue(val);
    const usd = parseFloat(val);
    const pl = parseFloat(newPL);
    const pct = parseFloat(newPLPct);
    if (isNaN(usd)) return;
    if (!isNaN(pl) && newPL !== "") {
      const costBasis = usd - pl;
      const newPct = costBasis !== 0 ? (pl / costBasis) * 100 : 0;
      setNewPLPct(newPct.toFixed(2));
    } else if (!isNaN(pct) && newPLPct !== "") {
      const costBasis = usd / (1 + pct / 100);
      setNewPL((usd - costBasis).toFixed(2));
    }
  };

  const handleNewPLChange = (val: string) => {
    setNewPL(val);
    const pl = parseFloat(val);
    const usd = parseFloat(newValue);
    if (!isNaN(pl) && !isNaN(usd) && usd !== pl) {
      const costBasis = usd - pl;
      const pct = costBasis !== 0 ? (pl / costBasis) * 100 : 0;
      setNewPLPct(pct.toFixed(2));
    } else {
      setNewPLPct("");
    }
  };

  const handleNewPLPctChange = (val: string) => {
    setNewPLPct(val);
    const pct = parseFloat(val);
    const usd = parseFloat(newValue);
    if (!isNaN(pct) && !isNaN(usd)) {
      const costBasis = usd / (1 + pct / 100);
      setNewPL((usd - costBasis).toFixed(2));
    } else {
      setNewPL("");
    }
  };
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getLedgerEntries(id);
      setEntries(data.slice().reverse());
    } catch {
      toast.error("Failed to load ledger");
    }
  }, [id, getLedgerEntries]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  useEffect(() => {
    if (coin?.imageKey) {
      uploadApi.getViewUrl(coin.imageKey).then((r) => setImageUrl(r.viewUrl)).catch(() => {});
    }
  }, [coin?.imageKey]);

  if (!coin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Coin not found</p>
      </div>
    );
  }

  const latest = entries[0];

  const handleAddEntry = async () => {
    if (!newValue) return;
    setLoading(true);
    try {
      await addLedgerEntry(coin._id, {
        usdValue: parseFloat(newValue),
        profitLoss: parseFloat(newPL) || 0,
        profitLossPct: parseFloat(newPLPct) || 0,
        date: new Date(newDate).toISOString(),
      });
      toast.success("Entry added");
      setShowAdd(false);
      setNewValue(""); setNewPL(""); setNewPLPct("");
      setNewDate(new Date().toISOString().split("T")[0]);
      loadEntries();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteLedgerEntry(coin._id, entryId);
      setEntries((prev) => prev.filter((e) => e._id !== entryId));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoin(coin._id);
      navigate("/");
    } catch {
      toast.error("Failed to delete coin");
      setDeleting(false);
      setShowDeleteModal(false);
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={coin.name} className="h-full w-full object-cover" />
            ) : (
              coin.ticker.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{coin.name}</h1>
            <span className="text-sm text-muted-foreground">{coin.ticker}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="mt-1 text-xl font-bold text-foreground">
              ${(latest?.usdValue ?? coin.usdValue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Profit / Loss</p>
            <p className={`mt-1 text-xl font-bold ${(latest?.profitLossPct ?? coin.profitLossPct) >= 0 ? "text-success" : "text-danger"}`}>
              {(latest?.profitLossPct ?? coin.profitLossPct) >= 0 ? "+" : ""}
              {(latest?.profitLossPct ?? coin.profitLossPct).toFixed(2)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Token Amount</p>
            <p className="mt-1 text-xl font-bold text-foreground">{coin.tokenAmount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">P/L ($)</p>
            <p className={`mt-1 text-xl font-bold ${(latest?.profitLoss ?? coin.profitLoss) >= 0 ? "text-success" : "text-danger"}`}>
              {(latest?.profitLoss ?? coin.profitLoss) >= 0 ? "+" : ""}
              ${Math.abs(latest?.profitLoss ?? coin.profitLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
            <input type="number" step="0.01" placeholder="Value (USD) *" value={newValue}
              onChange={(e) => handleNewValueChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.01" placeholder="P/L ($)" value={newPL}
                onChange={(e) => handleNewPLChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
              <input type="number" step="0.01" placeholder="P/L (%)" value={newPLPct}
                onChange={(e) => handleNewPLPctChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <p className="text-xs text-muted-foreground">Enter either P/L $ or P/L % — the other is calculated automatically.</p>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none" />
            <button onClick={handleAddEntry} disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-foreground gradient-primary disabled:opacity-60">
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No entries yet</p>
          )}
          {entries.map((entry) => (
            <div key={entry._id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  ${entry.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 text-sm font-medium ${entry.profitLossPct >= 0 ? "text-success" : "text-danger"}`}>
                  {entry.profitLossPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {entry.profitLossPct >= 0 ? "+" : ""}{entry.profitLossPct.toFixed(2)}%
                </span>
                <button onClick={() => handleDeleteEntry(entry._id)} className="text-muted-foreground hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={() => navigate(`/edit-coin/${coin._id}`)}
            className="w-full rounded-xl py-3 font-semibold text-foreground gradient-primary">
            Edit Coin
          </button>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-full rounded-xl border border-destructive/30 py-3 font-semibold text-danger transition-colors hover:bg-destructive/10">
            Delete Coin
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-fade-in">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <h3 className="text-center text-lg font-bold text-foreground mb-1">Delete Coin</h3>
            <p className="text-center text-sm text-muted-foreground mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-center text-sm font-semibold text-foreground mb-5">
              {coin.name} ({coin.ticker})?
            </p>
            <p className="text-center text-xs text-muted-foreground mb-6">
              This will permanently remove the coin and all its ledger history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-destructive/80 py-3 text-sm font-semibold text-white transition-colors hover:bg-destructive disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinDetailPage;
