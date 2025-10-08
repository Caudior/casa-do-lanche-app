import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import AdminDashboard from "./pages/AdminDashboard"; // Importar nova página
import MenuManagement from "./pages/MenuManagement"; // Importar nova página
import OrderManagement from "./pages/OrderManagement"; // Importar nova página
import Reports from "./pages/Reports"; // Importar nova página
import NotFound from "./pages/NotFound";
import SessionProvider from "./components/SessionProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/admin" element={<AdminDashboard />} /> {/* Nova rota para o painel admin */}
            <Route path="/admin/menu-management" element={<MenuManagement />} /> {/* Nova rota para gerenciamento de cardápio */}
            <Route path="/admin/order-management" element={<OrderManagement />} /> {/* Nova rota para gerenciamento de pedidos */}
            <Route path="/admin/reports" element={<Reports />} /> {/* Nova rota para relatórios */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;