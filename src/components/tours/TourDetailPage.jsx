import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Mountain,
  Compass,
  Heart,
  Share2,
  ChevronRight,
  ArrowLeft,
  Phone,
  Mail,
  Award,
  Shield,
  DollarSign,
  Loader
} from 'lucide-react';

const TourDetailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get tour ID from query params or location state
  const tourId = searchParams.get('id') || location.state?.tourData?.id;
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [activeTab, setActiveTab] = useState('overview');
  const [liked, setLiked] = useState(false);

  // Fetch tour details
  useEffect(() => {
    if (tourId) {
      fetchTourDetails();
    } else {
      setError('Tour ID không hợp lệ');
      setLoading(false);
    }
  }, [tourId]);

  // Check if tour is in favorites
  useEffect(() => {
    if (isAuthenticated && tourId) {
      checkFavorite();
    }
  }, [isAuthenticated, tourId]);

  const fetchTourDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching tour details for ID:', tourId);
      const response = await tourService.getTourById(tourId);
      console.log('Tour details response:', response);
      
      // Handle different response structures
      let tourData = response;
      if (response?.data) {
        tourData = response.data;
      } else if (response?.Data) {
        tourData = response.Data;
      }
      
      setTour(tourData);
    } catch (err) {
      console.error('Error fetching tour details:', err);
      setError('Không thể tải thông tin tour. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoriteService.checkFavorite(tourId);
      if (response?.isFavorite !== undefined) {
        setLiked(response.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await favoriteService.toggleFavorite(tourId);
      if (response?.isFavorite !== undefined) {
        setLiked(response.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }
    
    if (!tour) return;
    
    // Normalize tour data
    const tourIdValue = tour.id || tour.Id;
    const tourName = tour.name || tour.Name || tour.title || '';
    const tourImage = tour.primaryImageUrl || tour.PrimaryImageUrl || tour.imageUrl || tour.image || '';
    const tourPrice = tour.price || tour.Price || 0;
    const tourLocation = tour.location || tour.Location || tour.destinationName || tour.DestinationName || '';
    const tourDuration = tour.duration || tour.Duration || '';
    
    navigate('/checkout', {
      state: {
        tourData: {
          id: tourIdValue,
          title: tourName,
          name: tourName,
          image: tourImage,
          price: tourPrice,
          location: tourLocation,
          duration: tourDuration,
          date: selectedDate,
          guests: numberOfGuests
        }
      }
    });
  };

  // Normalize tour data helper
  const getTourField = (field, defaultValue = '') => {
    if (!tour) return defaultValue;
    const pascalField = field.charAt(0).toUpperCase() + field.slice(1);
    return tour[field] || tour[pascalField] || defaultValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-cyan-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Tour không tồn tại'}</p>
          <button
            onClick={() => navigate('/tours')}
            className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
          >
            Quay lại danh sách tour
          </button>
        </div>
      </div>
    );
  }

  // Normalize tour data
  const tourName = getTourField('name', getTourField('title', 'Tour'));
  const tourImage = getTourField('primaryImageUrl', getTourField('imageUrl', getTourField('image', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80')));
  const tourLocation = getTourField('location', getTourField('destinationName', 'N/A'));
  const tourPrice = getTourField('price', 0);
  const tourDuration = getTourField('duration', `${getTourField('durationDays', 0)} ngày`);
  const tourRating = getTourField('averageRating', getTourField('rating', 0));
  const tourReviews = getTourField('totalReviews', getTourField('reviews', 0));
  const tourDifficulty = getTourField('difficulty', '');
  const tourCategory = getTourField('category', getTourField('type', ''));
  const tourDescription = getTourField('description', '');
  const tourMaxGuests = getTourField('maxGuests', 0);
  
  // Get images array
  const tourImages = tour.images || tour.Images || tour.gallery || tour.Gallery || [];
  if (tourImage && !tourImages.includes(tourImage)) {
    tourImages.unshift(tourImage);
  }
  
  // Get itinerary
  const tourItinerary = tour.itineraries || tour.Itineraries || tour.itinerary || [];
  
  // Get includes/excludes
  const tourIncludes = tour.includes || tour.Includes || [];
  const tourExcludes = tour.excludes || tour.Excludes || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[500px]">
        <img 
          src={tourImage} 
          alt={tourName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Actions */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-full backdrop-blur-md transition-all ${
              liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart size={20} className={liked ? 'fill-current' : ''} />
          </button>
          <button className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-700 hover:bg-white transition-all">
            <Share2 size={20} />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              {tourCategory && (
                <span className="px-3 py-1 bg-cyan-500 text-white rounded-full text-sm font-semibold">
                  {tourCategory}
                </span>
              )}
              {tourDifficulty && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  tourDifficulty === 'Easy' || tourDifficulty === 'Dễ' ? 'bg-green-500 text-white' :
                  tourDifficulty === 'Medium' || tourDifficulty === 'Trung bình' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {tourDifficulty}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{tourName}</h1>
            {tourDescription && (
              <p className="text-xl text-white/90 line-clamp-2">{tourDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl">
                <Clock className="text-cyan-600 mb-2" size={24} />
                <p className="text-sm text-gray-600">Thời lượng</p>
                <p className="font-bold text-gray-900">{tourDuration}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                <Users className="text-blue-600 mb-2" size={24} />
                <p className="text-sm text-gray-600">Nhóm</p>
                <p className="font-bold text-gray-900">Tối đa {tourMaxGuests} người</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                <MapPin className="text-purple-600 mb-2" size={24} />
                <p className="text-sm text-gray-600">Địa điểm</p>
                <p className="font-bold text-gray-900">{tourLocation}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                <Star className="text-yellow-600 mb-2" size={24} />
                <p className="text-sm text-gray-600">Đánh giá</p>
                <p className="font-bold text-gray-900">{tourRating.toFixed(1)} ({tourReviews})</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8">
                {['overview', 'itinerary', 'included'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-semibold transition-colors relative ${
                      activeTab === tab 
                        ? 'text-cyan-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' && 'Tổng quan'}
                    {tab === 'itinerary' && 'Lịch trình'}
                    {tab === 'included' && 'Bao gồm'}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-600 rounded-t" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Giới thiệu</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{tourDescription || 'Chưa có mô tả'}</p>
                
                {/* Gallery */}
                {tourImages.length > 0 && (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Thư viện ảnh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {tourImages.slice(0, 8).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                          <img 
                            src={img || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'} 
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Lịch trình chi tiết</h3>
                {tourItinerary.length > 0 ? (
                  <div className="space-y-6">
                    {tourItinerary.map((day, idx) => {
                      const dayNumber = day.day || day.Day || day.dayNumber || day.DayNumber || idx + 1;
                      const dayTitle = day.title || day.Title || day.name || day.Name || `Ngày ${dayNumber}`;
                      const dayDescription = day.description || day.Description || day.content || day.Content || '';
                      
                      return (
                        <div key={idx} className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {dayNumber}
                            </div>
                          </div>
                          <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{dayTitle}</h4>
                            <p className="text-gray-700 leading-relaxed">{dayDescription}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có lịch trình chi tiết</p>
                )}
              </div>
            )}

            {activeTab === 'included' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Bao gồm</h3>
                  {tourIncludes.length > 0 ? (
                    <div className="space-y-3">
                      {tourIncludes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                          <span className="text-gray-700">{typeof item === 'string' ? item : item.name || item.Name || ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có thông tin</p>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Không bao gồm</h3>
                  {tourExcludes.length > 0 ? (
                    <div className="space-y-3">
                      {tourExcludes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <XCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                          <span className="text-gray-700">{typeof item === 'string' ? item : item.name || item.Name || ''}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có thông tin</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-cyan-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(tourPrice)}
                    </span>
                    <span className="text-gray-500">/người</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-sm text-yellow-600">{tourRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-600">({tourReviews} đánh giá)</span>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày khởi hành
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng khách
                  </label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-lg">{numberOfGuests}</span>
                    <button 
                      onClick={() => setNumberOfGuests(Math.min(12, numberOfGuests + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(tourPrice)} x {numberOfGuests} khách
                    </span>
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(tourPrice * numberOfGuests)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí dịch vụ</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(Math.round(tourPrice * numberOfGuests * 0.1))}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                    <span>Tổng cộng</span>
                    <span className="text-cyan-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(Math.round(tourPrice * numberOfGuests * 1.1))}
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Đặt ngay</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Bạn sẽ không bị tính phí ngay lập tức
                </p>

                {/* Contact */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h4>
                  <div className="space-y-2 text-sm">
                    <a href="tel:+1234567890" className="flex items-center gap-2 text-gray-600 hover:text-cyan-600">
                      <Phone size={16} />
                      <span>+1 (234) 567-890</span>
                    </a>
                    <a href="mailto:support@tavelo.com" className="flex items-center gap-2 text-gray-600 hover:text-cyan-600">
                      <Mail size={16} />
                      <span>support@tavelo.com</span>
                    </a>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Shield className="text-green-500" size={16} />
                    <span>Bảo hiểm toàn diện</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Award className="text-cyan-500" size={16} />
                    <span>Hướng dẫn viên chuyên nghiệp</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DollarSign className="text-blue-500" size={16} />
                    <span>Giá tốt nhất</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="text-purple-500" size={16} />
                    <span>Hoàn tiền 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;