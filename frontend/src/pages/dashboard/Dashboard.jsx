import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Loading from '../../components/Loading';
import { FaBook, FaShoppingCart, FaChartLine, FaUsers, FaDownload, FaFilter, FaCalendarAlt, FaAngleDown, FaTrash } from 'react-icons/fa';
import { MdTrendingUp, MdRefresh } from 'react-icons/md';
import RevenueChart from './RevenueChart';
import { toast } from 'react-toastify';
import { useGetAllOrdersQuery, useResetAllOrdersMutation } from '../../redux/features/orders/ordersApi';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksAPI';
import Swal from 'sweetalert2';

// Removed mock websocket code

const Dashboard = () => {
    const { isDarkMode } = useOutletContext() || { isDarkMode: false };
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({});
    const [dateRange, setDateRange] = useState('today');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [topCustomers, setTopCustomers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    
    // Fetch orders using Redux query hook
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetAllOrdersQuery();
    const [resetAllOrders, { isLoading: resetLoading }] = useResetAllOrdersMutation();
    
    // Fetch all books to get the total count
    const { data: booksData, isLoading: booksLoading } = useFetchAllBooksQuery();
    
    // Debug data
    useEffect(() => {
        if (booksData) {
            console.log("Total books count:", Array.isArray(booksData) ? booksData.length : "Books data not an array");
        }
    }, [booksData]);
    
    // Calculate dashboard statistics from orders
    useEffect(() => {
        if (ordersData) {
            calculateDashboardStats(ordersData);
        }
    }, [ordersData, booksData]);
    
    // Calculate statistics based on order data
    const calculateDashboardStats = (orders) => {
        // Get total books from the books API response
        const totalBooksCount = Array.isArray(booksData) ? booksData.length : 0;
        
        if (!orders || orders.length === 0) {
            setData({
                totalBooks: totalBooksCount,
                totalSales: 0,
                totalOrders: 0,
                trendingBooks: Math.ceil(totalBooksCount * 0.1) // Estimate 10% as trending if no orders
            });
            setTopCustomers([]);
            return;
        }
        
        // Filter orders by date range if needed
        let filteredOrders = orders;
        if (dateRange === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filteredOrders = orders.filter(order => 
                new Date(order.createdAt).toISOString().split('T')[0] === today
            );
        } else if (dateRange === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredOrders = orders.filter(order => 
                new Date(order.createdAt) >= weekAgo
            );
        } else if (dateRange === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredOrders = orders.filter(order => 
                new Date(order.createdAt) >= monthAgo
            );
        } else if (dateRange === 'custom') {
            const startDate = new Date(customDateRange.startDate);
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            
            filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate && orderDate <= endDate;
            });
        }
        
        // Calculate total sales
        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        // Count total books sold in orders
        const soldBooks = filteredOrders.reduce((sum, order) => {
            // If order has products array with quantity
            if (order.products && Array.isArray(order.products)) {
                return sum + order.products.reduce((productsSum, product) => 
                    productsSum + (parseInt(product.quantity) || 1), 0
                );
            }
            // If order has productIds array
            else if (order.productIds && Array.isArray(order.productIds)) {
                return sum + order.productIds.length;
            }
            // Fallback if no product data
            return sum;
        }, 0);
        
        // Calculate top customers
        const customerMap = {};
        filteredOrders.forEach(order => {
            const customerEmail = order.email;
            if (!customerMap[customerEmail]) {
                customerMap[customerEmail] = {
                    name: order.name,
                    email: customerEmail,
                    orderCount: 0,
                    totalSpent: 0
                };
            }
            customerMap[customerEmail].orderCount++;
            customerMap[customerEmail].totalSpent += (order.totalPrice || 0);
        });
        
        const topCustomersList = Object.values(customerMap)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
        
        // Find trending books
        const productFrequency = {};
        
        // Count how many times each product appears in orders
        filteredOrders.forEach(order => {
            if (order.products && Array.isArray(order.products)) {
                order.products.forEach(product => {
                    const productId = product.id || product._id;
                    if (productId) {
                        productFrequency[productId] = (productFrequency[productId] || 0) + 1;
                    }
                });
            } else if (order.productIds && Array.isArray(order.productIds)) {
                order.productIds.forEach(productId => {
                    if (productId) {
                        productFrequency[productId] = (productFrequency[productId] || 0) + 1;
                    }
                });
            }
        });
        
        // Count products ordered more than once (trending)
        const trendingBooksCount = Object.values(productFrequency).filter(count => count > 1).length;
        
        setData({
            totalBooks: totalBooksCount,
            soldBooks: soldBooks, 
            totalSales: totalSales,
            totalOrders: filteredOrders.length,
            trendingBooks: trendingBooksCount || Math.ceil(totalBooksCount * 0.1) // Use 10% as fallback
        });
        
        setTopCustomers(topCustomersList);
    };

    // Fetch initial data
    useEffect(() => {
        if (ordersData) {
            calculateDashboardStats(ordersData);
            setLoading(false);
        }
    }, [dateRange, customDateRange, ordersData]);

    // Refresh data with animation
    const refreshData = async () => {
        setRefreshing(true);
        try {
            await refetchOrders();
            toast.success('Dashboard data refreshed');
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setTimeout(() => setRefreshing(false), 500);
        }
    };

    // Sort orders
    const sortedOrders = React.useMemo(() => {
        if (!ordersData) return [];
        
        let sortableOrders = [...ordersData].map(order => ({
            id: order._id,
            customer: order.name,
            date: order.createdAt || order.date,
            amount: order.totalPrice || 0,
            status: order.status || 'Pending'
        }));
        
        if (sortConfig.key) {
            sortableOrders.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableOrders;
    }, [ordersData, sortConfig]);

    // Request sort
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter orders by status
    const filteredOrders = React.useMemo(() => {
        if (filterStatus === 'all') return sortedOrders.slice(0, 10); // Show only 10 most recent orders
        return sortedOrders
            .filter(order => order.status.toLowerCase() === filterStatus.toLowerCase())
            .slice(0, 10);
    }, [sortedOrders, filterStatus]);

    // Export data as CSV
    const exportData = async (format = 'csv') => {
        if (!ordersData || ordersData.length === 0) {
            toast.error('No data to export');
            return;
        }
        
        setIsExporting(true);
        try {
            // Headers
            const headers = ['ID', 'Customer', 'Date', 'Amount', 'Status'];
            
            // Convert orders to CSV
            const ordersData = sortedOrders.map(order => 
                [order.id, order.customer, new Date(order.date).toLocaleDateString(), `₹${order.amount}`, order.status]
            );
            
            // Combine headers and data
            const csvContent = [
                headers.join(','),
                ...ordersData.map(row => row.join(','))
            ].join('\n');
            
            // Create a downloadable blob
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success(`Orders exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    // Reset all order data and statistics
    const handleResetAllData = () => {
      Swal.fire({
        title: 'Reset All Order Data',
        html: `
          <p>Are you sure you want to reset all order data?</p>
          <p class="mt-2 text-sm text-red-600 font-bold">WARNING: This action cannot be undone!</p>
          <p class="mt-2 text-sm text-gray-600">This will delete all order history and reset all sales statistics.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset everything!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return Swal.fire({
            title: 'Enter "RESET" to confirm',
            input: 'text',
            inputPlaceholder: 'RESET',
            inputValidator: (value) => {
              if (value !== 'RESET') {
                return 'You need to type "RESET" to proceed';
              }
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
          }).then(result => {
            if (result.isConfirmed) {
              return true;
            }
            return false;
          });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setIsResetting(true);
          resetAllOrders()
            .unwrap()
            .then((response) => {
              // Reset local statistics
              setData({
                totalBooks: data.totalBooks, // Keep books count
                soldBooks: 0,
                totalSales: 0,
                totalOrders: 0,
                trendingBooks: 0
              });
              
              setTopCustomers([]);
              
              Swal.fire(
                'Reset Complete!',
                `Successfully deleted ${response.deletedCount} orders and reset all statistics.`,
                'success'
              );
              
              // Refresh data
              refetchOrders();
            })
            .catch((error) => {
              Swal.fire(
                'Error!',
                error?.data?.message || 'Failed to reset order data. Please try again.',
                'error'
              );
            })
            .finally(() => {
              setIsResetting(false);
            });
        }
      });
    };

    if(loading || ordersLoading || booksLoading || isResetting) return <Loading/>;

    const formattedNumbers = {
        totalBooks: data?.totalBooks?.toLocaleString() || '0',
        soldBooks: data?.soldBooks?.toLocaleString() || '0',
        totalSales: data?.totalSales?.toLocaleString() || '0',
        trendingBooks: data?.trendingBooks?.toLocaleString() || '0',
        totalOrders: data?.totalOrders?.toLocaleString() || '0'
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
            {/* Header with date filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 md:mb-0`}>
                    Dashboard Overview
                </h1>
                
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                            } border border-gray-300 shadow-sm`}
                        >
                            <FaCalendarAlt className={isDarkMode ? 'text-gray-300' : 'text-gray-500'} />
                            <span>
                                {dateRange === 'today' ? 'Today' : 
                                dateRange === 'yesterday' ? 'Yesterday' : 
                                dateRange === 'week' ? 'This Week' : 
                                dateRange === 'month' ? 'This Month' : 
                                dateRange === 'year' ? 'This Year' : 
                                'Custom Range'}
                            </span>
                            <FaAngleDown className={isDarkMode ? 'text-gray-300' : 'text-gray-500'} />
                        </button>
                        
                        {isDatePickerOpen && (
                            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 ${
                                isDarkMode ? 'bg-gray-700' : 'bg-white'
                            } ring-1 ring-black ring-opacity-5`}>
                                <div className="py-1">
                                    {['today', 'yesterday', 'week', 'month', 'year', 'custom'].map((range) => (
                                        <button
                                            key={range}
                                            className={`block px-4 py-2 text-sm w-full text-left ${
                                                isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                                            } ${dateRange === range ? 'font-bold' : ''}`}
                                            onClick={() => {
                                                setDateRange(range);
                                                setIsDatePickerOpen(false);
                                            }}
                                        >
                                            {range === 'today' ? 'Today' : 
                                            range === 'yesterday' ? 'Yesterday' : 
                                            range === 'week' ? 'This Week' : 
                                            range === 'month' ? 'This Month' : 
                                            range === 'year' ? 'This Year' : 
                                            'Custom Range'}
                                        </button>
                                    ))}
                                    
                                    {dateRange === 'custom' && (
                                        <div className="px-4 py-2 space-y-2">
                                            <div>
                                                <label className={`block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Start Date
                                                </label>
                                                <input 
                                                    type="date" 
                                                    value={customDateRange.startDate}
                                                    onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                                                    className={`w-full p-1 text-sm rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    End Date
                                                </label>
                                                <input 
                                                    type="date" 
                                                    value={customDateRange.endDate}
                                                    onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                                                    className={`w-full p-1 text-sm rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={refreshData}
                        disabled={refreshing}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                            isDarkMode 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <MdRefresh className={`${refreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    
                    <button 
                        onClick={handleResetAllData}
                        disabled={resetLoading}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                            isDarkMode 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                        } ${resetLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FaTrash />
                        <span>Reset Data</span>
                    </button>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className={`rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <FaBook className="text-xl" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>Total Books</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{formattedNumbers.totalBooks}</h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formattedNumbers.soldBooks} sold
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className={`rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <FaChartLine className="text-xl" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>Total Sales</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹{formattedNumbers.totalSales}</h3>
                        </div>
                    </div>
                </div>
                
                <div className={`rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <MdTrendingUp className="text-xl" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>Trending Books</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{formattedNumbers.trendingBooks}</h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Popular items
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className={`rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                            <FaShoppingCart className="text-xl" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>Total Orders</p>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{formattedNumbers.totalOrders}</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2">
                    <RevenueChart orderData={ordersData || []} />
                </div>
                
                {/* Top Customers */}
                <div className={`rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}>
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Top Customers</h2>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                        {topCustomers.length > 0 ? (
                            <ul className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                {topCustomers.map((customer, index) => (
                                    <li key={index} className={`p-4 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 mr-3 flex items-center justify-center">
                                                <span className="text-xl font-bold text-gray-700">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                                    {customer.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'}
                                                </p>
                                            </div>
                                            <div className={`inline-flex items-center text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                ₹{customer.totalSpent.toFixed(2)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No customer data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Recent Orders */}
            <div className={`rounded-lg shadow-md mb-8 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center flex-wrap gap-2`}>
                    <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Orders</h2>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button
                                className={`flex items-center px-3 py-1.5 text-sm rounded-lg ${
                                    isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                onClick={() => setFilterStatus(prev => prev === 'all' ? 'Pending' : 'all')}
                            >
                                <FaFilter className="mr-2" />
                                {filterStatus === 'all' ? 'All Status' : `${filterStatus}`}
                            </button>
                        </div>
                        <button 
                            className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => exportData('csv')}
                            disabled={isExporting}
                        >
                            <FaDownload className="mr-2" />
                            {isExporting ? 'Exporting...' : 'Export'}
                        </button>
                    </div>
                </div>
                
                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                            <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                                <tr>
                                    <th 
                                        onClick={() => requestSort('id')}
                                        className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                                    >
                                        Order ID
                                    </th>
                                    <th 
                                        onClick={() => requestSort('customer')}
                                        className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                                    >
                                        Customer
                                    </th>
                                    <th 
                                        onClick={() => requestSort('date')}
                                        className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                                    >
                                        Date
                                    </th>
                                    <th 
                                        onClick={() => requestSort('amount')}
                                        className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                                    >
                                        Amount
                                    </th>
                                    <th 
                                        onClick={() => requestSort('status')}
                                        className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                                    >
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${isDarkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}`}>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className={isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {order.id.substring(0, 10)}...
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {order.customer}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            ₹{order.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                order.status === 'refund_processing' ? 'bg-amber-100 text-amber-800' :
                                                order.status === 'Refunded' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status?.replace('_', ' ') || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No orders found
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;