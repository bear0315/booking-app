import React, { useState, useEffect } from 'react';
import { destinationService } from '../../services/destinationService';
import { MapPin, Star, DollarSign, Compass, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const DestinationsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      // Get featured destinations first, then fallback to popular
      let response = await destinationService.getFeaturedDestinations(6);
      if (!Array.isArray(response) || response.length === 0) {
        response = await destinationService.getPopularDestinations(6);
      }
      if (!Array.isArray(response) || response.length === 0) {
        response = await destinationService.getActiveDestinations();
      }
      
      if (Array.isArray(response)) {
        setDestinations(response.slice(0, 6)); // Limit to 6
      } else if (response.data && Array.isArray(response.data)) {
        setDestinations(response.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };


  const itemsPerView = 4;
  const maxIndex = Math.max(0, destinations.length - itemsPerView);
  
  // Update maxIndex when destinations change
  useEffect(() => {
    if (destinations.length > 0) {
      const newMaxIndex = Math.max(0, destinations.length - itemsPerView);
      if (currentIndex > newMaxIndex) {
        setCurrentIndex(newMaxIndex);
      }
    }
  }, [destinations.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const visibleDestinations = destinations.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-2 rounded-full mb-4">
            <Compass size={18} />
            <span className="font-semibold text-sm uppercase tracking-wide">ĐIỂM ĐẾN</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Điểm Đến Phổ Biến Nhất
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-800 shadow-xl hover:shadow-2xl'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
              currentIndex >= maxIndex
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-800 shadow-xl hover:shadow-2xl'
            }`}
          >
            <ChevronRight size={24} />
          </button>

          {/* Destinations Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-cyan-500" size={48} />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Không có điểm đến nào</p>
            </div>
          ) : (
            <div className="overflow-hidden px-2">
              <div 
                className="flex gap-6 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView + 1.5)}%)` }}
              >
                {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="flex-shrink-0 w-[calc(25%-18px)] min-w-[280px]"
                >
                  <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    {/* Image with Arch Shape */}
                    <div className="relative h-80 overflow-hidden">
                      {/* Arch shape bottom */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          clipPath: 'ellipse(100% 100% at 50% 0%)'
                        }}
                      >
                        <img
                          src={destination.imageUrl || destination.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>

                      {/* Destination Name Badge */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                          <h3 className="text-xl font-bold text-gray-900 text-center">
                            {destination.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white px-6 py-6 -mt-4 relative z-20">
                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-yellow-600">{destination.averageRating?.toFixed(1) || destination.rating || '0'}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({(destination.totalReviews || destination.reviews || 0).toLocaleString('vi-VN')} Đánh giá)
                        </span>
                      </div>

                      {/* Price & Tours */}
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign size={18} className="text-cyan-500" />
                          <span>Từ <span className="font-bold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(destination.startingPrice || destination.startPrice || 0)}
                          </span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={18} className="text-cyan-500" />
                          <span className="font-bold">{destination.tourCount || destination.tours || 0}</span> Tour
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  currentIndex === idx
                    ? 'w-8 h-3 bg-cyan-500'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;