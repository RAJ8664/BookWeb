import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiMenu, FiSearch, FiBell, FiMoon, FiSun, FiSettings, FiX } from 'react-icons/fi';
import { FaChartBar, FaBook, FaUsers, FaPlus, FaEdit, FaBoxOpen, FaFileAlt } from 'react-icons/fa';
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { useGetAllOrdersQuery } from '../../redux/features/orders/ordersApi';
import { useFetchAllBooksQuery, useSearchBooksQuery } from '../../redux/features/books/booksAPI';
import { useGetUnreadRequestsCountQuery } from '../../redux/features/bookRequest/bookRequestApi';

// Add custom useWindowSize hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
};

const DashboardLayout = () => {
  const { width } = useWindowSize();
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Get saved preference from localStorage or default to true
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme preference from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch orders and books data for real notifications
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: booksData, isLoading: booksLoading } = useFetchAllBooksQuery();
  const { data: unreadRequestsData, isLoading: unreadRequestsLoading } = useGetUnreadRequestsCountQuery();
  const lastProcessedOrderRef = useRef(null);

  // Use RTK Query for search with debouncing
  const {
    data: apiSearchResults,
    isLoading: apiSearchLoading,
    isFetching: apiSearchFetching
  } = useSearchBooksQuery(searchQuery, {
    skip: searchQuery.length < 3
  });
  
  // Set search results from API
  useEffect(() => {
    if (apiSearchResults) {
      // Transform book search results to the format expected by the UI
      const formattedResults = apiSearchResults.map(book => ({
        type: 'book',
        title: book.title,
        id: book._id,
        coverImage: book.coverImage,
        author: book.author,
        price: book.price
      }));
      
      // Add order results if search term matches order data
      if (ordersData && searchQuery.length >= 3) {
        const orderResults = ordersData
          .filter(order => 
            order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .map(order => ({
            type: 'order',
            id: order._id,
            customer: order.name || 'Customer',
            email: order.email,
            total: order.totalPrice
          }));
        
        formattedResults.push(...orderResults);
      }
      
      setSearchResults(formattedResults);
      setIsSearching(false);
    }
  }, [apiSearchResults, ordersData, searchQuery]);
  
  // Generate real notifications based on orders and user activity
  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      // Sort orders by creation date (newest first)
      const sortedOrders = [...ordersData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Get the most recent order
      const latestOrder = sortedOrders[0];
      
      // Only create notification for new orders since last check
      if (lastProcessedOrderRef.current !== latestOrder._id) {
        // Generate notifications from recent orders
        const newNotifications = sortedOrders.slice(0, 5).map(order => {
          const orderTime = new Date(order.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now - orderTime);
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          let timeString = 'Just now';
          if (diffMinutes > 1 && diffMinutes < 60) {
            timeString = `${diffMinutes} minutes ago`;
          } else if (diffHours >= 1 && diffHours < 24) {
            timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else if (diffDays >= 1) {
            timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          }
          
          return {
            id: order._id,
            type: 'order',
            message: `New order from ${order.name} - ₹${order.totalPrice}`,
            time: timeString,
            read: false
          };
        });
        
        // Add notifications for book requests
        if (unreadRequestsData && unreadRequestsData.unreadCount > 0) {
          const bookRequestNotification = {
            id: `book-request-${Date.now()}`,
            type: 'book-request',
            message: `${unreadRequestsData.unreadCount} new book ${unreadRequestsData.unreadCount === 1 ? 'request' : 'requests'} pending review`,
            time: 'Just now',
            read: false,
            action: '/dashboard/manage-book-requests'
          };
          
          newNotifications.unshift(bookRequestNotification);
        }
        
        // Add notifications for new books (if any)
        if (booksData && booksData.length > 0) {
          // Use the 3 most recently added books
          const recentBooks = booksData.slice(0, 3);
          
          const bookNotifications = recentBooks.map((book, index) => ({
            id: `book-${book._id || book.id}`,
            type: 'book',
            message: `Book "${book.title}" is now available`,
            time: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
            read: false
          }));
          
          // Combine order and book notifications
          setNotifications(prev => {
            // Only add new notifications, don't duplicate existing ones
            const existingIds = prev.map(n => n.id);
            const combinedNotifications = [
              ...newNotifications.filter(n => !existingIds.includes(n.id)),
              ...bookNotifications.filter(n => !existingIds.includes(n.id)),
              ...prev
            ].slice(0, 20); // Keep only the 20 most recent notifications
            
            return combinedNotifications;
          });
        } else {
          // Just add order notifications if no book data
          setNotifications(prev => {
            const existingIds = prev.map(n => n.id);
            return [
              ...newNotifications.filter(n => !existingIds.includes(n.id)),
              ...prev
            ].slice(0, 20);
          });
        }
        
        // Update the last processed order
        if (latestOrder) {
          lastProcessedOrderRef.current = latestOrder._id;
        }
      }
    }
  }, [ordersData, booksData, unreadRequestsData]);
  
  useEffect(() => {
    // Apply dark mode to body when theme changes
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Save theme preference
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);
  
  // Collapse sidebar on small screens
  useEffect(() => {
    if (width < 768 && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else if (width >= 768 && !isSidebarOpen) {
      // Restore sidebar from localStorage on larger screens
      const savedState = localStorage.getItem('sidebarOpen');
      if (savedState !== null && JSON.parse(savedState)) {
        setIsSidebarOpen(true);
      }
    }
  }, [width, isSidebarOpen]);
  
  useEffect(() => {
    const fetchAdminInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAdminInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch admin info:", error);
        toast.error("Failed to authenticate admin session");
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate("/admin");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isNotificationsOpen) {
      // Mark all as read when closing
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      setIsSearching(true);
      // API search is handled by the RTK Query hook
    } else {
      setSearchResults([]);
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return <Loading />;
  }

  const rootClasses = isDarkMode 
    ? 'flex h-screen bg-gray-900 text-white' 
    : 'flex h-screen bg-gray-100';

  const sidebarClasses = isDarkMode
    ? `${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out fixed h-full z-10`
    : `${isSidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white transition-all duration-300 ease-in-out fixed h-full z-10`;

  const headerClasses = isDarkMode
    ? 'bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-700'
    : 'bg-white shadow-sm h-16 flex items-center justify-between px-6';

  return (
    <div className={rootClasses}>
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 border-b border-indigo-800">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/src/assets/logo.png" alt="Logo" className="h-8 w-8" />
            {isSidebarOpen && <span className="font-bold text-xl">BookWeb</span>}
          </Link>
          <button onClick={toggleSidebar} className="text-white focus:outline-none">
            <FiMenu size={24} />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <Link to="/dashboard" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaChartBar className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link to="/dashboard/add-new-book" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/add-new-book') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <HiViewGridAdd className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Add Book</span>}
            </Link>
            
            <Link to="/dashboard/bulk-upload" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/bulk-upload') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaPlus className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Bulk Upload</span>}
            </Link>
            
            <Link to="/dashboard/manage-books" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/manage-books') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <MdOutlineManageHistory className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Manage Books</span>}
            </Link>
            
            <Link to="/dashboard/manage-orders" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/manage-orders') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaBoxOpen className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Manage Orders</span>}
            </Link>
            
            <Link to="/dashboard/manage-book-requests" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/manage-book-requests') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaFileAlt className="h-5 w-5" />
              {isSidebarOpen && (
                <div className="ml-3 flex items-center">
                  <span>Book Requests</span>
                  {unreadRequestsData && unreadRequestsData.unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadRequestsData.unreadCount}
                    </span>
                  )}
                </div>
              )}
            </Link>
            
            <Link to="/dashboard/orders" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/orders') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaBook className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Orders</span>}
            </Link>
            
            <Link to="/dashboard/users" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/users') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FaUsers className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Users</span>}
            </Link>

            <Link to="/dashboard/settings" 
              className={`flex items-center p-3 rounded-lg transition-colors ${isActive('/dashboard/settings') ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <FiSettings className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Settings</span>}
            </Link>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-indigo-200 hover:bg-indigo-800 rounded-lg transition-colors">
              <FiLogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className={headerClasses}>
          <div className="flex items-center">
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className={`pl-10 pr-4 py-2 rounded-lg ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500'
                  : 'border border-gray-300 focus:ring-indigo-500'} focus:outline-none focus:ring-2 focus:border-transparent`}
              />
              {searchQuery.length > 2 && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-96 overflow-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  {isSearching || apiSearchLoading || apiSearchFetching ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No results found</p>
                  ) : (
                    <ul>
                      {searchResults.map((result, index) => (
                        <li key={index} className={`p-3 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer`}>
                          {result.type === 'book' && (
                            <div className="flex items-center" onClick={() => navigate(`/books/${result.id}`)}>
                              <div className="mr-3 bg-blue-100 text-blue-600 p-2 rounded-full">
                                <FaBook size={14} />
                              </div>
                              <div>
                                <p className="font-medium">{result.title}</p>
                                <p className="text-xs text-gray-500">by {result.author}</p>
                              </div>
                            </div>
                          )}
                          {result.type === 'user' && (
                            <div className="flex items-center" onClick={() => navigate(`/dashboard/users/${result.id}`)}>
                              <div className="mr-3 bg-green-100 text-green-600 p-2 rounded-full">
                                <FaUsers size={14} />
                              </div>
                              <div>
                                <p className="font-medium">{result.name}</p>
                                <p className="text-xs text-gray-500">User #{result.id}</p>
                              </div>
                            </div>
                          )}
                          {result.type === 'order' && (
                            <div className="flex items-center" onClick={() => navigate(`/dashboard/orders/${result.id}`)}>
                              <div className="mr-3 bg-amber-100 text-amber-600 p-2 rounded-full">
                                <FaBoxOpen size={14} />
                              </div>
                              <div>
                                <p className="font-medium">Order #{result.id.substring(0, 8)}</p>
                                <p className="text-xs text-gray-500">From {result.customer}</p>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} focus:outline-none`}
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={toggleNotifications} 
                className={`relative p-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-full focus:outline-none`}
              >
                <FiBell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => clearAllNotifications()}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className={`max-h-96 overflow-y-auto ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <ul>
                        {notifications.map(notification => (
                          <li 
                            key={notification.id} 
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-3 border-b ${
                              isDarkMode 
                                ? notification.read ? 'border-gray-700 bg-gray-800' : 'border-gray-700 bg-gray-700' 
                                : notification.read ? 'border-gray-100 bg-white' : 'border-gray-100 bg-blue-50'
                            } ${notification.action ? 'cursor-pointer hover:bg-opacity-90' : ''}`}
                          >
                            <div 
                              onClick={() => {
                                if (notification.action) {
                                  setIsNotificationsOpen(false);
                                  navigate(notification.action);
                                }
                              }}
                            >
                              <div className="flex items-start">
                                <div className={`mr-3 mt-1 p-2 rounded-full ${
                                  notification.type === 'order' 
                                    ? 'bg-blue-100 text-blue-600'
                                    : notification.type === 'book' 
                                      ? 'bg-green-100 text-green-600'
                                      : notification.type === 'book-request'
                                        ? 'bg-amber-100 text-amber-600'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {notification.type === 'order' && <FaBoxOpen size={14} />}
                                  {notification.type === 'book' && <FaBook size={14} />}
                                  {notification.type === 'book-request' && <FaFileAlt size={14} />}
                                  {notification.type !== 'order' && notification.type !== 'book' && notification.type !== 'book-request' && <FiBell size={14} />}
                                </div>
                                <div className="flex-1">
                                  <p className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {adminInfo?.name || 'Admin'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {adminInfo?.role || 'Administrator'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img 
                    src={adminInfo?.profilePicture || "/src/assets/profile.PNG"} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              
              {isProfileMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="py-1">
                    <Link 
                      to="/dashboard/profile" 
                      className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/dashboard/settings" 
                      className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
          {loading ? <Loading /> : <Outlet context={{ isDarkMode }} />}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;