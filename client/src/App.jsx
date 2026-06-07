import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import PaintingDetail from './pages/PaintingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-100 font-sans pb-16 md:pb-0">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow pt-16"> {/* Add top padding for fixed header */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/painting/:id" element={<PaintingDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Chatbot />
            <BottomNav />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
