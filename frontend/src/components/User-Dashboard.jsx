import React from 'react';
import { useAuth } from "../context/AuthContext";
import { FaBoxOpen, FaHeart, FaCog, FaHistory, FaUserCircle, FaImage} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import avatarImg from '../assets/avatar.png';
import Swal from 'sweetalert2';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const stats = [
    { title: "Total Orders", value: "4", icon: <FaBoxOpen />, color: "bg-blue-100 text-blue-600" },
    { title: "Wishlist Items", value: "12", icon: <FaHeart />, color: "bg-pink-100 text-pink-600" },
    { title: "Account Status", value: "Active", icon: <FaUserCircle />, color: "bg-green-100 text-green-600" },
  ];

  const recentOrders = [
    { id: '#1234', date: '2023-07-15', total: 'NPR 2450', status: 'Delivered' },
    { id: '#1235', date: '2023-07-18', total: 'NPR 1850', status: 'Processing' },
  ];

  const wishlistItems = [
    { title: 'The Great Novel', author: 'Author Name', price: 'NPR 1200' },
    { title: 'Science Fundamentals', author: 'Science Writer', price: 'NPR 1500' },
  ];

  const { uploadProfilePicture } = useAuth();

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while your profile picture is being uploaded.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      await uploadProfilePicture(file);
  
      // Close loader manually because it's async
      Swal.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        Welcome back, <span className="text-gray-900">{user?.displayName || "User"}</span> 👋
      </h1>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 group hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center relative">
              <div className="relative">
                <img 
                  src={user?.photoURL || avatarImg} 
                  alt="User avatar" 
                  className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-lg hover:scale-105 transition-transform"
                />
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition">
                  <FaImage className="text-blue-600" />
                  <input type="file" className="hidden" onChange={handlePhotoChange} />
                </label>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.displayName || "User"}</h2>
              <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 space-y-2">
            {[
              { path: "/dashboard", icon: <FaUserCircle />, text: "Dashboard" },
              { path: "/orders", icon: <FaHistory />, text: "Order History" },
              { path: "/wishlist", icon: <FaHeart />, text: "Wishlist" },
              { path: "/settings", icon: <FaCog />, text: "Settings" },
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r from-blue-50 to-purple-50 transition-all group"
              >
                <span className="text-xl text-blue-600 group-hover:text-purple-600">{link.icon}</span>
                <span className="text-gray-700 group-hover:text-gray-900 font-medium">{link.text}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`${stat.color} p-6 rounded-2xl flex items-center justify-between transform hover:-translate-y-1 transition-all shadow-sm hover:shadow-md`}
              >
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl p-3 rounded-full bg-white/30">{stat.icon}</span>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaHistory className="text-purple-600 p-2 bg-purple-100 rounded-full" />
              Recent Orders
            </h3>
            
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900">Order {order.id}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.total}</p>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wishlist Preview */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaHeart className="text-pink-600 p-2 bg-pink-100 rounded-full" />
              Wishlist Items
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlistItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-all group"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl group-hover:scale-105 transition-transform"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.author}</p>
                    <p className="text-blue-600 font-medium mt-2">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaCog className="text-gray-600 p-2 bg-gray-100 rounded-full" />
              Quick Actions
            </h3>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/update-profile"
                className="px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
              >
                <FaUserCircle className="text-lg" />
                Edit Profile
              </Link>

              <button 
                onClick={logout}
                className="px-6 py-3 bg-gradient-to-r from-red-100 to-pink-100 text-red-600 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
              >
                <FiLogOut className="text-lg" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
