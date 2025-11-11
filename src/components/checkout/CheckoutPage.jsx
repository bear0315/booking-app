import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { tourService } from '../../services/tourService';
import ContactForm from './ContactForm';
import PaymentMethod from './PaymentMethod';
import TermsAndConditions from './TermsAndConditions';
import OrderSummary from './OrderSummary';
import {
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Check,
  Lock,
  ArrowLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: ''
  });
  const [bookingData, setBookingData] = useState({
    tourDate: new Date().toISOString().split('T')[0],
    numberOfGuests: 1,
    guests: []
  });

  const [errors, setErrors] = useState({});
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get tour data from location state or URL params
    const tourId = new URLSearchParams(location.search).get('tourId') || location.state?.tourData?.id;
    
    if (tourId) {
      fetchTourData(tourId);
    } else if (location.state?.tourData) {
      setTourData(location.state.tourData);
      setLoading(false);
    } else {
      navigate('/tours');
    }

    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, [isAuthenticated, location, navigate, user]);

  const fetchTourData = async (tourId) => {
    try {
      const response = await tourService.getTourById(tourId);
      if (response) {
        setTourData(response);
      }
    } catch (error) {
      console.error('Error fetching tour:', error);
      navigate('/tours');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập tên';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập họ';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!agreed) {
      alert('Vui lòng đồng ý với các điều khoản và điều kiện');
      return;
    }

    if (!tourData) {
      alert('Không tìm thấy thông tin tour');
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking
      const bookingRequest = {
        tourId: tourData.id,
        tourDate: bookingData.tourDate,
        numberOfGuests: bookingData.numberOfGuests,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        specialRequests: formData.specialRequests || null,
        paymentMethod: selectedMethod === 'vnpay' ? 'VNPay' : 
                      selectedMethod === 'paypal' ? 'PayPal' : 
                      selectedMethod === 'creditcard' ? 'CreditCard' : 'Cash',
        guests: bookingData.guests || []
      };

      const bookingResponse = await bookingService.createBooking(bookingRequest);
      
      if (bookingResponse.success && bookingResponse.data) {
        const bookingId = bookingResponse.data.id;

        // If VNPay, create payment URL and redirect
        if (selectedMethod === 'vnpay') {
          const paymentResponse = await paymentService.createPaymentUrl(bookingId);
          if (paymentResponse.success && paymentResponse.data) {
            window.location.href = paymentResponse.data;
          } else {
            alert('Không thể tạo URL thanh toán. Vui lòng thử lại.');
            setIsProcessing(false);
          }
        } else {
          // For other payment methods, redirect to booking history
          navigate('/bookings');
        }
      } else {
        alert(bookingResponse.message || 'Không thể tạo đặt tour. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy thông tin tour</p>
          <button 
            onClick={() => navigate('/tours')}
            className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600"
          >
            Quay lại danh sách tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
          <button 
              onClick={() => navigate('/tours')} 
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500"
            >
              <ArrowLeft size={20} />
              <span>Quay lại danh sách tour</span>
            </button>
            <h1 className="text-2xl font-bold">Thanh toán</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cột trái - Biểu mẫu */}
          <div className="lg:col-span-2">
            <ContactForm 
              formData={formData} 
              setFormData={setFormData}
              errors={errors}
            />
            
            <PaymentMethod 
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
            />
            
            <TermsAndConditions 
              agreed={agreed}
              setAgreed={setAgreed}
            />

            {/* Nút hoàn tất thanh toán */}
            <button 
              onClick={handlePayment}
              disabled={isProcessing || !agreed}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                isProcessing || !agreed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Hoàn tất thanh toán - {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(tourData.price * bookingData.numberOfGuests || tourData.price)}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              tourData={{
                ...tourData,
                title: tourData.name || tourData.title,
                price: tourData.price,
                guests: bookingData.numberOfGuests,
                total: (tourData.price || 0) * bookingData.numberOfGuests
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
