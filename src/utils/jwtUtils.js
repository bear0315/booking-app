// Utility to decode JWT token and extract claims
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get user info from JWT token
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    userId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
            decoded['nameid'] || 
            decoded['sub'] ||
            decoded['userId'],
    email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
           decoded['email'],
    name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
          decoded['name'] ||
          decoded['unique_name'],
    role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
          decoded['role'] ||
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
    status: decoded['Status'] || decoded['status']
  };
};

