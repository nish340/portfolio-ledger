import React, { createContext, useContext, useState, useCallback } from "react";

export interface CoinEntry {
  id: string;
  date: string;
  value: number;
  profitLoss: number;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  entries: CoinEntry[];
  createdAt: string;
}

interface PortfolioContextType {
  coins: Coin[];
  addCoin: (coin: Omit<Coin, "id" | "createdAt">) => void;
  updateCoin: (id: string, coin: Partial<Coin>) => void;
  deleteCoin: (id: string) => void;
  addEntry: (coinId: string, entry: Omit<CoinEntry, "id">) => void;
  deleteEntry: (coinId: string, entryId: string) => void;
  getTotalValue: () => number;
  getTotalProfitLoss: () => number;
  getTotalProfitLossPercent: () => number;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

const STORAGE_KEY = "portfolio_coins";

const loadCoins = (): Coin[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleData();
  } catch {
    return getSampleData();
  }
};

const saveCoins = (coins: Coin[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coins));
};

function getSampleData(): Coin[] {
  return [
    {
      id: "1",
      name: "Bitcoin",
      symbol: "BTC",
      image: null,
      createdAt: "2023-11-12",
      entries: [
        { id: "e1", date: "2023-11-12", value: 64210.0, profitLoss: 5.2 },
      ],
    },
    {
      id: "2",
      name: "Ethereum",
      symbol: "ETH",
      image: null,
      createdAt: "2023-11-11",
      entries: [
        { id: "e2", date: "2023-11-11", value: 3450.12, profitLoss: -1.4 },
      ],
    },
    {
      id: "3",
      name: "Solana",
      symbol: "SOL",
      image: null,
      createdAt: "2023-11-10",
      entries: [
        { id: "e3", date: "2023-11-10", value: 145.82, profitLoss: 12.8 },
      ],
    },
    {
      id: "4",
      name: "Cardano",
      symbol: "ADA",
      image: null,
      createdAt: "2023-11-08",
      entries: [
        { id: "e4", date: "2023-11-08", value: 0.58, profitLoss: 0.0 },
      ],
    },
  ];
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState<Coin[]>(loadCoins);

  const persist = useCallback((updated: Coin[]) => {
    setCoins(updated);
    saveCoins(updated);
  }, []);

  const addCoin = useCallback((coin: { name: string; symbol: string; image: string | null; entries: Omit<CoinEntry, "id">[] }) => {
    const newCoin: Coin = {
      ...coin,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
      entries: coin.entries.map((e) => ({ ...e, id: crypto.randomUUID() })),
    };
    setCoins((prev) => {
      const updated = [...prev, newCoin];
      saveCoins(updated);
      return updated;
    });
  }, []);

  const updateCoin = useCallback((id: string, updates: Partial<Coin>) => {
    setCoins((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveCoins(updated);
      return updated;
    });
  }, []);

  const deleteCoin = useCallback((id: string) => {
    setCoins((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCoins(updated);
      return updated;
    });
  }, []);

  const addEntry = useCallback((coinId: string, entry: Omit<CoinEntry, "id">) => {
    setCoins((prev) => {
      const updated = prev.map((c) =>
        c.id === coinId
          ? { ...c, entries: [...c.entries, { ...entry, id: crypto.randomUUID() }] }
          : c
      );
      saveCoins(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((coinId: string, entryId: string) => {
    setCoins((prev) => {
      const updated = prev.map((c) =>
        c.id === coinId
          ? { ...c, entries: c.entries.filter((e) => e.id !== entryId) }
          : c
      );
      saveCoins(updated);
      return updated;
    });
  }, []);

  const getTotalValue = useCallback(() => {
    return coins.reduce((sum, coin) => {
      const latest = coin.entries[coin.entries.length - 1];
      return sum + (latest?.value || 0);
    }, 0);
  }, [coins]);

  const getTotalProfitLoss = useCallback(() => {
    return coins.reduce((sum, coin) => {
      const latest = coin.entries[coin.entries.length - 1];
      return sum + (latest ? (latest.value * latest.profitLoss) / 100 : 0);
    }, 0);
  }, [coins]);

  const getTotalProfitLossPercent = useCallback(() => {
    const total = getTotalValue();
    if (total === 0) return 0;
    return (getTotalProfitLoss() / total) * 100;
  }, [coins, getTotalValue, getTotalProfitLoss]);

  return (
    <PortfolioContext.Provider
      value={{ coins, addCoin, updateCoin, deleteCoin, addEntry, deleteEntry, getTotalValue, getTotalProfitLoss, getTotalProfitLossPercent }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be inside PortfolioProvider");
  return ctx;
};
