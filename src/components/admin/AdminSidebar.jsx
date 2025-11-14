import React from 'react';
import {
  MapPin,
  LogOut,
  User,
  X,
  LayoutDashboard,
  ShoppingBag,
  Users as UsersIcon,
  Settings
} from 'lucide-react';
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
const AdminSidebar = ({
  activePage,
  setActivePage,
  isSidebarOpen,
  setIsSidebarOpen,
   
  isScrolled = false, 
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    { id: 'tours', icon: MapPin, label: 'Tour du lịch' },
    { id: 'bookings', icon: ShoppingBag, label: 'Đơn đặt tour' },
    { id: 'customers', icon: UsersIcon, label: 'Khách hàng' },
    { id: 'settings', icon: Settings, label: 'Cài đặt' }
  ];

  return (
    <>
      {/* Overlay trên mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActivePage('dashboard')}
            >
              <img
                src="https://res.cloudinary.com/dosyknq32/image/upload/v1761962915/VanVivu_lifxyr.jpg"
                alt="Van Vi Vu Logo"
                className="h-14 w-auto rounded-xl object-contain shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
              />
              <span className="font-bold text-lg text-white tracking-wide group-hover:text-orange-400 transition-colors">
                Van Vi Vu
              </span>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors
                  ${
                    activePage === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Hồ sơ người dùng + Đăng xuất */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Quản trị viên</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>

            {}
            <button
              onClick={async () => {
                setIsSidebarOpen(false);
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
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
