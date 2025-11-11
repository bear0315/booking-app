// Role utility functions
// UserRole enum from backend: Customer = 0, Guide = 1, Staff = 2, Manager = 3, Admin = 4

export const isAdminRole = (role) => {
  return role === 'Admin' || role === 4;
};

export const isManagerRole = (role) => {
  return role === 'Manager' || role === 3;
};

export const isStaffRole = (role) => {
  return role === 'Staff' || role === 2;
};

export const isGuideRole = (role) => {
  return role === 'Guide' || role === 1;
};

export const isCustomerRole = (role) => {
  return role === 'Customer' || role === 0 || !role;
};

// Check if user has admin access (Admin, Manager, or Staff)
export const hasAdminAccess = (role) => {
  return isAdminRole(role) || isManagerRole(role) || isStaffRole(role);
};

// Get role name from enum value
export const getRoleName = (role) => {
  if (typeof role === 'number') {
    const roleMap = {
      0: 'Customer',
      1: 'Guide',
      2: 'Staff',
      3: 'Manager',
      4: 'Admin'
    };
    return roleMap[role] || 'Customer';
  }
  return role || 'Customer';
};

