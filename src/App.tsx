import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AddCoinPage from "./pages/AddCoinPage";
import CoinDetailPage from "./pages/CoinDetailPage";
import TrendsPage from "./pages/TrendsPage";
import CoinsPage from "./pages/CoinsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/add-coin" element={<ProtectedRoute><AddCoinPage /></ProtectedRoute>} />
      <Route path="/edit-coin/:id" element={<ProtectedRoute><AddCoinPage /></ProtectedRoute>} />
      <Route path="/coin/:id" element={<ProtectedRoute><CoinDetailPage /></ProtectedRoute>} />
      <Route path="/trends" element={<ProtectedRoute><TrendsPage /></ProtectedRoute>} />
      <Route path="/coins" element={<ProtectedRoute><CoinsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PortfolioProvider>
            <AppRoutes />
          </PortfolioProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
