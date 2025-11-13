import React, { useState, useEffect } from 'react';
import { 
  User, 
  Star, 
  Languages, 
  Award,
  CheckCircle,
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import { guideService } from '../../services/guideService';

const GuideSelectorCheckout = ({ 
  guides: externalGuides = null, 
  selectedGuideId = null, 
  onSelectGuide = () => {},
  loading: externalLoading = false, 
  error: externalError = null 
}) => {
  const [internalGuides, setInternalGuides] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalError, setInternalError] = useState('');

  const guides = externalGuides || internalGuides;
  const loading = externalGuides !== null ? externalLoading : internalLoading;
  const error = externalGuides !== null ? externalError : internalError;

  useEffect(() => {
    if (externalGuides === null) {
      fetchGuides();
    } else {
      setInternalLoading(false);
    }
  }, [externalGuides]);

  const fetchGuides = async () => {
    try {
      setInternalLoading(true);
      setInternalError('');
      
      console.log('Fetching guides...');
      
      const guidesData = await guideService.getAllGuides();
      
      console.log('Guides data received:', guidesData);
      
      const guidesArray = Array.isArray(guidesData) ? guidesData : [];
      
      console.log('Setting guides array:', guidesArray);
      
      setInternalGuides(guidesArray);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setInternalError(err.message || 'Failed to load guides. Please try again.');
      setInternalGuides([]);
    } finally {
      setInternalLoading(false);
      console.log('Fetch guides completed');
    }
  };

  const handleSelectGuide = (guideId) => {
    if (selectedGuideId === guideId) {
      onSelectGuide(null);
    } else {
      onSelectGuide(guideId);
    }
  };

  const getGuideId = (guide) => {
    return guide.GuideId || guide.guideId || guide.Id || guide.id;
  };

  const filteredGuides = guides.filter(guide => {
    const name = (guide.FullName || guide.fullName || '').toLowerCase();
    const email = (guide.Email || guide.email || '').toLowerCase();
    const languages = (guide.Languages || guide.languages || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || email.includes(search) || languages.includes(search);
  });

  const selectedGuide = guides.find(guide => getGuideId(guide) === selectedGuideId);

  console.log('Render state:', { loading, error, guidesCount: guides.length, selectedGuideId });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Chọn Hướng dẫn viên</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải danh sách hướng dẫn viên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Chọn Hướng dẫn viên</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle size={20} />
            <span className="font-semibold">Lỗi</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          {externalGuides === null && (
            <button
              onClick={fetchGuides}
              className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Chọn Hướng dẫn viên</h2>
      
      <div className="space-y-4">
        {/* Selected Guide Summary */}
        {selectedGuide && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">Hướng dẫn viên đã chọn</h4>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-blue-400">
              <div className="flex items-center gap-3">
                {selectedGuide.Avatar || selectedGuide.avatar ? (
                  <img 
                    src={selectedGuide.Avatar || selectedGuide.avatar}
                    alt={selectedGuide.FullName || selectedGuide.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="text-blue-600" size={24} />
                  </div>
                )}
                
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedGuide.FullName || selectedGuide.fullName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={12} />
                      {(selectedGuide.AverageRating || selectedGuide.averageRating || 0).toFixed(1)}
                    </span>
                    <span>{selectedGuide.Languages || selectedGuide.languages || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleSelectGuide(selectedGuideId)}
                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                title="Bỏ chọn"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, hoặc ngôn ngữ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Available Guides List */}
        <div className="border border-gray-300 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <h4 className="font-semibold text-gray-900">
              Danh sách hướng dẫn viên ({filteredGuides.length})
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              Click để chọn hướng dẫn viên
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
            {filteredGuides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto mb-2 text-gray-400" size={40} />
                <p className="text-sm">
                  {guides.length === 0 ? 'Không có hướng dẫn viên' : 'Không tìm thấy hướng dẫn viên'}
                </p>
              </div>
            ) : (
              filteredGuides.map(guide => {
                const guideId = getGuideId(guide);
                const isSelected = guideId === selectedGuideId;
                // Kiểm tra availability từ API response
                const isAvailable = guide.IsAvailable !== undefined ? guide.IsAvailable : 
                                   guide.isAvailable !== undefined ? guide.isAvailable : true;
                const isActive = guide.IsActive !== undefined ? guide.IsActive : 
                                guide.isActive !== undefined ? guide.isActive : true;
                const isDefaultGuide = guide.IsDefaultGuide || guide.isDefaultGuide || false;
                
                return (
                  <div
                    key={guideId}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } ${!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => isAvailable && handleSelectGuide(guideId)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {guide.Avatar || guide.avatar ? (
                          <img 
                            src={guide.Avatar || guide.avatar}
                            alt={guide.FullName || guide.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="text-gray-500" size={24} />
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>

                      {/* Guide Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900">
                                {guide.FullName || guide.fullName}
                              </h5>
                              {isDefaultGuide && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                                  <Award size={12} className="inline mr-1" />
                                  Mặc định
                                </span>
                              )}
                              {!isAvailable && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                  Không khả dụng
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {guide.Email || guide.email}
                            </p>
                            {(guide.PhoneNumber || guide.phoneNumber) && (
                              <p className="text-xs text-gray-500">
                                {guide.PhoneNumber || guide.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Star className="text-yellow-500 fill-yellow-500" size={14} />
                            <span className="font-medium">
                              {(guide.AverageRating || guide.averageRating || 0).toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({guide.TotalReviews || guide.totalReviews || 0} đánh giá)
                            </span>
                          </div>
                          
                          {(guide.Languages || guide.languages) && (
                            <div className="flex items-center gap-1 text-gray-700">
                              <Languages size={14} />
                              <span>{guide.Languages || guide.languages}</span>
                            </div>
                          )}
                          
                          {(guide.ExperienceYears || guide.experienceYears) ? (
                            <span className="text-gray-700">
                              {guide.ExperienceYears || guide.experienceYears} năm kinh nghiệm
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-900">
            <strong>Lưu ý:</strong> Chọn một hướng dẫn viên cho tour của bạn. Nếu không chọn, 
            hệ thống sẽ tự động gán hướng dẫn viên mặc định.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideSelectorCheckout;