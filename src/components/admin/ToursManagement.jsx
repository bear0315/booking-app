import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tourService } from '../../services/tourService';
import { destinationService } from '../../services/destinationService';
import { tagService } from '../../services/tagService';
import GuideSelector from '../checkout/GuideSelector'; 


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
  Eye,
  X,
  Image as ImageIcon,
  Mountain,
  Award,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
  Loader
} from 'lucide-react';

// Enums
const TourStatus = {
  Active: 0,
  Inactive: 1,
  Draft: 2,
  Archived: 3
};

const TourType = {
  Standard: 0,
  Adventure: 1,
  Cultural: 2,
  Culinary: 3,
  Beach: 4,
  City: 5,
  Nature: 6,
  Luxury: 7
};

const TourCategory = {
  Adventure: 0,
  Cultural: 1,
  Beach: 2,
  Mountain: 3,
  City: 4,
  Nature: 5,
  Wildlife: 6,
  Photography: 7,
  Culinary: 8,
  Wellness: 9,
  Spiritual: 10,
  Festival: 11,
  Shopping: 12,
  Cruise: 13,
  Trekking: 14,
  Diving: 15,
  Family: 16,
  Honeymoon: 17,
  Backpacking: 18,
  Ecotourism: 19
};

const TourDifficulty = {
  Easy: 0,
  Moderate: 1,
  Challenging: 2,
  Expert: 3
};

const getStatusBadge = (status) => {
  const badges = {
    0: { label: 'Active', class: 'bg-green-100 text-green-800' },
    1: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
    2: { label: 'Draft', class: 'bg-yellow-100 text-yellow-800' },
    3: { label: 'Archived', class: 'bg-red-100 text-red-800' }
  };
  return badges[status] || badges[0];
};

const getTypeLabel = (type) => {
  const labels = ['Standard', 'Adventure', 'Cultural', 'Culinary', 'Beach', 'City', 'Nature', 'Luxury'];
  return labels[type] || 'Standard';
};

const getCategoryLabel = (category) => {
  const labels = ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Nature', 'Wildlife',
    'Photography', 'Culinary', 'Wellness', 'Spiritual', 'Festival', 'Shopping', 'Cruise',
    'Trekking', 'Diving', 'Family', 'Honeymoon', 'Backpacking', 'Ecotourism'];
  return labels[category] || 'Adventure';
};

const getDifficultyLabel = (difficulty) => {
  const labels = ['Easy', 'Moderate', 'Challenging', 'Expert'];
  return labels[difficulty] || 'Easy';
};

export default function ToursManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    destinationId: '',
    category: '',
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    minDays: '',
    maxDays: ''
  });

  // Form state - ĐÃ THÊM defaultGuideId
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destinationId: '',
    location: '',
    price: '',
    duration: '',
    durationDays: '',
    maxGuests: '',
    type: 0,
    category: 0,
    difficulty: null,
    status: 2,
    isFeatured: false,
    physicalRequirements: '',
    minAge: '',
    maxAge: '',
    specialRequirements: '',
    metaTitle: '',
    metaDescription: '',
    images: [],
    itineraries: [],
    includes: [],
    excludes: [],
    guideIds: [],
    defaultGuideId: null, // ← ĐÃ THÊM
    tagIds: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTours();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchDestinations();
    fetchTags();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);

      const hasFilters = searchTerm || Object.values(filters).some(v => v !== '');

      let response;
      if (hasFilters) {
        const searchParams = {
          pageNumber: currentPage,
          pageSize: pageSize,
          keyword: searchTerm,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '')
          )
        };
        response = await tourService.searchTours(searchParams);
      } else {
        response = await tourService.getAllTours(currentPage, pageSize);
      }

      let toursData = [];
      let pages = 1;

      if (response.Items || response.items) {
        toursData = response.Items || response.items;
        pages = response.TotalPages || response.totalPages || 1;
      } else if (response.Data || response.data) {
        toursData = response.Data || response.data;
        pages = response.TotalPages || response.totalPages || 1;
      } else if (Array.isArray(response)) {
        toursData = response;
        pages = 1;
      }

      setTours(toursData);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const data = await destinationService.getActiveDestinations();

      let destData = [];
      if (Array.isArray(data)) {
        destData = data;
      } else if (data.Items || data.items) {
        destData = data.Items || data.items;
      } else if (data.Data || data.data) {
        destData = data.Data || data.data;
      }

      setDestinations(destData);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations([]);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await tagService.getAllTags();

      let tagsData = [];
      if (Array.isArray(data)) {
        tagsData = data;
      } else if (data.Items || data.items) {
        tagsData = data.Items || data.items;
      } else if (data.Data || data.data) {
        tagsData = data.Data || data.data;
      }

      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTours();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      destinationId: '',
      category: '',
      type: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      minDays: '',
      maxDays: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // CẬP NHẬT openModal - XỬ LÝ GUIDE KHI EDIT
  const openModal = async (mode, tour = null) => {
    setModalMode(mode);
    setSelectedTour(tour);

    if (mode === 'edit' && tour) {
      try {
        setLoading(true);
        const tourId = tour.Id || tour.id;
        const fullTour = await tourService.getTourById(tourId);

        // Extract tag IDs
        let extractedTagIds = [];
        const tourTags = fullTour.Tags || fullTour.tags || [];
        if (Array.isArray(tourTags)) {
          extractedTagIds = tourTags
            .map(t => t.TagId || t.tagId || t.Id || t.id)
            .filter(id => id !== undefined && id !== null);
        }

        // Extract images
        let extractedImages = [];
        const tourImages = fullTour.Images || fullTour.images || [];
        if (Array.isArray(tourImages)) {
          extractedImages = tourImages.map((img, idx) => ({
            imageUrl: img.ImageUrl || img.imageUrl || '',
            caption: img.Caption || img.caption || '',
            isPrimary: img.IsPrimary !== undefined ? img.IsPrimary : (img.isPrimary || false),
            displayOrder: img.DisplayOrder !== undefined ? img.DisplayOrder : (img.displayOrder !== undefined ? img.displayOrder : idx)
          })).filter(img => img.imageUrl && img.imageUrl.trim());
        }

        // Extract guide IDs and default guide
        let extractedGuideIds = [];
        let extractedDefaultGuideId = null;
        const tourGuides = fullTour.Guides || fullTour.guides || [];

        if (Array.isArray(tourGuides)) {
          extractedGuideIds = tourGuides
            .map(g => g.GuideId || g.guideId || g.Id || g.id)
            .filter(id => id !== undefined && id !== null);

          const defaultGuide = tourGuides.find(g => g.IsDefault || g.isDefault);
          if (defaultGuide) {
            extractedDefaultGuideId = defaultGuide.GuideId || defaultGuide.guideId ||
              defaultGuide.Id || defaultGuide.id;
          }
        }

        console.log('Extracted guide IDs:', extractedGuideIds);
        console.log('Default guide ID:', extractedDefaultGuideId);

        // Map full tour
        const mappedTour = {
          id: fullTour.Id || fullTour.id,
          name: fullTour.Name || fullTour.name,
          description: fullTour.Description || fullTour.description,
          destinationId: fullTour.DestinationId || fullTour.destinationId,
          location: fullTour.Location || fullTour.location,
          price: fullTour.Price || fullTour.price,
          duration: fullTour.Duration || fullTour.duration,
          durationDays: fullTour.DurationDays || fullTour.durationDays,
          maxGuests: fullTour.MaxGuests || fullTour.maxGuests,
          type: fullTour.Type !== undefined ? fullTour.Type : fullTour.type,
          category: fullTour.Category !== undefined ? fullTour.Category : fullTour.category,
          difficulty: fullTour.Difficulty !== undefined ? fullTour.Difficulty : fullTour.difficulty,
          status: fullTour.Status !== undefined ? fullTour.Status : fullTour.status,
          isFeatured: fullTour.IsFeatured !== undefined ? fullTour.IsFeatured : fullTour.isFeatured,
          physicalRequirements: fullTour.PhysicalRequirements || fullTour.physicalRequirements,
          minAge: fullTour.MinAge || fullTour.minAge,
          maxAge: fullTour.MaxAge || fullTour.maxAge,
          specialRequirements: fullTour.SpecialRequirements || fullTour.specialRequirements,
          metaTitle: fullTour.MetaTitle || fullTour.metaTitle,
          metaDescription: fullTour.MetaDescription || fullTour.metaDescription,
          images: extractedImages,
          itineraries: fullTour.Itineraries || fullTour.itineraries || [],
          includes: (fullTour.Includes || fullTour.includes || []).map(i => i.Description || i.description || i),
          excludes: (fullTour.Excludes || fullTour.excludes || []).map(e => e.Description || e.description || e),
          guideIds: extractedGuideIds,
          defaultGuideId: extractedDefaultGuideId,
          tagIds: extractedTagIds
        };

        setFormData({
          name: mappedTour.name || '',
          description: mappedTour.description || '',
          destinationId: mappedTour.destinationId || '',
          location: mappedTour.location || '',
          price: mappedTour.price || '',
          duration: mappedTour.duration || '',
          durationDays: mappedTour.durationDays || '',
          maxGuests: mappedTour.maxGuests || '',
          type: mappedTour.type || 0,
          category: mappedTour.category || 0,
          difficulty: mappedTour.difficulty,
          status: mappedTour.status !== undefined ? mappedTour.status : 2,
          isFeatured: mappedTour.isFeatured || false,
          physicalRequirements: mappedTour.physicalRequirements || '',
          minAge: mappedTour.minAge || '',
          maxAge: mappedTour.maxAge || '',
          specialRequirements: mappedTour.specialRequirements || '',
          metaTitle: mappedTour.metaTitle || '',
          metaDescription: mappedTour.metaDescription || '',
          images: extractedImages,
          itineraries: mappedTour.itineraries,
          includes: mappedTour.includes,
          excludes: mappedTour.excludes,
          guideIds: mappedTour.guideIds,
          defaultGuideId: mappedTour.defaultGuideId,
          tagIds: mappedTour.tagIds
        });

      } catch (error) {
        console.error('Error fetching tour details:', error);
        alert('Failed to load tour details');
        return;
      } finally {
        setLoading(false);
      }
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        destinationId: '',
        location: '',
        price: '',
        duration: '',
        durationDays: '',
        maxGuests: '',
        type: 0,
        category: 0,
        difficulty: null,
        status: 2,
        isFeatured: false,
        physicalRequirements: '',
        minAge: '',
        maxAge: '',
        specialRequirements: '',
        metaTitle: '',
        metaDescription: '',
        images: [],
        itineraries: [],
        includes: [],
        excludes: [],
        guideIds: [],
        defaultGuideId: null,
        tagIds: []
      });
    }

    setErrors({});
    setShowModal(true);
  };

  // CẬP NHẬT closeModal - RESET GUIDE
  const closeModal = () => {
    setShowModal(false);
    setSelectedTour(null);
    setFormData({
      name: '',
      description: '',
      destinationId: '',
      location: '',
      price: '',
      duration: '',
      durationDays: '',
      maxGuests: '',
      type: 0,
      category: 0,
      difficulty: null,
      status: 2,
      isFeatured: false,
      physicalRequirements: '',
      minAge: '',
      maxAge: '',
      specialRequirements: '',
      metaTitle: '',
      metaDescription: '',
      images: [],
      itineraries: [],
      includes: [],
      excludes: [],
      guideIds: [],
      defaultGuideId: null,
      tagIds: []
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.destinationId) newErrors.destinationId = 'Destination is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.durationDays || formData.durationDays <= 0) newErrors.durationDays = 'Valid duration days is required';
    if (!formData.maxGuests || formData.maxGuests <= 0) newErrors.maxGuests = 'Valid max guests is required';

    if ([1, 14].includes(formData.type) && formData.difficulty === null) {
      newErrors.difficulty = 'Difficulty is required for Adventure/Trekking tours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CẬP NHẬT handleSubmit - GỬI GUIDE DATA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxGuests: parseInt(formData.maxGuests),
        minAge: formData.minAge ? parseInt(formData.minAge) : null,
        maxAge: formData.maxAge ? parseInt(formData.maxAge) : null,
        destinationId: parseInt(formData.destinationId),
        status: parseInt(formData.status),
        images: formData.images.map((img, idx) => ({
          imageUrl: img.imageUrl || img.ImageUrl || '',
          caption: img.caption || img.Caption || null,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : (img.IsPrimary || false),
          displayOrder: idx
        })).filter(img => img.imageUrl.trim()),
        includes: formData.includes.filter(i => i && i.trim()),
        excludes: formData.excludes.filter(e => e && e.trim()),
        guideIds: formData.guideIds.filter(id => id),
        defaultGuideId: formData.defaultGuideId,
        tagIds: formData.tagIds.filter(id => id)
      };

      console.log('Submitting tour with guides:', {
        guideIds: submitData.guideIds,
        defaultGuideId: submitData.defaultGuideId
      });

      if (modalMode === 'create') {
        await tourService.createTour(submitData);
        alert('Tour created successfully!');
      } else if (modalMode === 'edit') {
        const tourId = selectedTour.Id || selectedTour.id;
        submitData.id = tourId;
        await tourService.updateTour(tourId, submitData);
        alert('Tour updated successfully!');
      }

      closeModal();
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);

      let errorMessage = 'Failed to save tour';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const validationErrors = {};
          Object.keys(errorData.errors).forEach(key => {
            validationErrors[key.toLowerCase()] = errorData.errors[key][0];
          });
          setErrors(validationErrors);
          errorMessage = 'Please fix validation errors';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTour) return;

    try {
      setLoading(true);
      const tourId = selectedTour.Id || selectedTour.id;
      await tourService.deleteTour(tourId);
      alert('Tour deleted successfully!');
      closeModal();
      fetchTours();
    } catch (error) {
      console.error('Error deleting tour:', error);

      let errorMessage = 'Failed to delete tour';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Image management
  const handleAddImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, {
        imageUrl: '',
        caption: '',
        isPrimary: prev.images.length === 0,
        displayOrder: prev.images.length
      }]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      if (prev.images[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      if (field === 'isPrimary' && value) {
        newImages.forEach(img => img.isPrimary = false);
      }
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });
  };

  // Tag management
  const handleToggleTag = (tagId) => {
    setFormData(prev => {
      const currentTagIds = [...prev.tagIds];
      const index = currentTagIds.indexOf(tagId);

      if (index > -1) {
        currentTagIds.splice(index, 1);
      } else {
        currentTagIds.push(tagId);
      }

      return { ...prev, tagIds: currentTagIds };
    });
  };

  // Includes/Excludes management
  const handleAddInclude = () => {
    setFormData(prev => ({
      ...prev,
      includes: [...prev.includes, '']
    }));
  };

  const handleRemoveInclude = (index) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleIncludeChange = (index, value) => {
    setFormData(prev => {
      const newIncludes = [...prev.includes];
      newIncludes[index] = value;
      return { ...prev, includes: newIncludes };
    });
  };

  const handleAddExclude = () => {
    setFormData(prev => ({
      ...prev,
      excludes: [...prev.excludes, '']
    }));
  };

  const handleRemoveExclude = (index) => {
    setFormData(prev => ({
      ...prev,
      excludes: prev.excludes.filter((_, i) => i !== index)
    }));
  };

  const handleExcludeChange = (index, value) => {
    setFormData(prev => {
      const newExcludes = [...prev.excludes];
      newExcludes[index] = value;
      return { ...prev, excludes: newExcludes };
    });
  };

  const handleToggleFeatured = async (id) => {
    try {
      await tourService.toggleFeatured(id);
      fetchTours();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Failed to update featured status');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await tourService.updateStatus(id, status);
      fetchTours();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
              <p className="text-gray-600 mt-1">Manage your tour listings</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add New Tour
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tours by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={20} />
                Filters
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={20} />
              </button>
            </form>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <select
                  value={filters.destinationId}
                  onChange={(e) => handleFilterChange('destinationId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Destinations</option>
                  {destinations.map(dest => (
                    <option key={`filter-dest-${dest.Id || dest.id}`} value={dest.Id || dest.id}>
                      {dest.Name || dest.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {Object.entries(TourType).map(([key, value]) => (
                    <option key={`filter-type-${value}`} value={value}>{key}</option>
                  ))}
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {Object.entries(TourCategory).map(([key, value]) => (
                    <option key={`filter-cat-${value}`} value={value}>{key}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {Object.entries(TourStatus).map(([key, value]) => (
                    <option key={`filter-status-${value}`} value={value}>{key}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  placeholder="Min Days"
                  value={filters.minDays}
                  onChange={(e) => handleFilterChange('minDays', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  placeholder="Max Days"
                  value={filters.maxDays}
                  onChange={(e) => handleFilterChange('maxDays', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tours List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
              <p className="text-gray-600">Loading tours...</p>
            </div>
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mountain className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(v => v !== '')
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first tour'}
            </p>
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add New Tour
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => {
              const t = {
                id: tour.Id || tour.id,
                name: tour.Name || tour.name,
                slug: tour.Slug || tour.slug,
                location: tour.Location || tour.location,
                price: tour.Price || tour.price,
                durationDays: tour.DurationDays || tour.durationDays,
                maxGuests: tour.MaxGuests || tour.maxGuests,
                averageRating: tour.AverageRating || tour.averageRating,
                totalReviews: tour.TotalReviews || tour.totalReviews,
                status: tour.Status !== undefined ? tour.Status : tour.status,
                isFeatured: tour.IsFeatured !== undefined ? tour.IsFeatured : tour.isFeatured,
                type: tour.Type !== undefined ? tour.Type : tour.type,
                category: tour.Category !== undefined ? tour.Category : tour.category,
                difficulty: tour.Difficulty !== undefined ? tour.Difficulty : tour.difficulty,
                images: tour.Images || tour.images || [],
                primaryImageUrl: tour.PrimaryImageUrl || tour.primaryImageUrl,
                destinationName: tour.DestinationName || tour.destinationName
              };

              return (
                <div key={t.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Tour Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
                    {t.images && t.images.length > 0 && (t.images[0].ImageUrl || t.images[0].imageUrl) ? (
                      <img
                        src={t.images[0].ImageUrl || t.images[0].imageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.fallback-icon');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : t.primaryImageUrl ? (
                      <img
                        src={t.primaryImageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.fallback-icon');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="fallback-icon absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        display: (t.images && t.images.length > 0 && (t.images[0].ImageUrl || t.images[0].imageUrl)) || t.primaryImageUrl ? 'none' : 'flex'
                      }}
                    >
                      <ImageIcon className="text-white opacity-50" size={48} />
                    </div>
                    {t.isFeatured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <Award size={12} />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusBadge(t.status).class}`}>
                        {getStatusBadge(t.status).label}
                      </span>
                    </div>
                  </div>

                  {/* Tour Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{t.name}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin size={16} />
                      <span className="line-clamp-1">{t.location}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{t.durationDays} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{t.maxGuests} guests</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="font-semibold">{t.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-600">({t.totalReviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-bold">
                        <DollarSign size={18} />
                        <span>{t.price?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {getTypeLabel(t.type)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        {getCategoryLabel(t.category)}
                      </span>
                      {t.difficulty !== null && t.difficulty !== undefined && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          {getDifficultyLabel(t.difficulty)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => navigate(`/tours/${t.id}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => openModal('edit', tour)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => openModal('delete', tour)}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleToggleFeatured(t.id)}
                        className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-50"
                      >
                        {t.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, parseInt(e.target.value))}
                        className="flex-1 text-xs px-2 py-1 border rounded"
                      >
                        {Object.entries(TourStatus).map(([key, value]) => (
                          <option key={`status-${t.id}-${value}`} value={value}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' && 'Create New Tour'}
                {modalMode === 'edit' && 'Edit Tour'}
                {modalMode === 'delete' && 'Delete Tour'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'delete' ? (
                <div>
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertCircle size={48} />
                    <div>
                      <h3 className="text-lg font-semibold">Are you sure?</h3>
                      <p className="text-gray-600">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="mb-6">
                    You are about to delete <strong>{selectedTour?.Name || selectedTour?.name}</strong>
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Delete Tour'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tour Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.destinationId}
                          onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.destinationId ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Select Destination</option>
                          {destinations.map(dest => (
                            <option key={`form-dest-${dest.Id || dest.id}`} value={dest.Id || dest.id}>
                              {dest.Name || dest.name}
                            </option>
                          ))}
                        </select>
                        {errors.destinationId && <p className="text-red-500 text-xs mt-1">{errors.destinationId}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Guests <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.maxGuests}
                          onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.maxGuests ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.maxGuests && <p className="text-red-500 text-xs mt-1">{errors.maxGuests}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 3 days 2 nights"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration Days <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.durationDays}
                          onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.durationDays ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.durationDays && <p className="text-red-500 text-xs mt-1">{errors.durationDays}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(TourType).map(([key, value]) => (
                            <option key={`form-type-${value}`} value={value}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(TourCategory).map(([key, value]) => (
                            <option key={`form-cat-${value}`} value={value}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty {[1, 14].includes(formData.type) && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          value={formData.difficulty === null ? '' : formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value === '' ? null : parseInt(e.target.value) })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">None</option>
                          {Object.entries(TourDifficulty).map(([key, value]) => (
                            <option key={`form-diff-${value}`} value={value}>{key}</option>
                          ))}
                        </select>
                        {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(TourStatus).map(([key, value]) => (
                            <option key={`form-status-${value}`} value={value}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Featured Tour</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus size={16} />
                        Add Image
                      </button>
                    </div>

                    {formData.images.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
                        <p className="text-sm text-gray-500">No images added yet</p>
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          Add your first image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1 space-y-2">
                              {image.imageUrl && (
                                <div className="relative h-24 bg-gray-200 rounded overflow-hidden">
                                  <img
                                    src={image.imageUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const fallback = e.target.parentElement.querySelector('.img-fallback');
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="img-fallback absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                                    <ImageIcon className="text-gray-400" size={32} />
                                  </div>
                                </div>
                              )}

                              <input
                                type="text"
                                placeholder="Image URL *"
                                value={image.imageUrl}
                                onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Caption (optional)"
                                value={image.caption}
                                onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={image.isPrimary}
                                  onChange={(e) => handleImageChange(index, 'isPrimary', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 font-medium">Primary Image</span>
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Includes Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
                      <button
                        type="button"
                        onClick={handleAddInclude}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>

                    {formData.includes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No items added yet
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {formData.includes.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Hotel accommodation, Meals, Transportation"
                              value={item}
                              onChange={(e) => handleIncludeChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveInclude(index)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Excludes Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">What's Not Included</h3>
                      <button
                        type="button"
                        onClick={handleAddExclude}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>

                    {formData.excludes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No items added yet
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {formData.excludes.map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Personal expenses, Travel insurance, Tips"
                              value={item}
                              onChange={(e) => handleExcludeChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExclude(index)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Tags</h3>

                    {tags.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No tags available. Please create tags first.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {tags.map(tag => {
                          const tagId = tag.Id || tag.id;
                          const tagName = tag.Name || tag.name;
                          const isSelected = formData.tagIds.includes(tagId);

                          return (
                            <button
                              key={tagId}
                              type="button"
                              onClick={() => handleToggleTag(tagId)}
                              className={`px-3 py-1.5 text-sm rounded-full transition-all ${isSelected
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                              {tagName}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.tagIds.length} tag{formData.tagIds.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  {/* ========== GUIDES SECTION - ĐÃ THÊM HOÀN CHỈNH ========== */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tour Guides</h3>
                        <p className="text-sm text-gray-600">
                          Select guides who can lead this tour
                        </p>
                      </div>
                      {formData.guideIds.length > 0 && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {formData.guideIds.length} guide{formData.guideIds.length !== 1 ? 's' : ''} selected
                        </span>
                      )}
                    </div>

                    <GuideSelector
                      selectedGuideIds={formData.guideIds}
                      defaultGuideId={formData.defaultGuideId}
                      onGuidesChange={(newGuideIds) => {
                        console.log('Guide IDs changed:', newGuideIds);
                        setFormData(prev => ({
                          ...prev,
                          guideIds: newGuideIds
                        }));
                      }}
                      onDefaultGuideChange={(newDefaultId) => {
                        console.log('Default guide changed:', newDefaultId);
                        setFormData(prev => ({
                          ...prev,
                          defaultGuideId: newDefaultId
                        }));
                      }}
                    />

                    {errors.guideIds && (
                      <p className="text-red-500 text-sm flex items-center gap-1 mt-2">
                        <AlertCircle size={16} />
                        {errors.guideIds}
                      </p>
                    )}
                  </div>
                  {/* ========== END GUIDES SECTION ========== */}

                  {/* Additional Requirements */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g., 12"
                          value={formData.minAge}
                          onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g., 65"
                          value={formData.maxAge}
                          onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Physical Requirements
                      </label>
                      <textarea
                        value={formData.physicalRequirements}
                        onChange={(e) => setFormData({ ...formData, physicalRequirements: e.target.value })}
                        rows={3}
                        placeholder="Describe any physical fitness requirements..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requirements
                      </label>
                      <textarea
                        value={formData.specialRequirements}
                        onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                        rows={3}
                        placeholder="Any special requirements or equipment needed..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">SEO Information (Optional)</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Leave empty to auto-generate from tour name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        rows={3}
                        placeholder="Leave empty to auto-generate from tour description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.metaDescription.length}/160 characters
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-6 border-t sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          {modalMode === 'create' ? 'Create Tour' : 'Update Tour'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}