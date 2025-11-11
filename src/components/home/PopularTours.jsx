import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Star, Clock, Heart, ArrowRight, Loader } from 'lucide-react';

const PopularTours = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [likedTours, setLikedTours] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: 'Tất cả Tour' },
    { id: 'featured', label: 'Nổi bật' },
    { id: 'popular', label: 'Phổ biến' }
  ];

  useEffect(() => {
    fetchTours();
  }, [activeFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      let response;
      if (activeFilter === 'featured') {
        response = await tourService.getFeaturedTours(8);
      } else if (activeFilter === 'popular') {
        response = await tourService.getPopularTours(8);
      } else {
        // Get featured tours as default
        response = await tourService.getFeaturedTours(8);
      }
      
      if (Array.isArray(response)) {
        setTours(response);
      } else if (response.data && Array.isArray(response.data)) {
        setTours(response.data);
      } else {
        // Fallback: try to get all tours
        const allToursResponse = await tourService.getAllTours(1, 8);
        if (allToursResponse.data && Array.isArray(allToursResponse.data)) {
          setTours(allToursResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteService.getMyFavorites();
      if (Array.isArray(response)) {
        const favoriteIds = response.map(fav => fav.tourId);
        setLikedTours(favoriteIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleLike = async (tourId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await favoriteService.toggleFavorite(tourId);
      if (response.isFavorite) {
        setLikedTours(prev => [...prev, tourId]);
      } else {
        setLikedTours(prev => prev.filter(id => id !== tourId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredTours = tours;

  return (
    <section id="tours" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full mb-4">
            <MapPin size={18} />
            <span className="font-semibold text-sm uppercase tracking-wide">TOURS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tour Phổ Biến Nhất
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-cyan-500" size={48} />
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Không có tour nào</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTours.map((tour) => (
            <div 
              key={tour.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={tour.imageUrl || tour.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'} 
                  alt={tour.name || tour.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {tour.isFeatured && (
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      NỔI BẬT
                    </span>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(tour.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all transform hover:scale-110 ${
                    likedTours.includes(tour.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart 
                    size={18} 
                    className={likedTours.includes(tour.id) ? 'fill-current' : ''} 
                  />
                </button>

                {/* Category Badge */}
                {tour.category && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/95 backdrop-blur-sm text-cyan-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <MapPin size={14} />
                      {tour.category}
                  </span>
                </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <MapPin size={16} className="text-cyan-500" />
                  <span className="truncate">{tour.location || tour.destinationName || 'N/A'}</span>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => navigate(`/tour?id=${tour.id}`)}
                  className="text-lg font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2 cursor-pointer"
                >
                  {tour.name || tour.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-600">{tour.averageRating?.toFixed(1) || tour.rating || '0'}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    <span className="font-medium">({(tour.totalReviews || tour.reviews || 0).toLocaleString('vi-VN')} Đánh giá)</span>
                  </span>
                </div>

                {/* Duration & Places */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-cyan-500" />
                    <span>{tour.duration || `${tour.durationDays} ngày`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-cyan-500" />
                    <span>Tối đa {tour.maxGuests || tour.places || 'N/A'} người</span>
                  </div>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Từ </span>
                    <span className="text-2xl font-bold text-red-500">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(tour.price || 0)}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate(`/tour?id=${tour.id}`)}
                    className="flex items-center gap-2 text-cyan-600 font-semibold hover:gap-3 transition-all group"
                  >
                    <span>Xem thêm</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* View More Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/tours')}
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
          >
            <span>Xem tất cả tour</span>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularTours;