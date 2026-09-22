import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Spinner from "./components/ui/Spinner";

// Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Customer
import Home          from "./pages/customer/Home";
import ProductDetail from "./pages/customer/ProductDetail";
import StoreList     from "./pages/customer/StoreList";
import StoreDetail   from "./pages/customer/StoreDetail";
import Cart          from "./pages/customer/Cart";
import Checkout      from "./pages/customer/Checkout";
import Payment       from "./pages/customer/Payment";
import Orders        from "./pages/customer/Orders";
import OrderDetail   from "./pages/customer/OrderDetail";

// Seller
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts  from "./pages/seller/SellerProducts";
import SellerOrders    from "./pages/seller/SellerOrders";
import SellerReport    from "./pages/seller/SellerReport";

// Admin
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminUsers        from "./pages/admin/AdminUsers";
import AdminStores       from "./pages/admin/AdminStores";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminProducts     from "./pages/admin/AdminProducts";

/* ── Route guard ── */
function RequireAuth({ children, role }: { children: React.ReactNode; role?: string | string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/* ── Main routing ── */
function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;

  return (
    <Routes>
      {/* Public auth */}
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Public browsing */}
      <Route path="/"              element={<Home />} />
      <Route path="/products/:id"  element={<ProductDetail />} />
      <Route path="/stores"        element={<StoreList />} />
      <Route path="/stores/:id"    element={<StoreDetail />} />

      {/* Customer */}
      <Route path="/cart"                    element={<RequireAuth role="CUSTOMER"><Cart /></RequireAuth>} />
      <Route path="/checkout"                element={<RequireAuth role="CUSTOMER"><Checkout /></RequireAuth>} />
      <Route path="/orders"                  element={<RequireAuth role="CUSTOMER"><Orders /></RequireAuth>} />
      <Route path="/orders/:id"              element={<RequireAuth role="CUSTOMER"><OrderDetail /></RequireAuth>} />
      <Route path="/orders/:id/payment"      element={<RequireAuth role="CUSTOMER"><Payment /></RequireAuth>} />

      {/* Seller */}
      <Route path="/seller"          element={<RequireAuth role="SELLER"><SellerDashboard /></RequireAuth>} />
      <Route path="/seller/products" element={<RequireAuth role="SELLER"><SellerProducts /></RequireAuth>} />
      <Route path="/seller/orders"   element={<RequireAuth role="SELLER"><SellerOrders /></RequireAuth>} />
      <Route path="/seller/report"   element={<RequireAuth role="SELLER"><SellerReport /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin"              element={<RequireAuth role="ADMIN"><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/users"        element={<RequireAuth role="ADMIN"><AdminUsers /></RequireAuth>} />
      <Route path="/admin/stores"       element={<RequireAuth role="ADMIN"><AdminStores /></RequireAuth>} />
      <Route path="/admin/transactions" element={<RequireAuth role="ADMIN"><AdminTransactions /></RequireAuth>} />
      <Route path="/admin/products"     element={<RequireAuth role="ADMIN"><AdminProducts /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
