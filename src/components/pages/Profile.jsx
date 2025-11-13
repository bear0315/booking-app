import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Briefcase,
  Star,
  Award,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Languages,
  IdCard
} from 'lucide-react';
import { guideService } from '../../services/guideService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editedProfile, setEditedProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatar: null,
    bio: '',
    languages: '',
    experienceYears: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        setError('Không thể tải thông tin người dùng');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = user?.id || user?.Id || user?.userId || user?.UserId;
      
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('Fetching profile for userId:', userId);

      // ✅ Sử dụng method mới getGuideProfileByUserId
      const response = await guideService.getGuideProfileByUserId(userId);
      
      console.log('Profile response:', response);

      // Handle different response structures
      let profileData = response?.data || response?.Data || response;
      
      if (!profileData) {
        throw new Error('Không nhận được dữ liệu từ server');
      }

      setProfile(profileData);
      
      // Set edited profile with fetched data
      setEditedProfile({
        fullName: profileData.fullName || profileData.FullName || '',
        email: profileData.email || profileData.Email || '',
        phoneNumber: profileData.phoneNumber || profileData.PhoneNumber || '',
        avatar: profileData.avatar || profileData.Avatar || null,
        bio: profileData.bio || profileData.Bio || '',
        languages: profileData.languages || profileData.Languages || '',
        experienceYears: profileData.experienceYears || profileData.ExperienceYears || 0
      });
      
      console.log('Profile loaded successfully');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original profile data
    setEditedProfile({
      fullName: profile?.fullName || profile?.FullName || '',
      email: profile?.email || profile?.Email || '',
      phoneNumber: profile?.phoneNumber || profile?.PhoneNumber || '',
      avatar: profile?.avatar || profile?.Avatar || null,
      bio: profile?.bio || profile?.Bio || '',
      languages: profile?.languages || profile?.Languages || '',
      experienceYears: profile?.experienceYears || profile?.ExperienceYears || 0
    });
    setError('');
  };

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      const userId = user?.id || user?.Id || user?.userId || user?.UserId;

      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('Updating profile for userId:', userId);
      console.log('Profile data:', editedProfile);

      // Call update API using service
      const response = await guideService.updateGuideProfile(userId, editedProfile);
      
      console.log('Update response:', response);

      // Check response
      const success = response?.success || response?.Success;
      const updatedProfile = response?.data || response?.Data;
      
      if (!success) {
        throw new Error(response?.message || response?.Message || 'Không thể cập nhật thông tin');
      }
      
      // Update local state
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Cập nhật thông tin thành công!');
      
      // Update user in localStorage
      const updatedUser = {
        ...user,
        fullName: editedProfile.fullName,
        name: editedProfile.fullName,
        email: editedProfile.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
          <p className="mt-1 text-gray-600">Quản lý thông tin hồ sơ của bạn</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={18} />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 overflow-hidden flex-shrink-0">
              {(profile?.avatar || profile?.Avatar) ? (
                <img 
                  src={profile.avatar || profile.Avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className="text-white flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 text-xl font-bold"
                  placeholder="Họ và tên"
                />
              ) : (
                <h3 className="text-2xl font-bold truncate">
                  {profile?.fullName || profile?.FullName || 'Chưa cập nhật'}
                </h3>
              )}
              <p className="text-blue-100 mt-1 flex items-center gap-1">
                <Award size={16} />
                <span>Hướng dẫn viên</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-blue-600" />
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                    {profile?.email || profile?.Email || 'Chưa cập nhật'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Số điện thoại"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                    {profile?.phoneNumber || profile?.PhoneNumber || 'Chưa cập nhật'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Thông tin nghề nghiệp
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Giới thiệu bản thân
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {profile?.bio || profile?.Bio || 'Chưa có giới thiệu'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Ngôn ngữ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.languages}
                      onChange={(e) => handleChange('languages', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: Tiếng Việt, English, 中文"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {profile?.languages || profile?.Languages || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Số năm kinh nghiệm
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editedProfile.experienceYears}
                      onChange={(e) => handleChange('experienceYears', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số năm kinh nghiệm"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                      {profile?.experienceYears || profile?.ExperienceYears || 0} năm
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá trung bình
                </label>
                <div className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span>{(profile?.averageRating || profile?.AverageRating || 0).toFixed(1)} / 5.0</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số đánh giá
                </label>
                <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                  {profile?.totalReviews || profile?.TotalReviews || 0} đánh giá
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <X size={18} />
                <span>Hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;