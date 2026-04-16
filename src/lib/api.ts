const BASE = '/api';

function getToken() {
  return localStorage.getItem('jwt_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Coins
export interface CoinData {
  _id: string;
  name: string;
  ticker: string;
  tokenAmount: number;
  usdValue: number;
  profitLoss: number;
  profitLossPct: number;
  entryDate: string;
  imageKey: string | null;
  latestLedgerEntry?: LedgerEntry | null;
  createdAt: string;
}

export interface LedgerEntry {
  _id: string;
  coinId: string;
  usdValue: number;
  profitLoss: number;
  profitLossPct: number;
  date: string;
}

export const coinsApi = {
  list: (params?: { search?: string; startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    const qs = q.toString();
    return request<CoinData[]>(`/coins${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => request<CoinData>(`/coins/${id}`),
  create: (body: Partial<CoinData>) =>
    request<CoinData>('/coins', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<CoinData>) =>
    request<CoinData>(`/coins/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ message: string }>(`/coins/${id}`, { method: 'DELETE' }),
};

export const ledgerApi = {
  list: (coinId: string, params?: { startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    const qs = q.toString();
    return request<LedgerEntry[]>(`/coins/${coinId}/ledger${qs ? '?' + qs : ''}`);
  },
  add: (coinId: string, body: Partial<LedgerEntry>) =>
    request<LedgerEntry>(`/coins/${coinId}/ledger`, { method: 'POST', body: JSON.stringify(body) }),
  update: (coinId: string, entryId: string, body: Partial<LedgerEntry>) =>
    request<LedgerEntry>(`/coins/${coinId}/ledger/${entryId}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (coinId: string, entryId: string) =>
    request<{ message: string }>(`/coins/${coinId}/ledger/${entryId}`, { method: 'DELETE' }),
};

export interface PortfolioSummary {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  coinCount: number;
}

export interface TrendPoint {
  date: string;
  totalValue: number;
  totalProfitLoss: number;
}

export const portfolioApi = {
  summary: () => request<PortfolioSummary>('/portfolio/summary'),
  trend: (range: '1W' | '1M' | '3M' | 'ALL') =>
    request<TrendPoint[]>(`/portfolio/trend?range=${range}`),
};

export const uploadApi = {
  presign: (filename: string, contentType: string) =>
    request<{ uploadUrl: string; key: string }>('/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    }),
  uploadToS3: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error('S3 upload failed');
  },
  getViewUrl: (key: string) =>
    request<{ viewUrl: string }>(`/upload/view/${key}`),
};
