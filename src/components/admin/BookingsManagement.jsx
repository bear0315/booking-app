import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { 
  Filter, 
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
  ChevronDown,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Loader
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
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
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
      
      console.log('Bookings API Response:', response);
      
      if (response.success || response.Success) {
        const bookingData = response.data || response.Data || [];
        
        // Map API response to component structure
        const mappedBookings = bookingData.map(booking => ({
          id: booking.id || booking.Id,
          bookingCode: booking.bookingCode || booking.BookingCode,
          customer: booking.customerName || booking.CustomerName || 'N/A',
          email: booking.customerEmail || booking.CustomerEmail || 'N/A',
          phone: booking.customerPhone || booking.CustomerPhone || 'N/A',
          tour: booking.tourName || booking.TourName || 'N/A',
          location: booking.location || booking.tourLocation || booking.TourLocation || 'N/A',
          date: booking.tourDate || booking.TourDate || booking.startDate || booking.StartDate,
          bookingDate: booking.bookingDate || booking.BookingDate || booking.createdAt || booking.CreatedAt,
          guests: booking.numberOfGuests || booking.NumberOfGuests || 0,
          amount: booking.totalAmount || booking.TotalAmount || 0,
          status: booking.status || booking.Status || 'Pending',
          payment: booking.paymentStatus || booking.PaymentStatus || 'Unpaid',
          paymentMethod: booking.paymentMethod || booking.PaymentMethod || 'N/A',
          paymentTransactionId: booking.paymentTransactionId || booking.PaymentTransactionId,
          paymentDate: booking.paymentDate || booking.PaymentDate,
          guide: booking.guideName || booking.GuideName || 'N/A',
          duration: booking.duration || booking.Duration || 'N/A',
          specialRequests: booking.specialRequests || booking.SpecialRequests,
          cancelReason: booking.cancelReason || booking.CancelReason,
          userId: booking.userId || booking.UserId,
          tourId: booking.tourId || booking.TourId
        }));
        
        setBookings(mappedBookings);
        
        // Handle pagination if available
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

  // Statistics
  const stats = {
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    revenue: bookings.filter(b => b.payment === 'Paid').reduce((sum, b) => sum + b.amount, 0)
  };

  // Filter bookings
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
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã xác nhận' },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Chờ xác nhận' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Đã hủy' },
      'Completed': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Đã hoàn thành' }
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

  const getPaymentBadge = (payment) => {
    const paymentConfig = {
      'Paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã thanh toán' },
      'Unpaid': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chưa thanh toán' },
      'Refunded': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã hoàn tiền' },
      'Pending': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Chờ xử lý' }
    };
    
    const config = paymentConfig[payment] || paymentConfig['Unpaid'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = async (booking) => {
    try {
      // Fetch full booking details
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
        // Update local state
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

  const handleExport = () => {
    // Export to CSV
    const headers = ['Mã Booking', 'Khách hàng', 'Email', 'Tour', 'Ngày khởi hành', 'Số khách', 'Tổng tiền', 'Trạng thái', 'Thanh toán'];
    const data = filteredBookings.map(b => [
      b.bookingCode,
      b.customer,
      b.email,
      b.tour,
      formatDate(b.date),
      b.guests,
      b.amount,
      b.status,
      b.payment
    ]);
    
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold"
            >
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={fetchBookings}
              disabled={loading}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={24} />
                <span className="font-semibold">Đã xác nhận</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
            <p className="text-sm text-gray-500 mt-1">Booking đã xác nhận</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-yellow-600">
                <Clock size={24} />
                <span className="font-semibold">Chờ xác nhận</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Cần xử lý</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={24} />
                <span className="font-semibold">Đã hủy</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
            <p className="text-sm text-gray-500 mt-1">Booking bị hủy</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign size={24} />
                <span className="font-semibold">Doanh thu</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Tổng thu nhập</p>
          </div>
        </div>

        {/* Filters and Search */}
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
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none font-medium"
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
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none font-medium"
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

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Mã Booking</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Khách hàng</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Tour</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Ngày khởi hành</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Số khách</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Tổng tiền</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Trạng thái</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Thanh toán</th>
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
                      <div className="flex flex-col items-center">
                        <AlertCircle size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Không tìm thấy booking nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                        <div>
                          <p className="font-medium text-gray-900">{booking.tour}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin size={12} />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-900 font-medium">{formatDate(booking.date)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">{booking.guests}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-lg text-gray-900">{formatCurrency(booking.amount)}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="py-4 px-6">
                        {getPaymentBadge(booking.payment)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === booking.id ? null : booking.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={actionLoading}
                          >
                            <MoreVertical size={18} className="text-gray-600" />
                          </button>
                          
                          {showActionMenu === booking.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                              >
                                <Eye size={16} className="text-cyan-500" />
                                Xem chi tiết
                              </button>
                              
                              {booking.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100 disabled:opacity-50"
                                >
                                  <CheckCircle size={16} className="text-green-500" />
                                  Xác nhận booking
                                </button>
                              )}
                              
                              {booking.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100 disabled:opacity-50"
                                >
                                  <CheckCircle size={16} className="text-blue-500" />
                                  Hoàn thành booking
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={actionLoading}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                                Xóa booking
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
            className="px-5 py-2 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition-colors font-medium disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  page === pageNum
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'border-2 border-gray-200 hover:border-cyan-500 hover:text-cyan-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-5 py-2 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:text-cyan-600 transition-colors font-medium disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

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
                      <p className="font-semibold text-gray-900">{selectedBooking.guide}</p>
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
                    <p className="text-sm text-gray-500 mb-1">Thanh toán</p>
                    <div className="mt-1">{getPaymentBadge(selectedBooking.payment)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-purple-50 rounded-xl p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-purple-500" />
                  Thông tin thanh toán
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phương thức</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-2xl text-purple-600">{formatCurrency(selectedBooking.amount)}</p>
                  </div>
                  {selectedBooking.paymentTransactionId && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Mã giao dịch</p>
                        <p className="font-semibold text-gray-900">{selectedBooking.paymentTransactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ngày thanh toán</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedBooking.paymentDate)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-amber-50 rounded-xl p-5 border-l-4 border-amber-500">
                  <h3 className="font-bold text-lg mb-2 text-amber-700">Yêu cầu đặc biệt</h3>
                  <p className="text-gray-700">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Cancel Reason */}
              {selectedBooking.status === 'Cancelled' && selectedBooking.cancelReason && (
                <div className="bg-red-50 rounded-xl p-5 border-l-4 border-red-500">
                  <h3 className="font-bold text-lg mb-2 text-red-700">Lý do hủy</h3>
                  <p className="text-gray-700">{selectedBooking.cancelReason}</p>
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
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  In / Tải PDF
                </button>
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-3">Thao tác quản lý</h3>
                <div className="flex gap-3 flex-wrap">
                  {selectedBooking.status === 'Pending' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, 'Confirmed');
                        setShowDetailModal(false);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Xác nhận booking
                    </button>
                  )}
                  {selectedBooking.status === 'Confirmed' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, 'Completed');
                        setShowDetailModal(false);
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Hoàn thành
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa booking này?')) {
                        handleDeleteBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    Xóa booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement