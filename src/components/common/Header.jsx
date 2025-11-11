import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasAdminAccess } from '../../utils/roleUtils';
import { Phone, Mail, User, Menu, X, Facebook, Instagram, Twitter, Linkedin, ChevronDown, BookOpen, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
      // Clear any remaining data
      window.location.reload(); // Reload to ensure clean state
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setShowUserMenu(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-md'
    }`}>
      {/* Top Bar - Social & Contact Info */}
      <div className={`${isScrolled ? 'hidden' : 'block'} border-b border-white/10`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex justify-between items-center text-sm">
            {/* Social Icons */}
            <div className="flex gap-2 items-center">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all"
              >
                <Facebook size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all"
              >
                <Twitter size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all"
              >
                <Instagram size={14} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500 hover:border-cyan-500 transition-all"
              >
                <Linkedin size={14} />
              </a>
            </div>

            {/* Contact Info & Actions */}
            <div className="flex items-center gap-6">
              <a href="tel:+41216340505" className="hidden md:flex items-center gap-2 text-white/80 hover:text-cyan-400 transition">
                <Phone size={14} />
                <span className="text-sm">+41 21 634 05 05</span>
              </a>
              <a href="mailto:Booking@alpsshiking.co" className="hidden lg:flex items-center gap-2 text-white/80 hover:text-cyan-400 transition">
                <Mail size={14} />
                <span className="text-sm">[email protected]</span>
              </a>
              
              {/* Language & Currency */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-white/80 hover:text-cyan-400 text-sm transition">
                  VIE <ChevronDown size={14} />
                </button>
                <button className="flex items-center gap-1 text-white/80 hover:text-cyan-400 text-sm transition">
                  VND <ChevronDown size={14} />
                </button>
              </div>

              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="hidden md:flex items-center gap-2 text-white/80 hover:text-cyan-400 transition text-sm"
                  >
                    <User size={16} />
                    <span>Đăng nhập</span>
                  </Link>
                </>
              ) : (
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-white/80 hover:text-cyan-400 transition text-sm"
                  >
                    <User size={16} />
                    <span>{user?.name || user?.email || 'Tài khoản'}</span>
                    <ChevronDown size={14} />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || user?.email}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      {hasAdminAccess(user?.role) && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} />
                          <span>Quản trị</span>
                        </Link>
                      )}
                      <Link
                        to="/bookings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <BookOpen size={16} />
                        <span>Lịch sử đặt</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`px-4 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo - CLEAN & LARGE */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img
              src="https://res.cloudinary.com/dosyknq32/image/upload/v1761962915/VanVivu_lifxyr.jpg"
              alt="Van Vi Vu Logo"
              className={`transition-all duration-300 object-contain rounded-lg ${
                isScrolled ? 'h-12 md:h-14' : 'h-14 md:h-16'
              } w-auto group-hover:scale-105 drop-shadow-lg`}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2.5 font-medium transition-all relative group ${
                isScrolled 
                  ? 'text-gray-800 hover:text-cyan-500' 
                  : 'text-white hover:text-cyan-400'
              }`}
            >
              Trang chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link 
              to="/tours" 
              className={`px-4 py-2.5 font-medium transition-all relative group ${
                isScrolled 
                  ? 'text-gray-700 hover:text-cyan-500' 
                  : 'text-white/90 hover:text-cyan-400'
              }`}
            >
              Tours
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link 
              to="/bookings" 
              className={`px-4 py-2.5 font-medium transition-all relative group flex items-center gap-2 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-cyan-500' 
                  : 'text-white/90 hover:text-cyan-400'
              }`}
            >
              <BookOpen size={18} />
              Lịch sử đặt
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            <a 
              href="#contact" 
              className={`px-4 py-2.5 font-medium transition-all relative group ${
                isScrolled 
                  ? 'text-gray-700 hover:text-cyan-500' 
                  : 'text-white/90 hover:text-cyan-400'
              }`}
            >
              Liên hệ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
            </a>

            {/* Become Expert Button */}
            <Link
              to="/expert"
              className="ml-4 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              Trở thành chuyên gia
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
            ) : (
              <Menu size={24} className={isScrolled ? 'text-gray-800' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className={`flex flex-col gap-2 pb-4 border-t ${isScrolled ? 'border-gray-200' : 'border-white/10'} pt-4`}>
            <Link 
              to="/" 
              className={`px-4 py-3 font-medium rounded-lg transition ${
                isScrolled 
                  ? 'text-gray-800 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              to="/tours" 
              className={`px-4 py-3 font-medium rounded-lg transition ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link 
              to="/bookings" 
              className={`px-4 py-3 font-medium rounded-lg transition flex items-center gap-2 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={18} />
              Lịch sử đặt
            </Link>
            <a 
              href="#contact" 
              className={`px-4 py-3 font-medium rounded-lg transition ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white/90 hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Liên hệ
            </a>
            <div className="mt-2 pt-2 border-t border-white/10">
              {!isAuthenticated ? (
                <Link 
                  to="/login" 
                  className={`px-4 py-3 font-medium rounded-lg transition flex items-center gap-2 ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Đăng nhập
                </Link>
              ) : (
                <>
                  <div className={`px-4 py-3 ${
                    isScrolled ? 'text-gray-700' : 'text-white/90'
                  }`}>
                    <p className="font-semibold">{user?.name || user?.email}</p>
                    <p className="text-sm opacity-75">{user?.email}</p>
                  </div>
                  {hasAdminAccess(user?.role) && (
                    <Link
                      to="/admin"
                      className={`px-4 py-3 font-medium rounded-lg transition flex items-center gap-2 ${
                        isScrolled 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Quản trị
                    </Link>
                  )}
                  <Link
                    to="/bookings"
                    className={`px-4 py-3 font-medium rounded-lg transition flex items-center gap-2 ${
                      isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen size={18} />
                    Lịch sử đặt
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await handleLogout();
                    }}
                    className={`w-full text-left px-4 py-3 font-medium rounded-lg transition flex items-center gap-2 ${
                      isScrolled 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-red-300 hover:bg-red-500/20'
                    }`}
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </>
              )}
              <Link
                to="/expert"
                className="mx-4 mt-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full text-center block hover:shadow-lg transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Trở thành chuyên gia
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;