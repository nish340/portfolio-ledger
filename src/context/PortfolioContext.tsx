import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { coinsApi, ledgerApi, portfolioApi, type CoinData, type LedgerEntry, type PortfolioSummary } from "@/lib/api";
import { useAuth } from "./AuthContext";

export type { CoinData, LedgerEntry };

interface PortfolioContextType {
  coins: CoinData[];
  summary: PortfolioSummary | null;
  loading: boolean;
  fetchCoins: (params?: { search?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchSummary: () => Promise<void>;
  addCoin: (body: Partial<CoinData>) => Promise<CoinData>;
  updateCoin: (id: string, body: Partial<CoinData>) => Promise<CoinData>;
  deleteCoin: (id: string) => Promise<void>;
  addLedgerEntry: (coinId: string, body: Partial<LedgerEntry>) => Promise<LedgerEntry>;
  updateLedgerEntry: (coinId: string, entryId: string, body: Partial<LedgerEntry>) => Promise<LedgerEntry>;
  deleteLedgerEntry: (coinId: string, entryId: string) => Promise<void>;
  getLedgerEntries: (coinId: string) => Promise<LedgerEntry[]>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCoins = useCallback(async (params?: { search?: string; startDate?: string; endDate?: string }) => {
    setLoading(true);
    try {
      const data = await coinsApi.list(params);
      setCoins(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    const data = await portfolioApi.summary();
    setSummary(data);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCoins();
      fetchSummary();
    } else {
      setCoins([]);
      setSummary(null);
    }
  }, [isAuthenticated, fetchCoins, fetchSummary]);

  const addCoin = useCallback(async (body: Partial<CoinData>) => {
    const coin = await coinsApi.create(body);
    setCoins((prev) => [coin, ...prev]);
    fetchSummary();
    return coin;
  }, [fetchSummary]);

  const updateCoin = useCallback(async (id: string, body: Partial<CoinData>) => {
    const coin = await coinsApi.update(id, body);
    setCoins((prev) => prev.map((c) => (c._id === id ? coin : c)));
    fetchSummary();
    return coin;
  }, [fetchSummary]);

  const deleteCoin = useCallback(async (id: string) => {
    await coinsApi.delete(id);
    setCoins((prev) => prev.filter((c) => c._id !== id));
    fetchSummary();
  }, [fetchSummary]);

  const addLedgerEntry = useCallback(async (coinId: string, body: Partial<LedgerEntry>) => {
    const entry = await ledgerApi.add(coinId, body);
    fetchSummary();
    return entry;
  }, [fetchSummary]);

  const updateLedgerEntry = useCallback(async (coinId: string, entryId: string, body: Partial<LedgerEntry>) => {
    return ledgerApi.update(coinId, entryId, body);
  }, []);

  const deleteLedgerEntry = useCallback(async (coinId: string, entryId: string) => {
    await ledgerApi.delete(coinId, entryId);
    fetchSummary();
  }, [fetchSummary]);

  const getLedgerEntries = useCallback((coinId: string) => ledgerApi.list(coinId), []);

  return (
    <PortfolioContext.Provider value={{
      coins, summary, loading,
      fetchCoins, fetchSummary,
      addCoin, updateCoin, deleteCoin,
      addLedgerEntry, updateLedgerEntry, deleteLedgerEntry, getLedgerEntries,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be inside PortfolioProvider");
  return ctx;
};
