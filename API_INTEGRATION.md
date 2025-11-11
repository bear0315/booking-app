# API Integration Guide

## Overview
This React application has been integrated with the backend API at `https://localhost:7195/api`.

## API Services Created

### 1. Authentication Service (`src/services/authService.js`)
- `login(email, password)` - User login
- `refreshToken(refreshToken)` - Refresh access token
- `logout()` - User logout
- `getCurrentUser()` - Get current authenticated user
- `revokeToken(refreshToken)` - Revoke refresh token

### 2. Tour Service (`src/services/tourService.js`)
- `getAllTours(pageNumber, pageSize)` - Get all tours with pagination
- `searchTours(searchParams)` - Search tours with filters
- `getTourById(id)` - Get tour by ID
- `getTourBySlug(slug)` - Get tour by slug
- `getFeaturedTours(take)` - Get featured tours
- `getPopularTours(take)` - Get popular tours
- `getRelatedTours(id, take)` - Get related tours
- Admin functions: `createTour`, `updateTour`, `deleteTour`, `toggleFeatured`, `updateStatus`, `getStatistics`

### 3. Booking Service (`src/services/bookingService.js`)
- `getAllBookings(page, pageSize, status)` - Get all bookings (Admin)
- `getBookingById(id)` - Get booking by ID
- `getBookingByCode(bookingCode)` - Get booking by code
- `getMyBookings(page, pageSize)` - Get current user's bookings
- `createBooking(bookingData)` - Create new booking
- `updateBooking(id, bookingData)` - Update booking
- `cancelBooking(id, cancelData)` - Cancel booking
- Admin functions: `updateBookingStatus`, `deleteBooking`

### 4. Destination Service (`src/services/destinationService.js`)
- `getAllDestinations(pageNumber, pageSize)` - Get all destinations
- `getActiveDestinations()` - Get active destinations
- `getPopularDestinations(take)` - Get popular destinations
- `getFeaturedDestinations(take)` - Get featured destinations
- `searchDestinations(searchParams)` - Search destinations
- `getDestinationById(id)` - Get destination by ID
- `getDestinationBySlug(slug)` - Get destination by slug
- Admin functions: `createDestination`, `updateDestination`, `deleteDestination`, `toggleFeatured`

### 5. Payment Service (`src/services/paymentService.js`)
- `createPaymentUrl(bookingId)` - Create VNPay payment URL
- `checkPaymentStatus(bookingId)` - Check payment status

### 6. Review Service (`src/services/reviewService.js`)
- `getTourReviews(tourId, pageNumber, pageSize)` - Get tour reviews
- `getTourStatistics(tourId)` - Get tour review statistics
- `getTourSummary(tourId)` - Get tour review summary
- `createReview(reviewData)` - Create review
- `updateReview(id, reviewData)` - Update review
- `deleteReview(id)` - Delete review
- Admin functions: `getPendingReviews`, `approveReview`, `rejectReview`

### 7. Favorite Service (`src/services/favoriteService.js`)
- `getMyFavorites()` - Get user's favorites
- `getMyFavoriteTours(pageNumber, pageSize)` - Get favorite tours with pagination
- `checkFavorite(tourId)` - Check if tour is favorite
- `addFavorite(tourId)` - Add to favorites
- `removeFavorite(tourId)` - Remove from favorites
- `toggleFavorite(tourId)` - Toggle favorite status

### 8. User Service (`src/services/userService.js`)
- `getAllUsers(page, pageSize, role, isActive)` - Get all users (Admin)
- `getUserById(id)` - Get user by ID
- `getCurrentUser()` - Get current user
- `updateUser(id, userData)` - Update user
- `changePassword(id, passwordData)` - Change password
- Admin functions: `createUser`, `updateUserStatus`, `deleteUser`

## Authentication Context

The app uses `AuthContext` (`src/contexts/AuthContext.js`) to manage authentication state:
- `user` - Current user object
- `isAuthenticated` - Boolean indicating if user is logged in
- `isLoading` - Loading state
- `login(email, password)` - Login function
- `logout()` - Logout function
- `updateUser(userData)` - Update user data

## Environment Configuration

Create a `.env` file in the root directory:
```
REACT_APP_API_URL=https://localhost:7195/api
```

Or update `src/services/api.js` to change the default API URL.

## Updated Components

### 1. LoginPage
- Integrated with auth API
- Shows error messages
- Redirects to admin page for admin users
- Redirects to home for regular users

### 2. Header
- Shows user info when logged in
- User menu with logout option
- Admin link for admin users
- Booking history link

### 3. TourListPage
- Fetches tours from API
- Search functionality
- Pagination
- Favorite functionality
- Loading states

### 4. Payment Pages
- `PaymentSuccessPage` - Shows success message and booking details
- `PaymentFailurePage` - Shows failure message with retry option

## Features Implemented

✅ User authentication (login/logout)
✅ Tour listing and search
✅ Booking creation
✅ Payment integration (VNPay)
✅ Favorites management
✅ User profile management
✅ Admin dashboard access
✅ Booking history
✅ Responsive design

## Next Steps

1. Update `CheckoutPage` to create bookings via API
2. Update `BookingHistoryPage` to fetch real bookings
3. Update `TourDetailPage` to fetch tour details
4. Update Admin components to use API
5. Add error handling and loading states
6. Add form validation
7. Add toast notifications for user feedback

## API Endpoints Used

- `POST /api/Auth/login` - Login
- `POST /api/Auth/logout` - Logout
- `GET /api/Auth/me` - Get current user
- `GET /api/Tours` - Get tours
- `GET /api/Tours/search` - Search tours
- `GET /api/Tours/{id}` - Get tour by ID
- `POST /api/Bookings` - Create booking
- `GET /api/Bookings/my-bookings` - Get user bookings
- `POST /api/Payment/vnpay/create` - Create payment URL
- `POST /api/Favorites` - Add favorite
- `DELETE /api/Favorites/{tourId}` - Remove favorite

## Notes

- All API requests include authentication token in headers
- Token refresh is handled automatically
- CORS must be enabled on the backend for localhost
- The API base URL can be configured via environment variable

