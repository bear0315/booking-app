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
import GuideSelectorCheckout from './GuideSelectorCheckout';
import {
  Calendar,
  Users,
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

  // ✅ Hướng dẫn viên
  const [guides, setGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [guidesError, setGuidesError] = useState(null);

  const [errors, setErrors] = useState({});
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const tourId = new URLSearchParams(location.search).get('tourId') ||
                   location.state?.tourData?.id ||
                   location.state?.tourData?.Id;

    if (location.state?.tourData) {
      const stateData = location.state.tourData;
      if (stateData.date) {
        setBookingData(prev => ({ ...prev, tourDate: stateData.date }));
      }
      if (stateData.guests) {
        setBookingData(prev => ({ ...prev, numberOfGuests: stateData.guests }));
      }
    }

    if (tourId) fetchTourData(tourId);
    else if (location.state?.tourData) {
      setTourData(location.state.tourData);
      setLoading(false);
    } else navigate('/tours');

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

  // 🔁 Lấy hướng dẫn viên theo ngày
  useEffect(() => {
    const tourId = tourData?.id || tourData?.Id;
    if (tourId && bookingData.tourDate) {
      fetchAvailableGuides(tourId, bookingData.tourDate);
    }
  }, [tourData, bookingData.tourDate]);

  const fetchTourData = async (tourId) => {
    try {
      const response = await tourService.getTourById(tourId);
      const tour = response?.data || response?.Data || response;
      setTourData(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      alert('Không thể tải thông tin tour.');
      navigate('/tours');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGuides = async (tourId, tourDate) => {
    setGuidesLoading(true);
    setGuidesError(null);
    try {
      const res = await bookingService.getAvailableGuides(tourId, tourDate);
      const ok = res?.success || res?.Success;
      const list = res?.data || res?.Data || [];
      if (ok) {
        setGuides(list);
        const def = list.find(g => g.isDefaultGuide && g.isAvailable);
        if (def) setSelectedGuideId(def.guideId);
      } else setGuidesError(res?.message || 'Không thể tải hướng dẫn viên');
    } catch (e) {
      console.error(e);
      setGuidesError('Không thể tải danh sách hướng dẫn viên.');
    } finally {
      setGuidesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Vui lòng nhập tên';
    if (!formData.lastName.trim()) newErrors.lastName = 'Vui lòng nhập họ';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return alert('Vui lòng điền đủ thông tin.');
    if (!agreed) return alert('Vui lòng đồng ý điều khoản.');
    if (!tourData) return alert('Không tìm thấy tour.');

    setIsProcessing(true);
    try {
      const tourId = tourData.id || tourData.Id;
      const bookingReq = {
        tourId,
        tourDate: bookingData.tourDate,
        numberOfGuests: bookingData.numberOfGuests,
        guideId: selectedGuideId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        specialRequests: formData.specialRequests || null,
        paymentMethod: selectedMethod === 'vnpay' ? 'VNPay' :
                       selectedMethod === 'cash' ? 'Cash' : 'VNPay',
        guests: bookingData.guests || []
      };

      const bookingRes = await bookingService.createBooking(bookingReq);
      const success = bookingRes.success || bookingRes.Success;
      const booking = bookingRes.data || bookingRes.Data;
      const bookingId = booking?.id || booking?.Id;

      if (success && bookingId) {
        if (selectedMethod === 'vnpay') {
          const payRes = await paymentService.createPaymentUrl(bookingId);
          const ok = payRes.success || payRes.Success;
          const url = payRes.data || payRes.Data;
          if (ok && url) window.location.href = url;
          else alert(payRes.message || 'Không thể tạo link thanh toán.');
        } else {
          navigate('/bookings', { state: { message: 'Đặt tour thành công!' } });
        }
      } else {
        alert(bookingRes.message || 'Không thể tạo đặt tour.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Lỗi khi thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader className="animate-spin text-cyan-500" size={48} />
    </div>
  );

  if (!tourData) return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <div className="text-center">
        <p className="mb-4">Không tìm thấy thông tin tour.</p>
        <button onClick={() => navigate('/tours')} className="px-6 py-3 bg-cyan-500 text-white rounded-lg">Quay lại</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/tours')} className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
            <ArrowLeft size={20} /> <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Tour info */}
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-2xl font-bold mb-6">Thông tin đặt tour</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Ngày khởi hành *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input
                    type="date"
                    value={bookingData.tourDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingData(p => ({ ...p, tourDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 mb-2 block">Số lượng khách *</label>
                <div className="flex items-center gap-4">
                  <Users className="text-gray-400" size={20}/>
                  <button onClick={() => setBookingData(p => ({ ...p, numberOfGuests: Math.max(1, p.numberOfGuests - 1) }))} className="w-10 h-10 rounded bg-gray-100">-</button>
                  <span className="font-bold text-lg">{bookingData.numberOfGuests}</span>
                  <button onClick={() => setBookingData(p => ({ ...p, numberOfGuests: Math.min(20, p.numberOfGuests + 1) }))} className="w-10 h-10 rounded bg-gray-100">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Guide Selector tích hợp */}
          <GuideSelectorCheckout
            guides={guides}
            selectedGuideId={selectedGuideId}
            onSelectGuide={setSelectedGuideId}
            loading={guidesLoading}
            error={guidesError}
          />

          <ContactForm formData={formData} setFormData={setFormData} errors={errors}/>
          <PaymentMethod selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod}/>
          <TermsAndConditions agreed={agreed} setAgreed={setAgreed}/>

          {/* Nút thanh toán */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || !agreed}
            className={`w-full py-4 mt-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${
              isProcessing || !agreed ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin" size={20}/> Đang xử lý...
              </>
            ) : (
              <>
                Hoàn tất thanh toán - {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format((tourData.price || tourData.Price || 0) * bookingData.numberOfGuests)}
                <ChevronRight size={20}/>
              </>
            )}
          </button>
        </div>

        <OrderSummary
          tourData={{
            ...tourData,
            title: tourData.name || tourData.Name || 'Tour',
            image: tourData.imageUrl || tourData.PrimaryImageUrl || '',
            price: tourData.price || tourData.Price || 0,
            date: bookingData.tourDate,
            guests: bookingData.numberOfGuests,
            total: (tourData.price || tourData.Price || 0) * bookingData.numberOfGuests,
            serviceFee: Math.round((tourData.price || tourData.Price || 0) * bookingData.numberOfGuests * 0.1)
          }}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
