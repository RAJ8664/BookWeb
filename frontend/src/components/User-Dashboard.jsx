import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { FaBoxOpen, FaHeart, FaCog, FaHistory, FaUserCircle, FaImage, FaShoppingBag, FaSearch, FaBook, FaHome } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setOrders, setOrderLoading } from '../redux/features/orders/ordersSlice';
import { useGetOrderByEmailQuery } from '../redux/features/orders/ordersApi';
import avatarImg from '../assets/avatar.png';
import Swal from 'sweetalert2';

const UserDashboard = () => {
  const { user, logout, uploadProfilePicture } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get wishlist items from Redux store
  const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
  
  // Get orders from Redux store
  const { orders, loading: ordersLoading } = useSelector(state => state.orders);
  
  // Fetch actual orders using RTK Query
  const { 
    data: apiOrders, 
    isLoading: apiOrdersLoading, 
    isError: apiOrdersError 
  } = useGetOrderByEmailQuery(user?.email, {
    skip: !user?.email
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Orders", value: "0", icon: <FaBoxOpen />, color: "bg-blue-100 text-blue-600" },
    { title: "Wishlist Items", value: "0", icon: <FaHeart />, color: "bg-pink-100 text-pink-600" },
    { title: "Account Status", value: "Active", icon: <FaUserCircle />, color: "bg-green-100 text-green-600" },
  ]);

  // Address form state
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    phone: ''
  });
  
  // Loading saved address on component mount
  useEffect(() => {
    if (user?.email) {
      const savedAddress = localStorage.getItem(`address_${user.email}`);
      if (savedAddress) {
        setAddressData(JSON.parse(savedAddress));
      }
    }
  }, [user]);

  // Fetch user's data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        dispatch(setOrderLoading(true));
        
        if (apiOrders) {
          // Use real orders from API
          dispatch(setOrders(apiOrders));
        }
        
        setLoading(false);
        dispatch(setOrderLoading(false));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        dispatch(setOrderLoading(false));
      }
    };
    
    fetchUserData();
  }, [user, dispatch, apiOrders]);
  
  // Update stats when orders or wishlist changes
  useEffect(() => {
    setStats([
      { title: "Total Orders", value: orders.length.toString(), icon: <FaBoxOpen />, color: "bg-blue-100 text-blue-600" },
      { title: "Wishlist Items", value: wishlistItems.length.toString(), icon: <FaHeart />, color: "bg-pink-100 text-pink-600" },
      { title: "Account Status", value: "Active", icon: <FaUserCircle />, color: "bg-green-100 text-green-600" },
    ]);
  }, [orders, wishlistItems]);

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

  // Handle address form input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save address to localStorage
  const saveAddress = () => {
    if (user?.email) {
      localStorage.setItem(`address_${user.email}`, JSON.stringify(addressData));
      Swal.fire({
        title: 'Success!',
        text: 'Your address has been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color based on order status
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Loading state
  if (loading || apiOrdersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
                  className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-lg hover:scale-105 transition-transform object-cover"
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
              { path: "/userdashboard", icon: <FaUserCircle />, text: "Dashboard" },
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

          {/* Address Management */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaHome className="text-blue-600 p-2 bg-blue-100 rounded-full" />
              My Delivery Address
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Address/Street</label>
                  <input 
                    type="text"
                    name="street"
                    value={addressData.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">City</label>
                  <input 
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={addressData.phone}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">State/Province</label>
                  <input 
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Country</label>
                    <input 
                      type="text"
                      name="country"
                      value={addressData.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Country"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-gray-700 font-medium">Zipcode</label>
                    <input 
                      type="text"
                      name="zipcode"
                      value={addressData.zipcode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Zipcode"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveAddress}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaHistory className="text-purple-600 p-2 bg-purple-100 rounded-full" />
              Recent Orders
            </h3>
            
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.slice(0, 3).map((order) => (
                  <div 
                    key={order._id || order.id} 
                    className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Order #{order._id?.substring(0, 8) || order.id}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt || order.date)}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.products ? `${order.products.length} ${order.products.length === 1 ? 'item' : 'items'}` :
                         order.items ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{order.totalPrice || (order.total?.replace(/[^\d.]/g, '') || '0')}
                      </p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium mt-2 ${getStatusColor(order.status)}`}>
                        {order.status || 'Processing'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FaShoppingBag className="text-4xl text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-1">You haven't placed any orders yet</p>
                  <Link to="/" className="mt-3 text-blue-500 hover:text-blue-700 font-medium">
                    Browse Books
                  </Link>
                </div>
              )}
              
              {orders.length > 0 && (
                <Link 
                  to="/orders" 
                  className="flex items-center justify-center mt-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Orders <span className="ml-1">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Wishlist Preview */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaHeart className="text-pink-600 p-2 bg-pink-100 rounded-full" />
              Wishlist Items
            </h3>
            
            {wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlistItems.slice(0, 4).map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-all group"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl group-hover:scale-105 transition-transform flex items-center justify-center">
                      {item.coverImage ? (
                        <img 
                          src={item.coverImage} 
                          alt={item.title} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <FaBook className="text-2xl text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1 truncate">{item.author}</p>
                      <p className="text-blue-600 font-medium mt-2">
                        {item.formattedPrice || `₹${item.price?.toFixed(2) || '0.00'}`}
                      </p>
                    </div>
                  </div>
                ))}
                
                {wishlistItems.length > 4 && (
                  <Link 
                    to="/wishlist" 
                    className="flex items-center justify-center col-span-full mt-4 py-2 text-pink-600 hover:text-pink-800 font-medium"
                  >
                    View All Wishlist Items <span className="ml-1">→</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FaSearch className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 mb-1">Your wishlist is empty</p>
                <Link to="/" className="mt-3 text-blue-500 hover:text-blue-700 font-medium">
                  Discover Books
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <FaCog className="text-gray-600 p-2 bg-gray-100 rounded-full" />
              Quick Actions
            </h3>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/settings"
                className="px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
              >
                <FaUserCircle className="text-lg" />
                Account Settings
              </Link>

              <button 
                onClick={handleLogout}
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
