import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const MyTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: '',
    fromDate: '',
    toDate: '',
    status: ''
  });
  const pageSize = 10;
  const navigate = useNavigate();

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
      
      const guideId = user?.id || user?.Id || user?.userId || user?.UserId;
      
      if (!guideId) {
        throw new Error('Không tìm thấy ID của Guide');
      }

      const userRole = user?.role || user?.Role;
      if (userRole !== 'Guide') {
        setError('Bạn không có quyền truy cập trang này');
        return;
      }

      console.log('Loading tours for guide ID:', guideId);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại');
      }

      // Fetch bookings for this guide
      const response = await fetch(`https://localhost:7195/api/bookings/guide/${guideId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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

      // Group bookings by tour to get unique tours
      const tourMap = new Map();
      bookingData.forEach(booking => {
        const tourId = booking.tourId || booking.TourId;
        const tourName = booking.tourName || booking.TourName;
        
        if (!tourMap.has(tourId)) {
          tourMap.set(tourId, {
            tourId: tourId,
            tourName: tourName,
            bookings: [],
            totalBookings: 0,
            totalGuests: 0,
            totalRevenue: 0,
            upcomingBookings: 0,
            completedBookings: 0,
            nextTourDate: null,
            lastTourDate: null
          });
        }

        const tour = tourMap.get(tourId);
        tour.bookings.push(booking);
        tour.totalBookings++;
        tour.totalGuests += (booking.numberOfPeople || booking.NumberOfPeople || 0);
        tour.totalRevenue += (booking.totalAmount || booking.TotalAmount || 0);

        const bookingStatus = booking.status || booking.Status;
        if (bookingStatus === 'Confirmed') {
          tour.upcomingBookings++;
        } else if (bookingStatus === 'Completed') {
          tour.completedBookings++;
        }

        const tourDate = new Date(booking.tourDate || booking.TourDate);
        if (!tour.nextTourDate || tourDate < tour.nextTourDate) {
          if (tourDate > new Date()) {
            tour.nextTourDate = tourDate;
          }
        }
        if (!tour.lastTourDate || tourDate > tour.lastTourDate) {
          tour.lastTourDate = tourDate;
        }
      });

      let toursData = Array.from(tourMap.values());

      // Apply filters
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        toursData = toursData.filter(tour => 
          tour.tourName.toLowerCase().includes(term)
        );
      }

      if (filters.fromDate) {
        toursData = toursData.filter(tour => 
          tour.nextTourDate && tour.nextTourDate >= new Date(filters.fromDate)
        );
      }

      if (filters.toDate) {
        toursData = toursData.filter(tour => 
          tour.nextTourDate && tour.nextTourDate <= new Date(filters.toDate)
        );
      }

      if (filters.status === 'upcoming') {
        toursData = toursData.filter(tour => tour.upcomingBookings > 0);
      } else if (filters.status === 'completed') {
        toursData = toursData.filter(tour => tour.completedBookings > 0);
      }

      // Sort by next tour date
      toursData.sort((a, b) => {
        if (!a.nextTourDate) return 1;
        if (!b.nextTourDate) return -1;
        return a.nextTourDate - b.nextTourDate;
      });

      // Calculate pagination
      setTotalItems(toursData.length);
      setTotalPages(Math.ceil(toursData.length / pageSize));
      
      // Get current page data
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = toursData.slice(startIndex, endIndex);

      console.log('Loaded tours:', paginatedData);
      setTours(paginatedData);
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
      searchTerm: '',
      fromDate: '',
      toDate: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa có';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && tours.length === 0) {
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
          Tổng quan các tour mà bạn được phân công hướng dẫn
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
              placeholder="Tìm kiếm tour..."
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
            <option value="upcoming">Sắp diễn ra</option>
            <option value="completed">Đã hoàn thành</option>
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
      {tours.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có tour nào
          </h3>
          <p className="text-gray-600">
            {filters.searchTerm || filters.fromDate || filters.toDate || filters.status
              ? 'Không tìm thấy kết quả phù hợp với bộ lọc'
              : 'Bạn chưa được phân công tour nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tours.map((tour) => (
            <div
              key={tour.tourId}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Tour Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tour.tourName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.upcomingBookings > 0 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {tour.upcomingBookings} booking sắp tới
                        </span>
                      )}
                      {tour.completedBookings > 0 && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {tour.completedBookings} hoàn thành
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tour Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Tour tiếp theo</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(tour.nextTourDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Tổng khách</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tour.totalGuests} người
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Tổng booking</p>
                      <p className="text-sm font-medium text-gray-900">
                        {tour.totalBookings} booking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Tổng doanh thu</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(tour.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => navigate('/guide', { state: { tourId: tour.tourId } })}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết bookings
                </button>
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