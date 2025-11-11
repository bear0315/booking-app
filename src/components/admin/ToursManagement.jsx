import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Eye,
  MoreVertical,
  X,
  Image as ImageIcon,
  Calendar,
  Mountain,
  Award,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  Loader
} from 'lucide-react';

// Tour Service
const tourService = {
  getAllTours: async (pageNumber = 1, pageSize = 100) => {
    return await apiRequest(`/Tours?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },
  
  getTourById: async (id) => {
    return await apiRequest(`/Tours/${id}`);
  },
  
  createTour: async (tourData) => {
    return await apiRequest('/Tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  },
  
  updateTour: async (id, tourData) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...tourData, id }),
    });
  },
  
  deleteTour: async (id) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleFeatured: async (id) => {
    return await apiRequest(`/Tours/${id}/toggle-featured`, {
      method: 'PATCH',
    });
  },
  
  updateStatus: async (id, status) => {
    return await apiRequest(`/Tours/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

const ToursManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedTour, setSelectedTour] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    location: '',
    country: '',
    price: 0,
    discountPrice: 0,
    duration: '',
    maxGroupSize: 1,
    difficulty: 'Easy',
    category: 'Adventure',
    status: 'Active',
    isFeatured: false,
    imageUrl: '',
    startDates: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'Admin' && user?.role !== 'Manager' && user?.role !== 'Staff') {
      navigate('/');
      return;
    }

    fetchTours();
  }, [isAuthenticated, user]);

  const fetchTours = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tourService.getAllTours(1, 100);
      
      console.log('Tours API Response:', response);
      
      // Backend returns PagedResult<TourListResponse>
      // Structure: { items, totalCount, pageNumber, pageSize, totalPages }
      const tourData = response.items || response.Items || 
                       response.data?.items || response.Data?.Items ||
                       response.data || response.Data || 
                       [];
      
      // Map API response to component structure
      const mappedTours = tourData.map(tour => ({
        id: tour.id || tour.Id,
        name: tour.name || tour.Name || 'N/A',
        slug: tour.slug || tour.Slug || '',
        location: tour.location || tour.Location || 'N/A',
        country: tour.country || tour.Country || 'N/A',
        price: tour.price || tour.Price || 0,
        discountPrice: tour.discountPrice || tour.DiscountPrice,
        duration: tour.duration || tour.Duration || 'N/A',
        durationDays: tour.durationDays || tour.DurationDays || 0,
        status: tour.status || tour.Status || 'Active',
        bookings: tour.totalBookings || tour.TotalBookings || 0,
        rating: tour.averageRating || tour.AverageRating || 0,
        reviews: tour.totalReviews || tour.TotalReviews || 0,
        maxGuests: tour.maxGroupSize || tour.MaxGroupSize || tour.maxGuests || tour.MaxGuests || 0,
        difficulty: tour.difficulty || tour.Difficulty || 'Easy',
        image: tour.primaryImageUrl || tour.PrimaryImageUrl || 
               tour.imageUrl || tour.ImageUrl || 
               tour.coverImage || tour.CoverImage || 
               'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
        description: tour.description || tour.Description || '',
        longDescription: tour.longDescription || tour.LongDescription || '',
        featured: tour.isFeatured || tour.IsFeatured || false,
        category: tour.category || tour.Category || 'Adventure',
        startDates: tour.startDates || tour.StartDates || [],
      }));
      
      setTours(mappedTours);
      console.log('Mapped tours:', mappedTours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setError(error.message || 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: tours.length,
    active: tours.filter(t => t.status === 'Active').length,
    inactive: tours.filter(t => t.status === 'Inactive' || t.status === 'Draft').length,
    totalBookings: tours.reduce((sum, t) => sum + (t.bookings || 0), 0),
    avgRating: tours.length > 0 ? (tours.reduce((sum, t) => sum + (t.rating || 0), 0) / tours.length).toFixed(1) : '0.0'
  };

  // Filter tours
  const filteredTours = tours.filter(tour => {
    const matchesSearch = 
      (tour.name && tour.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tour.location && tour.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tour.country && tour.country.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || tour.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      'Easy': { bg: 'bg-green-100', text: 'text-green-700', label: 'Dễ' },
      'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Trung bình' },
      'Hard': { bg: 'bg-red-100', text: 'text-red-700', label: 'Thử thách' },
      'Expert': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Chuyên nghiệp' }
    };
    
    const config = difficultyConfig[difficulty] || difficultyConfig['Easy'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Mountain size={12} />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Hoạt động' },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: 'Tạm dừng' },
      'Draft': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Nháp' }
    };
    
    const config = statusConfig[status] || statusConfig['Draft'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const handleViewDetails = async (tour) => {
    try {
      setActionLoading(true);
      const response = await tourService.getTourById(tour.id);
      if (response) {
        const fullTour = response.data || response.Data || response;
        setSelectedTour({
          ...tour,
          ...fullTour
        });
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching tour details:', error);
      setSelectedTour(tour);
      setShowDetailModal(true);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleEditTour = async (tour) => {
    try {
      setActionLoading(true);
      const response = await tourService.getTourById(tour.id);
      const fullTour = response?.data || response?.Data || response || tour;
      
      setFormData({
        name: fullTour.name || '',
        slug: fullTour.slug || '',
        description: fullTour.description || '',
        longDescription: fullTour.longDescription || '',
        location: fullTour.location || '',
        country: fullTour.country || '',
        price: fullTour.price || 0,
        discountPrice: fullTour.discountPrice || 0,
        duration: fullTour.duration || '',
        maxGroupSize: fullTour.maxGroupSize || fullTour.maxGuests || 1,
        difficulty: fullTour.difficulty || 'Easy',
        category: fullTour.category || 'Adventure',
        status: fullTour.status || 'Active',
        isFeatured: fullTour.isFeatured || fullTour.featured || false,
        imageUrl: fullTour.imageUrl || fullTour.image || '',
        startDates: fullTour.startDates || [],
      });
      
      setSelectedTour(fullTour);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading tour for edit:', error);
      alert('Không thể tải thông tin tour: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
      return;
    }

    setActionLoading(true);
    try {
      await tourService.deleteTour(tourId);
      setTours(tours.filter(t => t.id !== tourId));
      alert('Xóa tour thành công!');
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Không thể xóa tour: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleToggleStatus = async (tourId) => {
    const tour = tours.find(t => t.id === tourId);
    const newStatus = tour.status === 'Active' ? 'Inactive' : 'Active';
    
    setActionLoading(true);
    try {
      // Backend expects raw TourStatus enum string as body
      await tourService.updateStatus(tourId, `"${newStatus}"`); // Send as JSON string
      
      setTours(tours.map(t => 
        t.id === tourId ? { ...t, status: newStatus } : t
      ));
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error toggling status:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message ||
                          error.message || 
                          'Không thể cập nhật trạng thái';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };
  const handleToggleFeatured = async (tourId) => {
    setActionLoading(true);
    try {
      await tourService.toggleFeatured(tourId);
      setTours(tours.map(t => 
        t.id === tourId ? { ...t, featured: !t.featured } : t
      ));
      alert('Cập nhật tour nổi bật thành công!');
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Không thể cập nhật tour nổi bật: ' + error.message);
    } finally {
      setActionLoading(false);
      setShowActionMenu(null);
    }
  };

  const handleSaveTour = async () => {
    setActionLoading(true);
    try {
      // Prepare tour data matching backend CreateTourRequest/UpdateTourRequest
      const tourData = {
        name: formData.name,
        slug: formData.slug || formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        description: formData.description,
        longDescription: formData.longDescription,
        location: formData.location,
        country: formData.country,
        price: parseFloat(formData.price) || 0,
        discountPrice: parseFloat(formData.discountPrice) || 0,
        duration: formData.duration,
        durationDays: parseInt(formData.duration.split(' ')[0]) || 1, // Extract days from "5 ngày 4 đêm"
        maxGroupSize: parseInt(formData.maxGroupSize) || 1,
        difficulty: formData.difficulty,
        category: formData.category,
        status: formData.status,
        isFeatured: formData.isFeatured,
        primaryImageUrl: formData.imageUrl,
        // Add other required fields if needed
        destinationId: 1, // You may need to add destination selector
        type: 'Group', // Default tour type
      };
  
      if (showEditModal && selectedTour) {
        // Update existing tour
        tourData.id = selectedTour.id;
        await tourService.updateTour(selectedTour.id, tourData);
        alert('Cập nhật tour thành công!');
      } else {
        // Create new tour
        await tourService.createTour(tourData);
        alert('Thêm tour mới thành công!');
      }
      
      // Refresh tour list
      await fetchTours();
      
      // Close modal and reset form
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedTour(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        longDescription: '',
        location: '',
        country: '',
        price: 0,
        discountPrice: 0,
        duration: '',
        maxGroupSize: 1,
        difficulty: 'Easy',
        category: 'Adventure',
        status: 'Active',
        isFeatured: false,
        imageUrl: '',
        startDates: [],
      });
    } catch (error) {
      console.error('Error saving tour:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message ||
                          error.message || 
                          'Không thể lưu tour';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleExport = () => {
    const headers = ['ID', 'Tên Tour', 'Địa điểm', 'Giá', 'Thời lượng', 'Số khách', 'Độ khó', 'Trạng thái', 'Đánh giá', 'Bookings'];
    const data = filteredTours.map(t => [
      t.id,
      t.name,
      t.location,
      t.price,
      t.duration,
      t.maxGuests,
      t.difficulty,
      t.status,
      t.rating,
      t.bookings
    ]);
    
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tours_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && tours.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tours</h1>
            <p className="text-gray-600 mt-1">Quản lý và cập nhật tất cả các tour du lịch</p>
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
              onClick={fetchTours}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button 
              onClick={() => {
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  longDescription: '',
                  location: '',
                  country: '',
                  price: 0,
                  discountPrice: 0,
                  duration: '',
                  maxGroupSize: 1,
                  difficulty: 'Easy',
                  category: 'Adventure',
                  status: 'Active',
                  isFeatured: false,
                  imageUrl: '',
                  startDates: [],
                });
                setShowAddModal(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Thêm Tour Mới
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
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin size={24} />
                <span className="font-semibold">Tổng tours</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Tours hiện có</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={24} />
                <span className="font-semibold">Hoạt động</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-sm text-gray-500 mt-1">Tours đang bán</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <AlertCircle size={24} />
                <span className="font-semibold">Tạm dừng</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
            <p className="text-sm text-gray-500 mt-1">Tours dừng bán</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-yellow-600">
                <Users size={24} />
                <span className="font-semibold">Tổng booking</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            <p className="text-sm text-gray-500 mt-1">Lượt đặt tour</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Star size={24} />
                <span className="font-semibold">Đánh giá TB</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
            <p className="text-sm text-gray-500 mt-1">Trên 5 sao</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tour, địa điểm..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Tạm dừng</option>
              <option value="Draft">Nháp</option>
            </select>
            
            <select 
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-medium"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">Tất cả độ khó</option>
              <option value="Easy">Dễ</option>
              <option value="Medium">Trung bình</option>
              <option value="Hard">Thử thách</option>
              <option value="Expert">Chuyên nghiệp</option>
            </select>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader className="animate-spin text-orange-500" size={48} />
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy tour nào</h3>
              <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm của bạn</p>
              <button 
                onClick={() => {
                  setStatusFilter('all');
                  setDifficultyFilter('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            filteredTours.map(tour => (
              <div key={tour.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={tour.image} 
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Featured Badge */}
                  {tour.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <TrendingUp size={12} />
                      NỔI BẬT
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(tour.status)}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    {formatCurrency(tour.price)}
                  </div>

                  {/* Difficulty */}
                  <div className="absolute bottom-3 right-3">
                    {getDifficultyBadge(tour.difficulty)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <MapPin size={14} className="text-orange-500" />
                    <span className="font-medium">{tour.location}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {tour.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {tour.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star size={14} className="fill-current" />
                        <span className="font-bold text-sm text-gray-900">{tour.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{tour.reviews} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                        <Users size={14} />
                        <span className="font-bold text-sm text-gray-900">{tour.bookings}</span>
                      </div>
                      <p className="text-xs text-gray-500">Đã đặt</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                        <Clock size={14} />
                        <span className="font-bold text-sm text-gray-900">{tour.duration.split(' ')[0]}</span>
                      </div>
                      <p className="text-xs text-gray-500">Ngày</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(tour)}
                      disabled={actionLoading}
                      className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Eye size={16} />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleEditTour(tour)}
                      disabled={actionLoading}
                      className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Edit size={16} />
                      Sửa
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === tour.id ? null : tour.id)}
                        disabled={actionLoading}
                        className="p-2.5 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-all disabled:opacity-50"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showActionMenu === tour.id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                          <button
                            onClick={() => handleToggleStatus(tour.id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                          >
                            {tour.status === 'Active' ? (
                              <>
                                <AlertCircle size={16} className="text-gray-500" />
                                Tạm dừng tour
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} className="text-green-500" />
                                Kích hoạt tour
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleToggleFeatured(tour.id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 border-b border-gray-100"
                          >
                            <Award size={16} className="text-purple-500" />
                            {tour.featured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTour(tour.id)}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600"
                          >
                            <Trash2 size={16} />
                            Xóa tour
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Chi Tiết Tour</h2>
                  <p className="text-orange-100">ID: {selectedTour.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="relative h-80 rounded-xl overflow-hidden">
                <img 
                  src={selectedTour.image} 
                  alt={selectedTour.name}
                  className="w-full h-full object-cover"
                />
                {selectedTour.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <TrendingUp size={16} />
                    TOUR NỔI BẬT
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="bg-orange-50 rounded-xl p-5">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedTour.name}</h3>
                <p className="text-gray-700 mb-4">{selectedTour.description}</p>
                {selectedTour.longDescription && (
                  <p className="text-gray-600 mb-4">{selectedTour.longDescription}</p>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <MapPin size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-semibold text-gray-900">{selectedTour.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <DollarSign size={20} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giá tour</p>
                      <p className="font-bold text-2xl text-green-600">{formatCurrency(selectedTour.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <Clock size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời lượng</p>
                      <p className="font-semibold text-gray-900">{selectedTour.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <Users size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số khách tối đa</p>
                      <p className="font-semibold text-gray-900">{selectedTour.maxGuests} người</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Star size={24} className="text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-700">Đánh giá</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{selectedTour.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">{selectedTour.reviews} đánh giá</p>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={24} className="text-blue-500" />
                    <span className="font-semibold text-gray-700">Booking</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{selectedTour.bookings}</p>
                  <p className="text-sm text-gray-500">Lượt đặt tour</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={24} className="text-green-500" />
                    <span className="font-semibold text-gray-700">Doanh thu</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(selectedTour.price * selectedTour.bookings)}</p>
                  <p className="text-sm text-gray-500">Tổng thu nhập</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Mountain size={18} className="text-gray-600" />
                    Độ khó
                  </h4>
                  {getDifficultyBadge(selectedTour.difficulty)}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-gray-600" />
                    Trạng thái
                  </h4>
                  {getStatusBadge(selectedTour.status)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditTour(selectedTour);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Edit size={18} />
                  Chỉnh sửa tour
                </button>
                <button 
                  onClick={() => handleToggleStatus(selectedTour.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {selectedTour.status === 'Active' ? (
                    <>
                      <AlertCircle size={18} />
                      Tạm dừng
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Kích hoạt
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    handleDeleteTour(selectedTour.id);
                    setShowDetailModal(false);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Xóa tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {showAddModal ? 'Thêm Tour Mới' : 'Chỉnh Sửa Tour'}
                  </h2>
                  <p className="text-orange-100">
                    {showAddModal ? 'Điền thông tin tour mới' : `ID: ${selectedTour?.id}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedTour(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Tour Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên tour *
                </label>
                <input
                  type="text"
                  placeholder="VD: Hành Trình Dưới Chân Matterhorn"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Location & Country */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa điểm *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Zermatt"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quốc gia *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thụy Sĩ"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả ngắn *
                </label>
                <textarea
                  placeholder="Mô tả ngắn gọn về tour..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  placeholder="Mô tả chi tiết về tour..."
                  value={formData.longDescription}
                  onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    placeholder="5000000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời lượng *
                  </label>
                  <input
                    type="text"
                    placeholder="5 ngày 4 đêm"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Max Guests & Difficulty */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số khách tối đa *
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({...formData, maxGroupSize: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Độ khó *
                  </label>
                  <select 
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Easy">Dễ</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Thử thách</option>
                    <option value="Expert">Chuyên nghiệp</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                >
                  <option value="Adventure">Phiêu lưu</option>
                  <option value="Cultural">Văn hóa</option>
                  <option value="Wildlife">Động vật hoang dã</option>
                  <option value="Hiking">Leo núi</option>
                  <option value="Beach">Biển</option>
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL hình ảnh *
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Status & Featured */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái *
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Tạm dừng</option>
                    <option value="Draft">Nháp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tour nổi bật
                  </label>
                  <div className="flex items-center gap-3 h-12">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="w-5 h-5 accent-orange-500 rounded"
                    />
                    <span className="text-gray-700">Đặt làm tour nổi bật</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedTour(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveTour}
                  disabled={actionLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Đang lưu...
                    </>
                  ) : (
                    showAddModal ? 'Thêm tour' : 'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursManagement;