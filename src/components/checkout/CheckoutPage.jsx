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
    const tourId = new URLSearchParams(location.search).get('tourId') || 
                   location.state?.tourData?.id || 
                   location.state?.tourData?.Id;
    
    // Get booking data from location state (date, guests)
    if (location.state?.tourData) {
      const stateData = location.state.tourData;
      if (stateData.date) {
        setBookingData(prev => ({
          ...prev,
          tourDate: stateData.date
        }));
      }
      if (stateData.guests) {
        setBookingData(prev => ({
          ...prev,
          numberOfGuests: stateData.guests
        }));
      }
    }
    
    if (tourId) {
      fetchTourData(tourId);
    } else if (location.state?.tourData) {
      // Use tour data from state if available
      const stateTourData = location.state.tourData;
      setTourData(stateTourData);
      setLoading(false);
    } else {
      navigate('/tours');
    }

    // Pre-fill user data if available
    if (user) {
      const userName = user.name || user.fullName || user.Name || user.FullName || '';
      const nameParts = userName.split(' ');
      setFormData(prev => ({
        ...prev,
        email: user.email || user.Email || '',
        phone: user.phone || user.phoneNumber || user.PhoneNumber || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      }));
    }
  }, [isAuthenticated, location, navigate, user]);

  const fetchTourData = async (tourId) => {
    try {
      console.log('Fetching tour data for ID:', tourId);
      const response = await tourService.getTourById(tourId);
      console.log('Tour data response:', response);
      
      // Handle different response structures
      let tourData = response;
      if (response?.data) {
        tourData = response.data;
      } else if (response?.Data) {
        tourData = response.Data;
      }
      
      setTourData(tourData);
    } catch (error) {
      console.error('Error fetching tour:', error);
      alert('Không thể tải thông tin tour. Vui lòng thử lại.');
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
      // Normalize tour ID
      const tourId = tourData.id || tourData.Id;
      if (!tourId) {
        alert('Không tìm thấy thông tin tour. Vui lòng thử lại.');
        setIsProcessing(false);
        return;
      }

      // Create booking request
      const bookingRequest = {
        tourId: tourId,
        tourDate: bookingData.tourDate,
        numberOfGuests: bookingData.numberOfGuests,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        specialRequests: formData.specialRequests || null,
        paymentMethod: selectedMethod === 'vnpay' ? 'VNPay' : 
                      selectedMethod === 'paypal' ? 'PayPal' : 
                      selectedMethod === 'creditcard' ? 'CreditCard' : 
                      selectedMethod === 'cash' ? 'Cash' : 'VNPay',
        guests: bookingData.guests || []
      };

      console.log('Creating booking with request:', bookingRequest);
      const bookingResponse = await bookingService.createBooking(bookingRequest);
      console.log('Booking response:', bookingResponse);
      
      // Handle different response structures
      const success = bookingResponse.success || bookingResponse.Success || false;
      const bookingDataResponse = bookingResponse.data || bookingResponse.Data;
      const bookingId = bookingDataResponse?.id || bookingDataResponse?.Id;
      
      if (success && bookingId) {
        // If VNPay, create payment URL and redirect
        if (selectedMethod === 'vnpay') {
          console.log('Creating VNPay payment URL for booking:', bookingId);
          const paymentResponse = await paymentService.createPaymentUrl(bookingId);
          console.log('Payment URL response:', paymentResponse);
          
          const paymentSuccess = paymentResponse.success || paymentResponse.Success || false;
          const paymentUrl = paymentResponse.data || paymentResponse.Data;
          
          if (paymentSuccess && paymentUrl) {
            // Redirect to VNPay payment page
            window.location.href = paymentUrl;
          } else {
            const errorMessage = paymentResponse.message || paymentResponse.Message || 'Không thể tạo URL thanh toán. Vui lòng thử lại.';
            alert(errorMessage);
            setIsProcessing(false);
          }
        } else {
          // For other payment methods (Cash, BankTransfer), redirect to booking history
          navigate('/bookings', { 
            state: { 
              message: 'Đặt tour thành công! Vui lòng thanh toán khi đến nơi.' 
            } 
          });
        }
      } else {
        const errorMessage = bookingResponse.message || bookingResponse.Message || 'Không thể tạo đặt tour. Vui lòng thử lại.';
        alert(errorMessage);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      alert(errorMessage);
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
            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Thông tin đặt tour</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Tour Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày khởi hành *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={bookingData.tourDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingData(prev => ({ ...prev, tourDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng khách *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <div className="flex items-center gap-4 pl-10">
                      <button 
                        type="button"
                        onClick={() => setBookingData(prev => ({ 
                          ...prev, 
                          numberOfGuests: Math.max(1, prev.numberOfGuests - 1) 
                        }))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-lg">{bookingData.numberOfGuests}</span>
                      <button 
                        type="button"
                        onClick={() => setBookingData(prev => ({ 
                          ...prev, 
                          numberOfGuests: Math.min(20, prev.numberOfGuests + 1) 
                        }))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                  }).format((tourData.price || tourData.Price || 0) * bookingData.numberOfGuests)}
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
                title: tourData.name || tourData.Name || tourData.title || 'Tour',
                name: tourData.name || tourData.Name || tourData.title || 'Tour',
                image: tourData.primaryImageUrl || tourData.PrimaryImageUrl || tourData.imageUrl || tourData.image || '',
                price: tourData.price || tourData.Price || 0,
                location: tourData.location || tourData.Location || tourData.destinationName || tourData.DestinationName || '',
                date: bookingData.tourDate,
                guests: bookingData.numberOfGuests,
                total: (tourData.price || tourData.Price || 0) * bookingData.numberOfGuests,
                serviceFee: Math.round((tourData.price || tourData.Price || 0) * bookingData.numberOfGuests * 0.1),
                insurance: 0
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
