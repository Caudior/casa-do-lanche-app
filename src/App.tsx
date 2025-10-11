import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Menu from "@/pages/Menu";
import AdminDashboard from "@/pages/AdminDashboard";
import MenuManagement from "@/pages/MenuManagement";
import OrderManagement from "@/pages/OrderManagement";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/menu-management" element={<MenuManagement />} />
          <Route path="/admin/order-management" element={<OrderManagement />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </SessionProvider>
  );
};

export default App;