import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import PWAInstall from "@/components/PWAInstall";
import OfflineIndicator from "@/components/OfflineIndicator";
import Offline from "@/pages/Offline";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import BetHistory from "./pages/BetHistory";
import NotFound from "./pages/NotFound";
import StarMatkaDashboard from "./pages/StarMatkaDashboard.tsx"; // Import the new dashboard
import { 
  AdminLayout, 
  AdminUsers, 
  AdminGames, 
  AdminEntries, 
  AdminHistory, 
  AdminResults,
  AdminNotice,
    // AdminGameRates

} from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PWAInstall />
          <OfflineIndicator />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/offline" element={<Offline />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/history" element={<BetHistory />} />
            
            {/* Star Matka Secret Dashboard */}
            <Route path="/star-matka" element={<StarMatkaDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminUsers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="entries" element={<AdminEntries />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="notice" element={<AdminNotice />} />
                            {/* <Route path="gamerates" element={<AdminGameRates  />} /> */}

            </Route>
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;