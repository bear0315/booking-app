import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';

const MyTours = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: '',
    fromDate: '',
    toDate: ''
  });
  const pageSize = 10;
  const navigate = useNavigate();

  // Get user from localStorage
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyTours();
    }
  }, [user, currentPage, filters]);

  const fetchMyTours = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get guide ID from user object
      const guideId = user?.id || user?.Id || user?.userId || user?.UserId;
      
      if (!guideId) {
        throw new Error('Không tìm thấy ID của Guide');
      }

      // Check if user is Guide
      const userRole = user?.role || user?.Role;
      if (userRole !== 'Guide') {
        setError('Bạn không có quyền truy cập trang này');
        return;
      }

      console.log('Loading tours for guide ID:', guideId);
      
      // Call API to get guide's bookings - adjust endpoint according to your backend
      const response = await fetch(`/api/bookings/guide/${guideId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      let bookingData = [];
      if (data.data) {
        bookingData = data.data;
      } else if (data.Data) {
        bookingData = data.Data;
      } else if (Array.isArray(data)) {
        bookingData = data;
      } else if (data.items) {
        bookingData = data.items;
      } else if (data.Items) {
        bookingData = data.Items;
      }

      // Apply filters
      let filteredData = bookingData;

      if (filters.status) {
        filteredData = filteredData.filter(b => 
          (b.status || b.Status) === filters.status
        );
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(b => 
          (b.tourName || b.TourName || '').toLowerCase().includes(term) ||
          (b.customerName || b.CustomerName || '').toLowerCase().includes(term) ||
          (b.bookingCode || b.BookingCode || '').toLowerCase().includes(term)
        );
      }

      if (filters.fromDate) {
        filteredData = filteredData.filter(b => 
          new Date(b.tourDate || b.TourDate) >= new Date(filters.fromDate)
        );
      }

      if (filters.toDate) {
        filteredData = filteredData.filter(b => 
          new Date(b.tourDate || b.TourDate) <= new Date(filters.toDate)
        );
      }

      // Calculate pagination
      setTotalItems(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      
      // Get current page data
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      console.log('Loaded tours:', paginatedData);
      setBookings(paginatedData);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.message || 'Không thể tải danh sách tour');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      searchTerm: '',
      fromDate: '',
      toDate: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' },
      'Confirmed': { color: 'bg-blue-100 text-blue-800', text: 'Đã xác nhận' },
      'Completed': { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' },
      'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tour của tôi</h2>
        <p className="mt-1 text-gray-600">
          Quản lý các tour được giao cho bạn
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </h3>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm tour, khách hàng..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>

          {/* From Date */}
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />

          {/* To Date */}
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Tìm thấy <span className="font-semibold">{totalItems}</span> tour
      </div>

      {/* Tours List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có tour nào
          </h3>
          <p className="text-gray-600">
            {filters.status || filters.searchTerm || filters.fromDate || filters.toDate
              ? 'Không tìm thấy kết quả phù hợp với bộ lọc'
              : 'Bạn chưa được giao tour nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id || booking.Id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.tourName || booking.TourName}
                      </h3>
                      {getStatusBadge(booking.status || booking.Status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Mã booking: <span className="font-mono">#{booking.bookingCode || booking.BookingCode}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date */}
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Ngày khởi hành</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(booking.tourDate || booking.TourDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(booking.tourDate || booking.TourDate)}
                      </p>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Số khách</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(booking.numberOfPeople || booking.NumberOfPeople || 
                          booking.numberOfGuests || booking.NumberOfGuests)} người
                      </p>
                      {(booking.numberOfAdults || booking.NumberOfAdults) && (
                        <p className="text-xs text-gray-500">
                          {booking.numberOfAdults || booking.NumberOfAdults} người lớn, {' '}
                          {booking.numberOfChildren || booking.NumberOfChildren || 0} trẻ em
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Khách hàng</p>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.customerName || booking.CustomerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.customerPhone || booking.CustomerPhone}
                      </p>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Tổng tiền</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(booking.totalAmount || booking.TotalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {(booking.specialRequests || booking.SpecialRequests) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Yêu cầu đặc biệt:</p>
                    <p className="text-sm text-gray-700">
                      {booking.specialRequests || booking.SpecialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Trước
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="text-gray-400">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Sau
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTours;