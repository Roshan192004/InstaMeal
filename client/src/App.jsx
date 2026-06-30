import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import AdminDashboard from "./pages/AdminDashboard";
import Order from "./pages/Order";
import Search from "./pages/Search";
import Restaurant from "./pages/Restaurant";
import Tracking from "./pages/Tracking";
import OrderHistory from "./pages/OrderHistory";
import PartnerDashboard from "./pages/PartnerDashboard";
import Footer from "./components/Footer";
import OrderNavbar from "./components/OrderNavbar";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import RiderDashboard from "./pages/RiderDashboard";

// Protected route — redirects to /signin if not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#fff',background:'#0f0f0f' }}>Loading…</div>;
  return user ? children : <Navigate to="/signin" replace />;
}

// Partner route — only for store owners
function PartnerRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#fff',background:'#0f0f0f' }}>Loading…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'store_owner' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Rider route
function RiderRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#fff',background:'#0f0f0f' }}>Loading…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isRiderRoute = location.pathname.startsWith('/rider');
  const isPartnerRoute = location.pathname.startsWith('/partner');
  const isAuthRoute = location.pathname === '/signin' || location.pathname === '/signup';
  const hideNavbar = isAdminRoute || isRiderRoute || isPartnerRoute || isAuthRoute;

  return (
    <>
      {!hideNavbar && <OrderNavbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/search" element={<Search />} />
        <Route path="/order" element={<Order />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/partner/*" element={<PartnerRoute><PartnerDashboard /></PartnerRoute>} />
        <Route path="/rider/*" element={<RiderRoute><RiderDashboard /></RiderRoute>} />

        {/* Restaurant menu page */}
        <Route path="/restaurant/:id" element={<Restaurant />} />

        {/* Protected customer routes */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/tracking/:orderId" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      </Routes>
      {!isAdminRoute && !isRiderRoute && !isPartnerRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;