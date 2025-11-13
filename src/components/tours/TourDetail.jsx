import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Edit,
  Loader
} from 'lucide-react';

const TourStatus = {
  0: { label: 'Active', class: 'bg-green-100 text-green-800' },
  1: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
  2: { label: 'Draft', class: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'Archived', class: 'bg-red-100 text-red-800' }
};

const TourType = ['Standard', 'Adventure', 'Cultural', 'Culinary', 'Beach', 'City', 'Nature', 'Luxury'];
const TourCategory = ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Nature', 'Wildlife',
  'Photography', 'Culinary', 'Wellness', 'Spiritual', 'Festival', 'Shopping', 'Cruise',
  'Trekking', 'Diving', 'Family', 'Honeymoon', 'Backpacking', 'Ecotourism'];
const TourDifficulty = ['Easy', 'Moderate', 'Challenging', 'Expert'];

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchTourDetail();
  }, [id]);

  const fetchTourDetail = async () => {
    try {
      setLoading(true);
      const response = await tourService.getTourById(id);
      
      // Map response to consistent format
      const mappedTour = {
        id: response.Id || response.id,
        name: response.Name || response.name,
        slug: response.Slug || response.slug,
        description: response.Description || response.description,
        location: response.Location || response.location,
        price: response.Price || response.price,
        duration: response.Duration || response.duration,
        durationDays: response.DurationDays || response.durationDays,
        maxGuests: response.MaxGuests || response.maxGuests,
        averageRating: response.AverageRating || response.averageRating || 0,
        totalReviews: response.TotalReviews || response.totalReviews || 0,
        status: response.Status !== undefined ? response.Status : response.status,
        isFeatured: response.IsFeatured !== undefined ? response.IsFeatured : response.isFeatured,
        type: response.Type !== undefined ? response.Type : response.type,
        category: response.Category !== undefined ? response.Category : response.category,
        difficulty: response.Difficulty !== undefined ? response.Difficulty : response.difficulty,
        physicalRequirements: response.PhysicalRequirements || response.physicalRequirements,
        minAge: response.MinAge || response.minAge,
        maxAge: response.MaxAge || response.maxAge,
        specialRequirements: response.SpecialRequirements || response.specialRequirements,
        metaTitle: response.MetaTitle || response.metaTitle,
        metaDescription: response.MetaDescription || response.metaDescription,
        images: (response.Images || response.images || []).map(img => ({
          imageUrl: img.ImageUrl || img.imageUrl,
          caption: img.Caption || img.caption,
          isPrimary: img.IsPrimary !== undefined ? img.IsPrimary : img.isPrimary,
          displayOrder: img.DisplayOrder !== undefined ? img.DisplayOrder : img.displayOrder
        })),
        itineraries: response.Itineraries || response.itineraries || [],
        includes: (response.Includes || response.includes || []).map(i => 
          i.Description || i.description || i
        ),
        excludes: (response.Excludes || response.excludes || []).map(e => 
          e.Description || e.description || e
        ),
        guides: (response.Guides || response.guides || []).map(g => ({
          guideId: g.GuideId || g.guideId || g.Id || g.id,
          fullName: g.FullName || g.fullName || g.Name || g.name,
          avatar: g.Avatar || g.avatar,
          bio: g.Bio || g.bio,
          languages: g.Languages || g.languages,
          averageRating: g.AverageRating || g.averageRating || 0,
          totalReviews: g.TotalReviews || g.totalReviews || 0,
          isDefault: g.IsDefault !== undefined ? g.IsDefault : g.isDefault
        })),
        tags: (response.Tags || response.tags || []).map(t => ({
          id: t.TagId || t.tagId || t.Id || t.id,
          name: t.TagName || t.tagName || t.Name || t.name
        })),
        destination: response.Destination ? {
          id: response.Destination.Id || response.Destination.id,
          name: response.Destination.Name || response.Destination.name,
          description: response.Destination.Description || response.Destination.description
        } : null,
        createdAt: response.CreatedAt || response.createdAt,
        updatedAt: response.UpdatedAt || response.updatedAt
      };

      setTour(mappedTour);
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError(err.message || 'Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % tour.images.length);
    }
  };

  const prevImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + tour.images.length) % tour.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/tours')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="text-gray-400 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Not Found</h2>
          <p className="text-gray-600 mb-4">The tour you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/tours')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/tours')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Tours
            </button>
            <button
              onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={18} />
              Edit Tour
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-96 bg-gradient-to-br from-blue-400 to-blue-600">
            {tour.images && tour.images.length > 0 ? (
              <>
                <img
                  src={tour.images[currentImageIndex].imageUrl}
                  alt={tour.images[currentImageIndex].caption || tour.name}
                  className="w-full h-full object-cover"
                />
                {tour.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {tour.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="text-white opacity-50" size={64} />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                TourStatus[tour.status]?.class || 'bg-gray-100 text-gray-800'
              }`}>
                {TourStatus[tour.status]?.label || 'Unknown'}
              </span>
              {tour.isFeatured && (
                <span className="px-3 py-1.5 bg-yellow-500 text-white rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                  <Award size={14} />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={20} className="text-blue-600" />
                  <span className="font-medium">{tour.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={20} className="text-blue-600" />
                  <span className="font-medium">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={20} className="text-blue-600" />
                  <span className="font-medium">Max {tour.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="font-bold">{tour.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">({tour.totalReviews} reviews)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {TourType[tour.type] || 'Standard'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  {TourCategory[tour.category] || 'Adventure'}
                </span>
                {tour.difficulty !== null && tour.difficulty !== undefined && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                    {TourDifficulty[tour.difficulty] || 'Easy'}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tour.description}</p>
            </div>

            {/* What's Included */}
            {tour.includes && tour.includes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
                <ul className="space-y-2">
                  {tour.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Not Included */}
            {tour.excludes && tour.excludes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What's Not Included</h2>
                <ul className="space-y-2">
                  {tour.excludes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {(tour.physicalRequirements || tour.specialRequirements || tour.minAge || tour.maxAge) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                
                {(tour.minAge || tour.maxAge) && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Age Requirements</h3>
                    <p className="text-gray-700">
                      {tour.minAge && tour.maxAge && `${tour.minAge} - ${tour.maxAge} years`}
                      {tour.minAge && !tour.maxAge && `Minimum ${tour.minAge} years`}
                      {!tour.minAge && tour.maxAge && `Maximum ${tour.maxAge} years`}
                    </p>
                  </div>
                )}

                {tour.physicalRequirements && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Physical Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{tour.physicalRequirements}</p>
                  </div>
                )}

                {tour.specialRequirements && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Special Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{tour.specialRequirements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tour Guides */}
            {tour.guides && tour.guides.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tour Guides</h2>
                <div className="space-y-4">
                  {tour.guides.map((guide) => (
                    <div key={guide.guideId} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {guide.fullName?.charAt(0) || 'G'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{guide.fullName}</h3>
                          {guide.isDefault && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                              Default Guide
                            </span>
                          )}
                        </div>
                        {guide.bio && (
                          <p className="text-gray-600 text-sm mb-2">{guide.bio}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          {guide.languages && (
                            <span className="text-gray-600">Languages: {guide.languages}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-yellow-500" size={14} />
                            <span className="font-semibold">{guide.averageRating.toFixed(1)}</span>
                            <span className="text-gray-500">({guide.totalReviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Price per person</p>
                  <div className="flex items-center gap-1 text-3xl font-bold text-blue-600">
                    <DollarSign size={28} />
                    <span>{tour.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{tour.durationDays} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Max Guests</span>
                  <span className="font-semibold">{tour.maxGuests} people</span>
                </div>
                {tour.destination && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Destination</span>
                    <span className="font-semibold">{tour.destination.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/tours/${tour.id}/book`)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Book This Tour
              </button>
            </div>

            {/* Tags */}
            {tour.tags && tour.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tour.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">Tour Information</h3>
              <div className="space-y-2 text-sm">
                {tour.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">
                      {new Date(tour.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {tour.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {new Date(tour.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}