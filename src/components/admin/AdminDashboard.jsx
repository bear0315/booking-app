import React, { useState } from 'react';
import { DollarSign, ShoppingBag, Users, MapPin } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tổng quan bảng điều khiển</h1>

      {/* Thẻ thống kê */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tổng doanh thu */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-orange-500" size={24} />
            </div>
            <span className="text-green-500 text-sm font-semibold">+12%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng doanh thu</h3>
          <p className="text-2xl font-bold">$45,231</p>
        </div>

        {/* Tổng số lượt đặt tour */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-blue-500" size={24} />
            </div>
            <span className="text-green-500 text-sm font-semibold">+8%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng lượt đặt tour</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>

        {/* Tổng khách hàng */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-500" size={24} />
            </div>
            <span className="text-green-500 text-sm font-semibold">+23%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tổng khách hàng</h3>
          <p className="text-2xl font-bold">8,549</p>
        </div>

        {/* Tour đang hoạt động */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="text-purple-500" size={24} />
            </div>
            <span className="text-green-500 text-sm font-semibold">+5%</span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Tour đang hoạt động</h3>
          <p className="text-2xl font-bold">42</p>
        </div>
      </div>

      {/* Danh sách đặt tour gần đây */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Đặt tour gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Khách hàng</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Tour</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Ngày</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Số tiền</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Doe', tour: 'Hành trình Matterhorn', date: '15 Tháng 6, 2025', amount: '$299', status: 'Đã xác nhận' },
                { name: 'Jane Smith', tour: 'Vòng quanh Mont Blanc', date: '20 Tháng 6, 2025', amount: '$499', status: 'Chờ xử lý' },
                { name: 'Mike Johnson', tour: 'Phiêu lưu Dolomites', date: '25 Tháng 6, 2025', amount: '$399', status: 'Đã xác nhận' }
              ].map((booking, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{booking.name}</td>
                  <td className="py-3 px-4">{booking.tour}</td>
                  <td className="py-3 px-4">{booking.date}</td>
                  <td className="py-3 px-4 font-semibold">{booking.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'Đã xác nhận'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
