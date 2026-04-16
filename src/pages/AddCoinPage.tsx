import { useState, useRef, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, TrendingUp } from "lucide-react";
import { uploadApi } from "@/lib/api";
import { toast } from "sonner";

const AddCoinPage = () => {
  const { coins, addCoin, updateCoin } = usePortfolio();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = id ? coins.find((c) => c._id === id) : null;

  const [name, setName] = useState(editing?.name || "");
  const [ticker, setTicker] = useState(editing?.ticker || "");
  const [tokenAmount, setTokenAmount] = useState(editing?.tokenAmount?.toString() || "");
  const [usdValue, setUsdValue] = useState(editing?.usdValue?.toString() || "");
  const [profitLoss, setProfitLoss] = useState(editing?.profitLoss?.toString() || "");
  const [profitLossPct, setProfitLossPct] = useState(editing?.profitLossPct?.toString() || "");

  const handleUsdValueChange = (val: string) => {
    setUsdValue(val);
    // Re-derive whichever P/L field was already filled
    const usd = parseFloat(val);
    if (isNaN(usd)) return;
    const pl = parseFloat(profitLoss);
    const pct = parseFloat(profitLossPct);
    if (!isNaN(pl) && profitLoss !== "") {
      const costBasis = usd - pl;
      const newPct = costBasis !== 0 ? (pl / costBasis) * 100 : 0;
      setProfitLossPct(newPct.toFixed(2));
    } else if (!isNaN(pct) && profitLossPct !== "") {
      const costBasis = usd / (1 + pct / 100);
      setProfitLoss((usd - costBasis).toFixed(2));
    }
  };
  const handleProfitLossChange = (val: string) => {
    setProfitLoss(val);
    const pl = parseFloat(val);
    const usd = parseFloat(usdValue);
    if (!isNaN(pl) && !isNaN(usd) && usd !== pl) {
      const costBasis = usd - pl;
      const pct = costBasis !== 0 ? (pl / costBasis) * 100 : 0;
      setProfitLossPct(pct.toFixed(2));
    } else {
      setProfitLossPct("");
    }
  };

  // When P/L % changes → auto-calc P/L $
  const handleProfitLossPctChange = (val: string) => {
    setProfitLossPct(val);
    const pct = parseFloat(val);
    const usd = parseFloat(usdValue);
    if (!isNaN(pct) && !isNaN(usd)) {
      // currentValue = costBasis * (1 + pct/100)  →  costBasis = usd / (1 + pct/100)
      const costBasis = usd / (1 + pct / 100);
      const pl = usd - costBasis;
      setProfitLoss(pl.toFixed(2));
    } else {
      setProfitLoss("");
    }
  };
  const [entryDate, setEntryDate] = useState(
    editing?.entryDate ? editing.entryDate.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing?.imageKey) {
      uploadApi.getViewUrl(editing.imageKey).then((r) => setImagePreview(r.viewUrl)).catch(() => {});
    }
  }, [editing]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !ticker || !usdValue || !tokenAmount) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      let imageKey = editing?.imageKey || null;
      if (imageFile) {
        const { uploadUrl, key } = await uploadApi.presign(imageFile.name, imageFile.type);
        await uploadApi.uploadToS3(uploadUrl, imageFile);
        imageKey = key;
      }

      const body = {
        name,
        ticker: ticker.toUpperCase(),
        tokenAmount: parseFloat(tokenAmount),
        usdValue: parseFloat(usdValue),
        profitLoss: parseFloat(profitLoss) || 0,
        profitLossPct: parseFloat(profitLossPct) || 0,
        entryDate: new Date(entryDate).toISOString(),
        imageKey,
      };

      if (editing) {
        await updateCoin(editing._id, body);
        toast.success("Coin updated");
      } else {
        await addCoin(body);
        toast.success("Coin added");
      }
      navigate(-1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-8">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <h1 className="mb-1 text-2xl font-bold text-foreground">{editing ? "Edit Coin" : "Add Coin"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">Configure your position metrics with precision.</p>

        {/* Image Upload */}
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset Icon</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-8 text-muted-foreground transition-colors hover:border-accent"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-accent/50" />
              <span className="text-xs">Tap to upload asset logo</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bitcoin"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticker *</label>
            <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g. BTC"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Token Amount *</label>
            <input type="number" step="any" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="e.g. 0.5"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Value (USD) *</label>
            <div className="relative">
              <input type="number" step="0.01" value={usdValue} onChange={(e) => handleUsdValueChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-8 text-foreground focus:border-accent focus:outline-none" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">P/L ($)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={profitLoss}
                  onChange={(e) => handleProfitLossChange(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-8 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                />
                <TrendingUp className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">P/L (%)</label>
              <input
                type="number"
                step="0.01"
                value={profitLossPct}
                onChange={(e) => handleProfitLossPctChange(e.target.value)}
                placeholder="e.g. 12.5"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">Enter either P/L $ or P/L % — the other is calculated automatically.</p>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Entry Date</label>
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none" />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={handleSave} disabled={saving}
            className="w-full rounded-xl py-3.5 font-semibold text-foreground gradient-primary transition-opacity hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving..." : "Save Position"}
          </button>
          <button onClick={() => navigate(-1)}
            className="w-full rounded-xl border border-border py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary">
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCoinPage;
