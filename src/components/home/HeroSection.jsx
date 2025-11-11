import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, ArrowDownUp } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    departDate: '',
    returnDate: '',
    guests: '2'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to tours page with search params
    const params = new URLSearchParams();
    if (formData.destination) params.append('destination', formData.destination);
    if (formData.departDate) params.append('departDate', formData.departDate);
    if (formData.returnDate) params.append('returnDate', formData.returnDate);
    if (formData.guests) params.append('guests', formData.guests);
    
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/70" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Khám Phá Thế Giới Cùng Nhau
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Tìm kiếm tour du lịch tuyệt vời cho chuyến hành trình của bạn
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
          {/* Search Form */}
          <div className="p-8 md:p-10 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-white">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Điểm đến
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={22} />
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all appearance-none font-medium text-gray-700 shadow-sm hover:border-cyan-300 cursor-pointer"
                    >
                      <option value="">Chọn điểm đến</option>
                      <option value="dalat">Đà Lạt</option>
                      <option value="sapa">Sa Pa</option>
                      <option value="halong">Hạ Long</option>
                      <option value="phuquoc">Phú Quốc</option>
                      <option value="danang">Đà Nẵng</option>
                      <option value="nhatrang">Nha Trang</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-2 pl-14">Tour trong nước</div>
                  </div>
                </div>

                {/* Journey Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Ngày khởi hành
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={22} />
                    <input
                      type="date"
                      value={formData.departDate}
                      onChange={(e) => setFormData({...formData, departDate: e.target.value})}
                      className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-medium text-gray-700 shadow-sm hover:border-cyan-300 cursor-pointer"
                    />
                    <div className="text-xs text-gray-500 mt-2 pl-14">Chọn ngày đi</div>
                  </div>
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Ngày kết thúc
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={22} />
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                      className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-medium text-gray-700 shadow-sm hover:border-cyan-300 cursor-pointer"
                    />
                    <div className="text-xs text-gray-500 mt-2 pl-14">Chọn ngày về</div>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Số khách
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500" size={22} />
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: e.target.value})}
                      className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all appearance-none font-medium text-gray-700 shadow-sm hover:border-cyan-300 cursor-pointer"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} người</option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-2 pl-14">Người lớn</div>
                  </div>
                </div>
              </div>

              {/* Search Button - Separate Row */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 hover:-translate-y-1"
                >
                  <Search size={24} />
                  <span>Tìm kiếm ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Stats or Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-white/80">Tour du lịch</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-white/80">Điểm đến</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-white/80">Khách hàng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">4.9★</div>
            <div className="text-white/80">Đánh giá</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;