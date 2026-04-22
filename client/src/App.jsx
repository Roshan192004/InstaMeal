import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import AdminDashboard from "./pages/AdminDashboard";
import Order from "./pages/Order";
import Search from "./pages/Search";
import Footer from "./components/Footer";

import { AuthProvider } from "./context/AuthContext";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/order" element={<Order />} />
        <Route path="/search" element={<Search />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;