import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign,
  Search,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Trash2,
  RefreshCw,
  Loader,
  AlertCircle,
  UserCheck,
  UserX,
  UserCog
} from 'lucide-react';

const BookingManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [assignReason, setAssignReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'Admin') {
      navigate('/');
      return;
    }

    fetchBookings();
  }, [page, statusFilter, isAuthenticated, user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = statusFilter === 'all' ? null : statusFilter;
      const response = await bookingService.getAllBookings(page, pageSize, status);
      
      if (response.success || response.Success) {
        const bookingData = response.data || response.Data || [];
        
        const mappedBookings = bookingData.map(booking => ({
          id: booking.id || booking.Id,
          bookingCode: booking.bookingCode || booking.BookingCode,
          customer: booking.customerName || booking.CustomerName || 'N/A',
          email: booking.customerEmail || booking.CustomerEmail || 'N/A',
          phone: booking.customerPhone || booking.CustomerPhone || 'N/A',
          tour: booking.tourName || booking.TourName || 'N/A',
          tourId: booking.tourId || booking.TourId,
          location: booking.location || booking.tourLocation || booking.TourLocation || 'N/A',
          date: booking.tourDate || booking.TourDate || booking.startDate || booking.StartDate,
          bookingDate: booking.bookingDate || booking.BookingDate || booking.createdAt || booking.CreatedAt,
          guests: booking.numberOfGuests || booking.NumberOfGuests || 0,
          amount: booking.totalAmount || booking.TotalAmount || 0,
          status: booking.status || booking.Status || 'Pending',
          payment: booking.paymentStatus || booking.PaymentStatus || 'Unpaid',
          paymentMethod: booking.paymentMethod || booking.PaymentMethod || 'N/A',
          guide: booking.guideName || booking.GuideName || 'Chưa gán',
          guideId: booking.guideId || booking.GuideId || null,
          duration: booking.duration || booking.Duration || 'N/A',
          specialRequests: booking.specialRequests || booking.SpecialRequests,
          userId: booking.userId || booking.UserId
        }));
        
        setBookings(mappedBookings);
        
        if (response.totalPages || response.TotalPages) {
          setTotalPages(response.totalPages || response.TotalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGuides = async (tourId, tourDate) => {
    setActionLoading(true);
    try {
      let formattedDate = tourDate;
      if (tourDate) {
        const dateObj = new Date(tourDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
      
      console.log('Fetching guides for:', { tourId, originalDate: tourDate, formattedDate });
      
      const response = await bookingService.getAvailableGuides(tourId, formattedDate);
      
      if (response.success || response.Success) {
        const guidesData = response.data || response.Data || [];
        
        const mappedGuides = guidesData.map(guide => ({
          guideId: guide.guideId || guide.GuideId,
          fullName: guide.fullName || guide.FullName || 'N/A',
          avatar: guide.avatar || guide.Avatar,
          bio: guide.bio || guide.Bio,
          languages: guide.languages || guide.Languages,
          isAvailable: guide.isAvailable ?? guide.IsAvailable ?? true, 
          isDefaultGuide: guide.isDefaultGuide ?? guide.IsDefaultGuide ?? false,
          averageRating: guide.averageRating || guide.AverageRating || 0,
          totalReviews: guide.totalReviews || guide.TotalReviews || 0,
          unavailabilityReason: guide.unavailabilityReason || guide.UnavailabilityReason,
          conflictingBookingCode: guide.conflictingBookingCode || guide.ConflictingBookingCode,
          conflictingBookingId: guide.conflictingBookingId || guide.ConflictingBookingId
        }));
        
        console.log('Mapped guides:', mappedGuides);
        setAvailableGuides(mappedGuides);
      } else {
        setAvailableGuides([]);
        alert(response.message || 'Không thể tải danh sách guides');
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      setAvailableGuides([]);
      alert('Không thể tải danh sách guides: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenGuideModal = async (booking) => {
    setSelectedBooking(booking);
    setSelectedGuideId(booking.guideId);
    setAssignReason('');
    setShowGuideModal(true);
    setShowActionMenu(null);
    
    await fetchAvailableGuides(booking.tourId, booking.date);
  };

  const handleAssignGuide = async () => {
    if (!selectedGuideId) {
      alert('Vui lòng chọn guide');
      return;
    }

    setActionLoading(true);
    try {
      const response = await bookingService.assignGuideToBooking(
        selectedBooking.id,
        selectedGuideId,
        assignReason || null
      );

      if (response.success || response.Success) {
        const updatedBooking = response.data || response.Data;
        
        setBookings(bookings.map(b => 
          b.id === selectedBooking.id 
            ? { 
                ...b, 
                guide: updatedBooking.guideName || updatedBooking.GuideName || 'N/A',
                guideId: selectedGuideId 
              } 
            : b
        ));
        
        setShowGuideModal(false);
        setSelectedGuideId(null);
        setAssignReason('');
        alert(response.message || 'Gán guide thành công!');
      } else {
        alert(response.message || 'Không thể gán guide');
      }
    } catch (error) {
      console.error('Error assigning guide:', error);
      alert('Không thể gán guide: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveGuide = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ guide khỏi booking này?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await bookingService.removeGuideFromBooking(bookingId);
      
      if (response.success || response.Success) {
        setBookings(bookings.map(b => 
          b.id === bookingId 
            ? { ...b, guide: 'Chưa gán', guideId: null } 
            : b
        ));
        setShowActionMenu(null);
        alert(response.message || 'Gỡ guide thành công!');
      } else {
        alert(response.message || 'Không thể gỡ guide');
      }
    } catch (error) {
      console.error('Error removing guide:', error);
      alert('Không thể gỡ guide: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = {
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    revenue: bookings.filter(b => b.payment === 'Paid').reduce((sum, b) => sum + b.amount, 0)
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.bookingCode && booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.customer && booking.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.tour && booking.tour.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPayment = paymentFilter === 'all' || booking.payment === paymentFilter;
    
    return matchesSearch && matchesPayment;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      'Completed': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {status}
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

  const handleViewDetails = async (booking) => {
    try {
      const response = await bookingService.getBookingById(booking.id);
      if (response.success || response.Success) {
        const fullBooking = response.data || response.Data;
        setSelectedBooking({
          ...booking,
          ...fullBooking
        });
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setSelectedBooking(booking);
      setShowDetailModal(true);
    }
    setShowActionMenu(null);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      const response = await bookingService.updateBookingStatus(bookingId, {
        status: newStatus
      });
      
      if (response.success || response.Success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
        alert('Cập nhật trạng thái thành công!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa booking này?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await bookingService.deleteBooking(bookingId);
      
      if (response.success || response.Success) {
        setBookings(bookings.filter(b => b.id !== bookingId));
        alert('Xóa booking thành công!');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Không thể xóa booking: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Booking</h1>
            <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đặt tour</p>
          </div>
          <button 
            onClick={fetchBookings}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 font-semibold disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle size={24} />
              <span className="font-semibold">Đã xác nhận</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Clock size={24} />
              <span className="font-semibold">Chờ xác nhận</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle size={24} />
              <span className="font-semibold">Đã hủy</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <DollarSign size={24} />
              <span className="font-semibold">Doanh thu</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã booking, khách hàng, tour..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Pending">Chờ xác nhận</option>
              <option value="Completed">Đã hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
            <select 
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Unpaid">Chưa thanh toán</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Mã Booking</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Khách hàng</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Tour</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Guide</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Ngày</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Số khách</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Tổng tiền</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Trạng thái</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <Loader className="animate-spin text-cyan-500 mx-auto mb-3" size={36} />
                      <p className="text-gray-500">Đang tải...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Không tìm thấy booking nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-bold text-cyan-600">{booking.bookingCode}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.customer}</p>
                          <p className="text-xs text-gray-500">{booking.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">{booking.tour}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin size={12} />
                          {booking.location}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {booking.guideId ? (
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-green-500" />
                            <span className="text-gray-900 font-medium">{booking.guide}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserX size={16} className="text-gray-400" />
                            <span className="text-gray-400 italic">Chưa gán</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {formatDate(booking.date)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          {booking.guests}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{formatCurrency(booking.amount)}</span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(booking.status)}</td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === booking.id ? null : booking.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={actionLoading}
                          >
                            <MoreVertical size={18} className="text-gray-600" />
                          </button>
                          
                          {showActionMenu === booking.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border z-10">
                              <button
                                onClick={() => handleOpenGuideModal(booking)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b"
                              >
                                <UserCog size={16} className="text-purple-500" />
                                {booking.guideId ? 'Đổi guide' : 'Gán guide'}
                              </button>
                              {booking.guideId && (
                                <button
                                  onClick={() => handleRemoveGuide(booking.id)}
                                  disabled={actionLoading}
                                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 border-b disabled:opacity-50"
                                >
                                  <UserX size={16} />
                                  Gỡ guide
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b"
                              >
                                <Eye size={16} className="text-cyan-500" />
                                Xem chi tiết
                              </button>
                              {booking.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b disabled:opacity-50"
                                >
                                  <CheckCircle size={16} className="text-green-500" />
                                  Xác nhận
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={actionLoading}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-5 py-2 border-2 border-gray-200 rounded-lg hover:border-cyan-500 font-medium disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-5 py-2 rounded-lg font-medium ${
                  page === pageNum
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'border-2 border-gray-200 hover:border-cyan-500'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-5 py-2 border-2 border-gray-200 rounded-lg hover:border-cyan-500 font-medium disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Guide Assignment Modal */}
      {showGuideModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Gán Guide cho Booking</h2>
                  <p className="text-purple-100">Booking: {selectedBooking.bookingCode}</p>
                  <p className="text-purple-100 text-sm">Tour: {selectedBooking.tour}</p>
                  <p className="text-purple-100 text-sm">Ngày: {formatDate(selectedBooking.date)}</p>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {actionLoading ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin text-purple-500 mx-auto mb-3" size={48} />
                  <p className="text-gray-600">Đang tải danh sách guides...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {availableGuides.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có guide nào được gán cho tour này</p>
                      </div>
                    ) : (
                      availableGuides.map((guide) => (
                        <div
                          key={guide.guideId}
                          onClick={() => guide.isAvailable && setSelectedGuideId(guide.guideId)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedGuideId === guide.guideId
                              ? 'border-purple-500 bg-purple-50'
                              : guide.isAvailable
                              ? 'border-gray-200 hover:border-purple-300'
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {guide.fullName?.charAt(0) || 'G'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900">{guide.fullName}</h3>
                                  {guide.isDefault && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                      Mặc định
                                    </span>
                                  )}
                                  {!guide.isAvailable && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                      Không khả dụng
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-semibold">{guide.averageRating || 0}</span>
                                    <span className="text-gray-400">({guide.totalReviews || 0} reviews)</span>
                                  </div>
                                  {guide.languages && (
                                    <span className="text-sm text-gray-500">{guide.languages}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedGuideId === guide.guideId && (
                              <CheckCircle className="text-purple-500" size={24} />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lý do gán guide (tùy chọn)
                    </label>
                    <textarea
                      value={assignReason}
                      onChange={(e) => setAssignReason(e.target.value)}
                      placeholder="Ví dụ: Guide ban đầu bận việc..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowGuideModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAssignGuide}
                      disabled={!selectedGuideId || actionLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
                    >
                      {actionLoading ? 'Đang xử lý...' : 'Xác nhận gán'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Chi Tiết Booking</h2>
                  <p className="text-cyan-100">Mã: {selectedBooking.bookingCode}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users size={20} className="text-cyan-500" />
                  Thông tin khách hàng
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Họ tên</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {selectedBooking.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {selectedBooking.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số khách</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.guests} người</p>
                  </div>
                </div>
              </div>

              {/* Tour Info */}
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  Thông tin tour
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tên tour</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.tour}</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Địa điểm</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Thời lượng</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hướng dẫn viên</p>
                      <div className="flex items-center gap-2">
                        {selectedBooking.guideId ? (
                          <>
                            <UserCheck size={16} className="text-green-500" />
                            <span className="font-semibold text-gray-900">{selectedBooking.guide}</span>
                          </>
                        ) : (
                          <>
                            <UserX size={16} className="text-gray-400" />
                            <span className="text-gray-400 italic">Chưa gán</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-green-50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-green-500" />
                  Chi tiết đặt tour
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày khởi hành</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-2xl text-green-600">{formatCurrency(selectedBooking.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-amber-50 rounded-xl p-5 border-l-4 border-amber-500">
                  <h3 className="font-bold text-lg mb-2 text-amber-700">Yêu cầu đặc biệt</h3>
                  <p className="text-gray-700">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => window.location.href = `mailto:${selectedBooking.email}`}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Gửi email
                </button>
                <button 
                  onClick={() => window.location.href = `tel:${selectedBooking.phone}`}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Gọi điện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;