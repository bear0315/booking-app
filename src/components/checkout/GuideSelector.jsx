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

// Guide Selector Component
const GuideSelector = ({ 
  selectedGuideIds = [], 
  defaultGuideId = null,
  onGuidesChange,
  onDefaultGuideChange 
}) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use guideService instead of direct fetch
      const guidesData = await guideService.getAllGuides();
      
      setGuides(Array.isArray(guidesData) ? guidesData : []);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to load guides. Please try again.');
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGuide = (guideId) => {
    let newGuideIds;
    
    if (selectedGuideIds.includes(guideId)) {
      newGuideIds = selectedGuideIds.filter(id => id !== guideId);
      
      // If removing the default guide, set new default
      if (guideId === defaultGuideId) {
        const newDefault = newGuideIds.length > 0 ? newGuideIds[0] : null;
        onDefaultGuideChange(newDefault);
      }
    } else {
      newGuideIds = [...selectedGuideIds, guideId];
      
      // If this is the first guide, make it default
      if (newGuideIds.length === 1) {
        onDefaultGuideChange(guideId);
      }
    }
    
    onGuidesChange(newGuideIds);
  };

  const handleSetDefault = (guideId) => {
    if (selectedGuideIds.includes(guideId)) {
      onDefaultGuideChange(guideId);
    } else {
      // Add guide to selection and set as default
      const newGuideIds = [...selectedGuideIds, guideId];
      onGuidesChange(newGuideIds);
      onDefaultGuideChange(guideId);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const name = (guide.FullName || guide.fullName || '').toLowerCase();
    const email = (guide.Email || guide.email || '').toLowerCase();
    const languages = (guide.Languages || guide.languages || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || email.includes(search) || languages.includes(search);
  });

  const getSelectedGuides = () => {
    return guides.filter(guide => {
      const guideId = guide.GuideId || guide.guideId || guide.Id || guide.id;
      return selectedGuideIds.includes(guideId);
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading guides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={fetchGuides}
          className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Guides Summary */}
      {selectedGuideIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-900">
              Selected Guides ({selectedGuideIds.length})
            </h4>
            {defaultGuideId && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Default: {guides.find(g => (g.GuideId || g.guideId || g.Id || g.id) === defaultGuideId)?.FullName || 
                         guides.find(g => (g.GuideId || g.guideId || g.Id || g.id) === defaultGuideId)?.fullName || 'Unknown'}
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getSelectedGuides().map(guide => {
              const guideId = guide.GuideId || guide.guideId || guide.Id || guide.id;
              const isDefault = guideId === defaultGuideId;
              
              return (
                <div 
                  key={guideId}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 ${
                    isDefault ? 'border-yellow-400' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {guide.Avatar || guide.avatar ? (
                      <img 
                        src={guide.Avatar || guide.avatar}
                        alt={guide.FullName || guide.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="text-blue-600" size={20} />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {guide.FullName || guide.fullName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={12} />
                          {(guide.AverageRating || guide.averageRating || 0).toFixed(1)}
                        </span>
                        <span>{guide.Languages || guide.languages || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isDefault ? (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        <Award size={12} />
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(guideId)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleGuide(guideId)}
                      className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search guides by name, email, or languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Available Guides List */}
      <div className="border border-gray-300 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h4 className="font-semibold text-gray-900">
            Available Guides ({filteredGuides.length})
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            Click to add/remove guides. Set one as default.
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="mx-auto mb-2 text-gray-400" size={40} />
              <p className="text-sm">No guides found</p>
            </div>
          ) : (
            filteredGuides.map(guide => {
              const guideId = guide.GuideId || guide.guideId || guide.Id || guide.id;
              const isSelected = selectedGuideIds.includes(guideId);
              const isDefault = guideId === defaultGuideId;
              const isActive = guide.IsActive !== undefined ? guide.IsActive : guide.isActive;
              
              return (
                <div
                  key={guideId}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${!isActive ? 'opacity-60' : ''}`}
                  onClick={() => handleToggleGuide(guideId)}
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
                            {!isActive && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                Inactive
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
                        
                        {isDefault && (
                          <span className="flex-shrink-0 flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            <Award size={12} />
                            Default
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="font-medium">
                            {(guide.AverageRating || guide.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="text-gray-500">
                            ({guide.TotalReviews || guide.totalReviews || 0} reviews)
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
                            {guide.ExperienceYears || guide.experienceYears} years exp.
                          </span>
                        ) : null}
                      </div>

                      {/* Action hint */}
                      {isSelected && !isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(guideId);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Set as Default Guide
                        </button>
                      )}
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
          <strong>Tip:</strong> Select multiple guides for this tour. The default guide will be 
          automatically assigned to bookings unless customers choose a different guide.
        </p>
      </div>
    </div>
  );
};

export default GuideSelector;