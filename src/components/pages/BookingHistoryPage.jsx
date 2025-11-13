import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Loader,
  CreditCard,
  UserCheck,
  UserX
} from 'lucide-react';

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, page]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getMyBookings(page, pageSize);
      
      console.log('Booking API Response:', response);
      
      // Handle different response structures
      let bookingData = [];
      if (response.success || response.Success) {
        bookingData = response.data || response.Data || [];
      }
      
      const mappedBookings = bookingData.map(booking => ({
        id: booking.id || booking.Id,
        bookingCode: booking.bookingCode || booking.BookingCode,
        tourId: booking.tourId || booking.TourId,
        tourName: booking.tourName || booking.TourName || 'N/A',
        image: booking.image || booking.tourImage || booking.TourImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
        location: booking.location || booking.tourLocation || booking.TourLocation || 'N/A',
        bookingDate: booking.bookingDate || booking.BookingDate || booking.createdAt || booking.CreatedAt,
        tourDate: booking.tourDate || booking.TourDate || booking.startDate || booking.StartDate,
        guests: booking.numberOfGuests || booking.NumberOfGuests || booking.guests || booking.Guests || 1,
        duration: booking.duration || booking.Duration || 'N/A',
        totalPrice: booking.totalAmount || booking.TotalAmount || 0,
        status: booking.status || booking.Status || 'Pending',
        paymentStatus: booking.paymentStatus || booking.PaymentStatus || 'Unpaid',
        paymentMethod: booking.paymentMethod || booking.PaymentMethod || 'N/A',
        paymentTransactionId: booking.paymentTransactionId || booking.PaymentTransactionId,
        paymentDate: booking.paymentDate || booking.PaymentDate,
        
        guide: {
          id: booking.guideId || booking.GuideId,
          name: booking.guideName || booking.GuideName || 'Chưa gán',
          avatar: booking.guideAvatar || booking.GuideAvatar,
          phone: booking.guidePhone || booking.GuidePhone,
          email: booking.guideEmail || booking.GuideEmail,
          languages: booking.guideLanguages || booking.GuideLanguages,
          rating: booking.guideRating || booking.GuideRating || 0
        },
        
        customerName: booking.customerName || booking.CustomerName,
        customerEmail: booking.customerEmail || booking.CustomerEmail,
        customerPhone: booking.customerPhone || booking.CustomerPhone,
        specialRequests: booking.specialRequests || booking.SpecialRequests,
        cancelReason: booking.cancelReason || booking.CancelReason,
        rating: booking.rating || booking.Rating,
        review: booking.review || booking.Review
      }));
      
      console.log('Mapped bookings with guides:', mappedBookings);
      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on active tab and search query
  useEffect(() => {
    let filtered = [...bookings];
    
    // Filter by status tab
    if (activeTab !== 'all') {
      const statusMap = {
        'confirmed': 'Confirmed',
        'pending': 'Pending',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      };
      filtered = filtered.filter(b => b.status === statusMap[activeTab]);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(b => 
        (b.tourName && b.tourName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.location && b.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.bookingCode && b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredBookings(filtered);
  }, [bookings, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'Tất cả', count: bookings.length },
    { id: 'confirmed', label: 'Đã xác nhận', count: bookings.filter(b => b.status === 'Confirmed').length },
    { id: 'pending', label: 'Chờ xác nhận', count: bookings.filter(b => b.status === 'Pending').length },
    { id: 'completed', label: 'Đã hoàn thành', count: bookings.filter(b => b.status === 'Completed').length },
    { id: 'cancelled', label: 'Đã hủy', count: bookings.filter(b => b.status === 'Cancelled').length }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Confirmed': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        icon: CheckCircle,
        label: 'Đã xác nhận'
      },
      'Pending': { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        icon: AlertCircle,
        label: 'Chờ xác nhận'
      },
      'Completed': { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: CheckCircle,
        label: 'Đã hoàn thành'
      },
      'Cancelled': { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        icon: XCircle,
        label: 'Đã hủy'
      }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      'Paid': { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        icon: CheckCircle,
        label: 'Đã thanh toán'
      },
      'Unpaid': { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        icon: AlertCircle,
        label: 'Chưa thanh toán'
      },
      'Refunded': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        icon: CreditCard,
        label: 'Đã hoàn tiền'
      }
    };

    const config = statusConfig[paymentStatus] || statusConfig['Unpaid'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePayNow = async (booking) => {
    try {
      navigate(`/checkout?bookingId=${booking.id}`);
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Lịch Sử Đặt Tour</h1>
              <p className="text-cyan-100">Quản lý và theo dõi các chuyến đi của bạn</p>
            </div>
            <button 
              onClick={() => navigate('/tours')}
              className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-all flex items-center gap-2"
            >
              <span>Đặt tour mới</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold">{user?.name || user?.fullName || user?.email || 'User'}</p>
                  <p className="text-xs text-cyan-100">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-cyan-100 text-sm mb-1">Tổng đặt tour</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-cyan-100 text-sm mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold">
                {formatCurrency(bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0))}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <p className="text-cyan-100 text-sm mb-1">Liên hệ</p>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} />
                <span>{user?.phone || user?.phoneNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tour, địa điểm hoặc mã đặt tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={fetchBookings}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-semibold"
            >
              <Filter size={20} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-cyan-500" size={48} />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đặt tour nào</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? 'Thử thay đổi bộ lọc hoặc tìm kiếm của bạn' 
                  : 'Bạn chưa có đặt tour nào. Hãy khám phá các tour tuyệt vời!'}
              </p>
              <button 
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                  navigate('/tours');
                }}
                className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-all"
              >
                Khám phá tour
              </button>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="lg:w-64 flex-shrink-0">
                      <img 
                        src={booking.image} 
                        alt={booking.tourName}
                        className="w-full h-48 lg:h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{booking.tourName}</h3>
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} className="text-cyan-500" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Mã đặt tour</p>
                          <p className="font-bold text-cyan-600">{booking.bookingCode}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar size={16} className="text-cyan-500" />
                            <span>Ngày đặt</span>
                          </div>
                          <p className="font-semibold text-gray-900">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar size={16} className="text-cyan-500" />
                            <span>Ngày khởi hành</span>
                          </div>
                          <p className="font-semibold text-gray-900">{formatDate(booking.tourDate)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Users size={16} className="text-cyan-500" />
                            <span>Số khách</span>
                          </div>
                          <p className="font-semibold text-gray-900">{booking.guests} người</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Clock size={16} className="text-cyan-500" />
                            <span>Thời gian</span>
                          </div>
                          <p className="font-semibold text-gray-900">{booking.duration}</p>
                        </div>
                      </div>

                      {}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-3">Hướng dẫn viên</p>
                        
                        {booking.guide.id ? (
                          <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                            {/* Guide Avatar */}
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                              {booking.guide.avatar ? (
                                <img 
                                  src={booking.guide.avatar} 
                                  alt={booking.guide.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                booking.guide.name?.charAt(0) || 'G'
                              )}
                            </div>
                            
                            {/* Guide Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900">{booking.guide.name}</h4>
                                <UserCheck size={16} className="text-green-500" />
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {booking.guide.languages && (
                                  <span className="flex items-center gap-1">
                                    <span>🌐</span>
                                    {booking.guide.languages}
                                  </span>
                                )}
                                {booking.guide.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold">{booking.guide.rating.toFixed(1)}</span>
                                  </span>
                                )}
                              </div>
                              
                              {/* Guide Contact */}
                              {(booking.guide.phone || booking.guide.email) && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                  {booking.guide.phone && (
                                    <a href={`tel:${booking.guide.phone}`} className="flex items-center gap-1 hover:text-cyan-600">
                                      <Phone size={12} />
                                      {booking.guide.phone}
                                    </a>
                                  )}
                                  {booking.guide.email && (
                                    <a href={`mailto:${booking.guide.email}`} className="flex items-center gap-1 hover:text-cyan-600">
                                      <Mail size={12} />
                                      {booking.guide.email}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                            <UserX size={20} className="text-gray-400" />
                            <span className="text-gray-600 italic">Chưa gán hướng dẫn viên</span>
                          </div>
                        )}
                      </div>
                      {}

                      {/* Payment & Total */}
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Thanh toán qua</p>
                          <p className="font-semibold text-gray-900">{booking.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Tổng giá</p>
                          <p className="text-2xl font-bold text-cyan-600">{formatCurrency(booking.totalPrice)}</p>
                        </div>
                      </div>

                      {/* Payment Transaction Info */}
                      {booking.paymentTransactionId && (
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Mã giao dịch:</span> {booking.paymentTransactionId}
                          </p>
                          {booking.paymentDate && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Ngày thanh toán:</span> {formatDate(booking.paymentDate)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Cancel Reason */}
                      {booking.status === 'Cancelled' && booking.cancelReason && (
                        <div className="bg-red-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-red-700 mb-1">Lý do hủy</p>
                          <p className="text-sm text-gray-700">{booking.cancelReason}</p>
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-yellow-700 mb-1">Yêu cầu đặc biệt</p>
                          <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => navigate(`/tour?id=${booking.tourId}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-all"
                        >
                          <Eye size={18} />
                          <span>Xem chi tiết</span>
                        </button>
                        
                        {booking.status === 'Pending' && booking.paymentStatus === 'Unpaid' && (
                          <button 
                            onClick={() => handlePayNow(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                          >
                            <CreditCard size={18} />
                            <span>Thanh toán ngay</span>
                          </button>
                        )}

                        {booking.status === 'Completed' && (
                          <button 
                            onClick={() => navigate('/tours')}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-cyan-500 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-all"
                          >
                            <ChevronRight size={18} />
                            <span>Đặt lại</span>
                          </button>
                        )}

                        {/* Contact Guide */}
                        {booking.guide.id && booking.guide.phone && (
                          <a 
                            href={`tel:${booking.guide.phone}`}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                          >
                            <Phone size={18} />
                            <span>Liên hệ guide</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;