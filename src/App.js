import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Import pages
import HomePage from './components/pages/HomePage';
import TourListPage from './components/tours/TourListPage';
import TourDetailPage from './components/tours/TourDetailPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import BookingHistoryPage from './components/pages/BookingHistoryPage'; 
import LoginPage from './components/auth/LoginPage';
import AdminPage from './components/pages/AdminPage';
import PaymentSuccessPage from './components/pages/PaymentSuccessPage';
import PaymentFailurePage from './components/pages/PaymentFailurePage';

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

          {/* Chi tiết tour */}
          <Route path="/tour" element={
            <>
              <Header />
              <main className="pt-[80px]">
                <TourDetailPage />
              </main>
              <Footer />
            </>
          } />

          {/* Checkout */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Lịch sử đặt tour */}
          <Route path="/bookings" element={
            <>
              <Header />
              <main className="pt-[150px]">   {}
                <BookingHistoryPage />
              </main>
              <Footer />
            </>
          } />  {}

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Payment Pages */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/payment/error" element={<PaymentFailurePage />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
};

export default App;