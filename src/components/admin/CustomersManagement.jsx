import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { 
  Plus, 
  UsersIcon, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  User
} from 'lucide-react';

// Role enum
const UserRole = {
  Admin: 0,
  Manager: 1,
  Staff: 2,
  Guide: 3,
  Customer: 4
};

const getRoleLabel = (role) => {
  const labels = ['Admin', 'Manager', 'Staff', 'Guide', 'Customer'];
  return labels[role] || 'Customer';
};

const getRoleBadge = (role) => {
  const badges = {
    0: { label: 'Admin', class: 'bg-red-100 text-red-800' },
    1: { label: 'Manager', class: 'bg-purple-100 text-purple-800' },
    2: { label: 'Staff', class: 'bg-blue-100 text-blue-800' },
    3: { label: 'Guide', class: 'bg-green-100 text-green-800' },
    4: { label: 'Customer', class: 'bg-gray-100 text-gray-800' }
  };
  return badges[role] || badges[4];
};

const CustomersManagement = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgSpending: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 4, // Default to Customer
    isActive: true,
    address: '',
    dateOfBirth: '',
    nationality: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await userService.getAllUsers(
        currentPage, 
        pageSize, 
        roleFilter || null, 
        statusFilter !== '' ? (statusFilter === 'true') : null
      );
      
      console.log('Users response:', response);
      
      let usersData = [];
      let pages = 1;
      let total = 0;
      
      if (response.Items || response.items) {
        usersData = response.Items || response.items;
        pages = response.TotalPages || response.totalPages || 1;
        total = response.TotalCount || response.totalCount || usersData.length;
      } else if (response.Data || response.data) {
        usersData = response.Data || response.data;
        pages = response.TotalPages || response.totalPages || 1;
        total = response.TotalCount || response.totalCount || usersData.length;
      } else if (Array.isArray(response)) {
        usersData = response;
        pages = 1;
        total = usersData.length;
      }
      
      setUsers(usersData);
      setTotalPages(pages);
      setTotalUsers(total);
      
      // Calculate statistics
      const activeUsers = usersData.filter(u => (u.IsActive !== undefined ? u.IsActive : u.isActive));
      setStats({
        total: total,
        active: activeUsers.length,
        avgSpending: 0 // This would need to come from booking data
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }
    
    try {
      setLoading(true);
      const user = await userService.getUserByEmail(searchTerm);
      
      if (user) {
        setUsers([user]);
        setTotalPages(1);
        setTotalUsers(1);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setRoleFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const openModal = async (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    
    if (mode === 'edit' && user) {
      try {
        setLoading(true);
        
        const userId = user.Id || user.id;
        const fullUser = await userService.getUserById(userId);
        
        console.log('Full user data:', fullUser);
        
        setFormData({
          fullName: fullUser.FullName || fullUser.fullName || '',
          email: fullUser.Email || fullUser.email || '',
          phoneNumber: fullUser.PhoneNumber || fullUser.phoneNumber || '',
          password: '', // Never populate password
          role: fullUser.Role !== undefined ? fullUser.Role : fullUser.role,
          isActive: fullUser.IsActive !== undefined ? fullUser.IsActive : fullUser.isActive,
          address: fullUser.Address || fullUser.address || '',
          dateOfBirth: fullUser.DateOfBirth || fullUser.dateOfBirth || '',
          nationality: fullUser.Nationality || fullUser.nationality || ''
        });
        
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to load user details');
        return;
      } finally {
        setLoading(false);
      }
    } else if (mode === 'create') {
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 4,
        isActive: true,
        address: '',
        dateOfBirth: '',
        nationality: ''
      });
    }
    
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 4,
      isActive: true,
      address: '',
      dateOfBirth: '',
      nationality: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (modalMode === 'create' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        role: parseInt(formData.role)
      };
      
      // Remove password from update if empty
      if (modalMode === 'edit' && !submitData.password) {
        delete submitData.password;
      }
      
      if (modalMode === 'create') {
        await userService.createUser(submitData);
        alert('User created successfully!');
      } else if (modalMode === 'edit') {
        const userId = selectedUser.Id || selectedUser.id;
        await userService.updateUser(userId, submitData);
        alert('User updated successfully!');
      }
      
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      
      let errorMessage = 'Failed to save user';
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
    if (!selectedUser) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUser.FullName || selectedUser.fullName}?`
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const userId = selectedUser.Id || selectedUser.id;
      await userService.deleteUser(userId);
      alert('User deleted successfully!');
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'Failed to delete user';
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

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUserStatus(userId, { isActive: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers Management</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and information</p>
          </div>
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="text-blue-600" size={24} />
              </div>
              <span className="font-semibold text-gray-700">Total Customers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">All registered users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <span className="font-semibold text-gray-700">Active Customers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">
              {totalUsers > 0 ? ((stats.active / totalUsers) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <span className="font-semibold text-gray-700">Avg. Spending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">$1,245</p>
            <p className="text-sm text-gray-500 mt-2">Per customer</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <form onSubmit={handleSearch} className="flex-1 min-w-[300px] flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Search
              </button>
            </form>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Roles</option>
              {Object.entries(UserRole).map(([key, value]) => (
                <option key={value} value={value}>{key}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader className="animate-spin text-orange-600 mx-auto mb-4" size={40} />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || roleFilter || statusFilter
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first customer'}
              </p>
              <button
                onClick={() => openModal('create')}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                <Plus size={20} />
                Add Customer
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Contact</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Joined</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const u = {
                        id: user.Id || user.id,
                        fullName: user.FullName || user.fullName,
                        email: user.Email || user.email,
                        phoneNumber: user.PhoneNumber || user.phoneNumber,
                        role: user.Role !== undefined ? user.Role : user.role,
                        isActive: user.IsActive !== undefined ? user.IsActive : user.isActive,
                        createdAt: user.CreatedAt || user.createdAt
                      };

                      const initials = u.fullName
                        ? u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                        : '?';

                      const joinDate = u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A';

                      return (
                        <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-orange-600">
                                  {initials}
                                </span>
                              </div>
                              <span className="font-medium">{u.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={14} />
                                {u.email}
                              </div>
                              {u.phoneNumber && (
                                <div className="flex items-center gap-2 text-gray-600 mt-1">
                                  <Phone size={14} />
                                  {u.phoneNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.role).class}`}>
                              {getRoleBadge(u.role).label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStatus(u.id, u.isActive)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{joinDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal('edit', user)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  handleDelete();
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create New Customer' : 'Edit Customer'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modalMode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={modalMode === 'edit' ? 'Leave empty to keep current password' : ''}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  {Object.entries(UserRole).map(([key, value]) => (
                    <option key={value} value={value}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Date of Birth and Nationality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Account
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t">
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
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {modalMode === 'create' ? 'Create Customer' : 'Update Customer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;