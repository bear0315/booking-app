import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import GuideDashboard from './components/pages/GuideDashboard';
// Import pages
import HomePage from './components/pages/HomePage';
import TourListPage from './components/tours/TourListPage';
import TourDetailPage from './components/tours/TourDetailPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import Profile from './components/pages/Profile';
import MyTours from './components/pages/MyTours';
import ChangePassword from './components/pages/ChangePassword';
import BookingHistoryPage from './components/pages/BookingHistoryPage';
import LoginPage from './components/auth/LoginPage';
import AdminPage from './components/pages/AdminPage';
import PaymentSuccessPage from './components/pages/PaymentSuccessPage';
import PaymentFailurePage from './components/pages/PaymentFailurePage';
import TourDetail from './components/tours/TourDetail';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || user?.Role;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect dựa trên role
    if (userRole === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'Guide') {
      return <Navigate to="/guide" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            } />

            {/* Danh sách tour */}
            <Route path="/tours" element={
              <>
                <Header />
                <main className="pt-[120px]">
                  <TourListPage />
                </main>
                <Footer />
              </>
            } />

            {/* Chi tiết tour - Public */}
            <Route path="/tour" element={
              <>
                <Header />
                <main className="pt-[80px]">
                  <TourDetailPage />
                </main>
                <Footer />
              </>
            } />

            {/* Admin tour detail */}
            <Route path="/admin/tours/:id" element={<TourDetail />} />

            {/* Guide Dashboard - Protected with nested routes */}
            <Route
              path="/guide/*"
              element={
                <ProtectedRoute allowedRoles={['Guide']}>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />

            {/* Checkout */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Lịch sử đặt tour */}
            <Route path="/bookings" element={
              <>
                <Header />
                <main className="pt-[150px]">
                  <BookingHistoryPage />
                </main>
                <Footer />
              </>
            } />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin - Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />

            {/* Payment Pages */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failure" element={<PaymentFailurePage />} />
            <Route path="/payment-error" element={<PaymentFailurePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;