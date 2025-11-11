import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle, Home, RefreshCw, BookOpen } from 'lucide-react';

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const bookingCode = searchParams.get('bookingCode');
  const message = searchParams.get('message') || 'Thanh toán không thành công';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="text-red-500" size={64} />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thanh toán thất bại
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {decodeURIComponent(message)}
          </p>
          
          {bookingCode && (
            <p className="text-sm text-gray-500 mb-8">
              Mã đặt tour: <span className="font-semibold">{bookingCode}</span>
            </p>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Lưu ý</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Đơn đặt tour của bạn vẫn được lưu với trạng thái "Chưa thanh toán"</li>
                  <li>• Bạn có thể thử thanh toán lại từ trang lịch sử đặt tour</li>
                  <li>• Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {bookingCode && (
              <button
                onClick={() => navigate(`/bookings`)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <RefreshCw size={20} />
                Thử lại thanh toán
              </button>
            )}
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

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Cần hỗ trợ? Vui lòng liên hệ với chúng tôi:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="tel:+41216340505" className="text-cyan-600 hover:underline">
                📞 +41 21 634 05 05
              </a>
              <a href="mailto:Booking@alpsshiking.co" className="text-cyan-600 hover:underline">
                ✉️ Booking@alpsshiking.co
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;

