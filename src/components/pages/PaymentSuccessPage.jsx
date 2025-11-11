import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, FileText, Home, BookOpen } from 'lucide-react';
import { bookingService } from '../../services/bookingService';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const bookingCode = searchParams.get('bookingCode');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const fetchBooking = async () => {
      if (bookingCode) {
        try {
          const response = await bookingService.getBookingByCode(bookingCode);
          if (response.success && response.data) {
            setBooking(response.data);
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-500" size={64} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thanh toán thành công!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Cảm ơn bạn đã đặt tour với chúng tôi
          </p>

          {/* Booking Details */}
          {loading ? (
            <div className="animate-pulse space-y-4 mb-8">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : booking ? (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-green-500" />
                Thông tin đặt tour
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã đặt tour</p>
                    <p className="font-semibold text-gray-900">{booking.bookingCode}</p>
                  </div>
                </div>
                {transactionId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mã giao dịch</p>
                      <p className="font-semibold text-gray-900">{transactionId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tour</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.tourDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(booking.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-600">
                {bookingCode ? `Mã đặt tour: ${bookingCode}` : 'Không tìm thấy thông tin đặt tour'}
              </p>
              {transactionId && (
                <p className="text-gray-600 mt-2">Mã giao dịch: {transactionId}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/bookings')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <BookOpen size={20} />
              Xem lịch sử đặt
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. 
              Vui lòng kiểm tra hộp thư để biết thêm chi tiết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

