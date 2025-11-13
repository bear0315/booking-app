import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  User,
  Menu,
  X,
  Phone,
  Mail,
  RefreshCw,
  Lock,
  Briefcase
} from 'lucide-react';

// Import các component con
import Profile from './Profile';
import MyTours from './MyTours';
import ChangePassword from './ChangePassword';

// Component hiển thị danh sách bookings
const BookingsContent = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const guideId = user?.id || user?.Id || user?.userId || user?.UserId;
      
      if (!guideId) {
        throw new Error('Không tìm thấy ID của Guide');
      }

      const response = await fetch(`https://localhost:7195/api/bookings/guide/${guideId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

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
      }

      setBookings(bookingData);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Không thể tải danh sách booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xác nhận' },
      'Confirmed': { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Đã xác nhận' },
      'Cancelled': { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
      'Completed': { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Hoàn thành' },
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    const tourName = booking.tourName || booking.TourName || 'Unknown Tour';
    if (!acc[tourName]) {
      acc[tourName] = [];
    }
    acc[tourName].push(booking);
    return acc;
  }, {});

  if (isLoading) {
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
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Chưa có booking nào
        </h3>
        <p className="text-gray-600">
          Hiện tại chưa có booking nào được gán cho bạn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng booking</p>
              <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Số tour</p>
              <p className="text-2xl font-bold text-gray-800">
                {Object.keys(groupedBookings).length}
              </p>
            </div>
            <MapPin className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng khách</p>
              <p className="text-2xl font-bold text-gray-800">
                {bookings.reduce((sum, b) => sum + (b.numberOfPeople || b.NumberOfPeople || 0), 0)}
              </p>
            </div>
            <Users className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Bookings by Tour */}
      {Object.entries(groupedBookings).map(([tourName, tourBookings]) => (
        <div key={tourName} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 flex-wrap">
              <MapPin className="text-blue-600 flex-shrink-0" size={20} />
              <h2 className="text-base md:text-lg font-bold text-gray-800 flex-1 min-w-0">{tourName}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0">
                {tourBookings.length} booking
              </span>
            </div>
          </div>
          
          <div className="divide-y">
            {tourBookings.map((booking) => (
              <div key={booking.id || booking.Id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-gray-800 text-base md:text-lg">
                      {booking.bookingCode || booking.BookingCode}
                    </span>
                    {getStatusBadge(booking.status || booking.Status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{booking.customerName || booking.CustomerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{booking.customerPhone || booking.CustomerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{booking.customerEmail || booking.CustomerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{booking.numberOfPeople || booking.NumberOfPeople} người</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                      <span>Ngày tour: {formatDate(booking.tourDate || booking.TourDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(booking.totalAmount || booking.TotalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main GuideDashboard Component
const GuideDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/guide', label: 'Booking của tôi', icon: Calendar },
    { path: '/guide/my-tours', label: 'Tour của tôi', icon: Briefcase },
    { path: '/guide/profile', label: 'Thông tin cá nhân', icon: User },
    { path: '/guide/change-password', label: 'Đổi mật khẩu', icon: Lock },
  ];

  const isActive = (path) => {
    if (path === '/guide') {
      return location.pathname === '/guide';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-blue-600 to-purple-600 text-white
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dosyknq32/image/upload/v1761962915/VanVivu_lifxyr.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-lg object-contain bg-white"
            />
            <span className="font-bold text-lg">Guide Portal</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${active 
                      ? 'bg-white text-blue-600 font-medium' 
                      : 'hover:bg-blue-500 text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-500 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.name || user?.Name || user?.fullName || user?.FullName || 'Guide User'}
              </p>
              <p className="text-xs text-blue-200 truncate">
                {user?.email || user?.Email || 'guide@vanvivu.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition flex items-center justify-center gap-2 font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-30 flex-shrink-0">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
        </header>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route index element={<BookingsContent />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-tours" element={<MyTours />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="*" element={<Navigate to="/guide" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default GuideDashboard;