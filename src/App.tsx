import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import Dashboard from "./pages/Dashboard";
// import AdminPanel from "./pages/AdminPanel"; // You can remove this
import WalletPage from "./pages/Wallet";
import BetHistory from "./pages/BetHistory";
import NotFound from "./pages/NotFound";

// Import admin components
import { 
  AdminLayout, 
  AdminUsers, 
  AdminGames, 
  AdminEntries, 
  AdminHistory, 
  AdminResults 
} from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/history" element={<BetHistory />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminUsers />} /> {/* /admin */}
              <Route path="users" element={<AdminUsers />} /> {/* /admin/users */}
              <Route path="games" element={<AdminGames />} /> {/* /admin/games */}
              <Route path="entries" element={<AdminEntries />} /> {/* /admin/entries */}
              <Route path="history" element={<AdminHistory />} /> {/* /admin/history */}
              <Route path="results" element={<AdminResults />} /> {/* /admin/results */}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;