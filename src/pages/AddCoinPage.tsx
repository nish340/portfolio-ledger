import { useState, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, TrendingUp } from "lucide-react";

const AddCoinPage = () => {
  const { coins, addCoin, updateCoin } = usePortfolio();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = id ? coins.find((c) => c.id === id) : null;

  const [name, setName] = useState(editing?.name || "");
  const [symbol, setSymbol] = useState(editing?.symbol || "");
  const [value, setValue] = useState(editing?.entries[editing.entries.length - 1]?.value?.toString() || "0.00");
  const [profitLoss, setProfitLoss] = useState(editing?.entries[editing.entries.length - 1]?.profitLoss?.toString() || "0.00");
  const [date, setDate] = useState(editing?.entries[editing.entries.length - 1]?.date || "");
  const [image, setImage] = useState<string | null>(editing?.image || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !symbol) return;
    if (editing) {
      updateCoin(editing.id, { name, symbol, image });
    } else {
      addCoin({
        name,
        symbol: symbol.toUpperCase(),
        image,
        entries: [
          {
            date: date || new Date().toISOString().split("T")[0],
            value: parseFloat(value) || 0,
            profitLoss: parseFloat(profitLoss) || 0,
          },
        ],
      });
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-8">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <h1 className="mb-1 text-2xl font-bold text-foreground">Asset Detail</h1>
        <p className="mb-6 text-sm text-muted-foreground">Configure your position metrics with precision.</p>

        {/* Image Upload */}
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset Icon</label>
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-8 text-muted-foreground transition-colors hover:border-accent"
        >
          {image ? (
            <img src={image} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-accent/50" />
              <span className="text-xs">Tap to upload or replace asset logo</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Asset Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ethereum"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. ETH"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Value (USD)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-8 text-foreground focus:border-accent focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Profit / Loss %</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={profitLoss}
                onChange={(e) => setProfitLoss(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-8 text-foreground focus:border-accent focus:outline-none"
              />
              <TrendingUp className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Entry Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            className="w-full rounded-xl py-3.5 font-semibold text-foreground gradient-primary transition-opacity hover:opacity-90"
          >
            Save Position
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-xl border border-border py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCoinPage;
