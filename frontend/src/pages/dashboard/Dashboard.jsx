import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Loading from '../../components/Loading';
import getBaseUrl from '../../utils/baseURL';
import { FaBook, FaShoppingCart, FaChartLine, FaUsers, FaDownload, FaFilter, FaCalendarAlt, FaAngleDown } from 'react-icons/fa';
import { MdTrendingUp, MdRefresh } from 'react-icons/md';
import RevenueChart from './RevenueChart';
import { toast } from 'react-toastify';

// Mock websocket connection for real-time updates
const mockWebsocket = {
  addEventListener: (event, callback) => {
    if (event === 'message') {
      // Mock a new order coming in every 30 seconds
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          callback({
            data: JSON.stringify({
              type: 'new_order',
              data: {
                id: `ORD-${Math.floor(2000 + Math.random() * 1000)}`,
                customer: `Customer ${Math.floor(Math.random() * 20) + 1}`,
                amount: (Math.random() * 200 + 50).toFixed(2),
                date: new Date().toISOString()
              }
            })
          });
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }
};

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
    const [orders, setOrders] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const navigate = useNavigate();
    const websocketRef = useRef(null);

    // Handle websocket connections
    useEffect(() => {
        // In a real app, establish websocket connection here
        const messageHandler = (event) => {
            const messageData = JSON.parse(event.data);
            if (messageData.type === 'new_order') {
                toast.info(`New order received: ${messageData.data.id}`);
                setOrders(prevOrders => [messageData.data, ...prevOrders].slice(0, 5));
                refreshData();
            }
        };
        
        websocketRef.current = mockWebsocket;
        const cleanup = websocketRef.current.addEventListener('message', messageHandler);
        
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, [dateRange, customDateRange]);

    // Fetch data based on date range
    const fetchData = async () => {
        setLoading(true);
        try {
            // Construct query params based on date range
            let queryParams = '';
            if (dateRange === 'custom') {
                queryParams = `startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
            } else {
                queryParams = `range=${dateRange}`;
            }
            
            const response = await axios.get(`${getBaseUrl()}/api/admin?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            setData(response.data);
            setOrders(response.data.recentOrders || generateMockOrders());
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    // Refresh data with animation
    const refreshData = async () => {
        setRefreshing(true);
        try {
            await fetchData();
            toast.success('Dashboard data refreshed');
        } finally {
            setTimeout(() => setRefreshing(false), 500);
        }
    };

    // Generate mock orders for demo
    const generateMockOrders = () => {
        return Array(5).fill(0).map((_, index) => ({
            id: `ORD-${2000 + index}`,
            customer: `Customer ${index + 1}`,
            date: new Date(new Date().setDate(new Date().getDate() - index)).toISOString(),
            amount: (Math.random() * 200 + 50).toFixed(2),
            status: ['Pending', 'Completed', 'Processing'][index % 3]
        }));
    };

    // Sort orders
    const sortedOrders = React.useMemo(() => {
        let sortableOrders = [...orders];
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
    }, [orders, sortConfig]);

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
        if (filterStatus === 'all') return sortedOrders;
        return sortedOrders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());
    }, [sortedOrders, filterStatus]);

    // Export data as CSV
    const exportData = async (format = 'csv') => {
        setIsExporting(true);
        try {
            // In a real app, call an API endpoint to get the formatted data
            // For this example, we'll create a CSV string and download it
            
            // Headers
            const headers = ['ID', 'Customer', 'Date', 'Amount', 'Status'];
            
            // Convert orders to CSV
            const ordersData = orders.map(order => 
                [order.id, order.customer, new Date(order.date).toLocaleDateString(), `Rs.${order.amount}`, order.status]
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

    if(loading) return <Loading/>;

    const formattedNumbers = {
        totalBooks: data?.totalBooks?.toLocaleString() || '0',
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
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Rs.{formattedNumbers.totalSales}</h3>
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
                    <RevenueChart />
                </div>
                
                {/* Top Customers */}
                <div className={`rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}>
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Top Customers</h2>
                        <select className={`text-sm border rounded ${
                            isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'
                        }`}>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                        <ul className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <li key={item} className={`p-4 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 mr-3">
                                            <img 
                                                src={`https://randomuser.me/api/portraits/${item % 2 === 0 ? 'women' : 'men'}/${70 + item}.jpg`} 
                                                alt="Customer" 
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                                Customer {item}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {item} orders
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                            Rs.{(item * 100).toFixed(2)}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
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
                                onClick={() => setFilterStatus(prev => prev === 'all' ? 'completed' : 'all')}
                            >
                                <FaFilter className="mr-2" />
                                {filterStatus === 'all' ? 'All Status' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`}
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
                                        {order.id}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {order.customer}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {new Date(order.date).toLocaleDateString()}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Rs.{order.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {order.status}
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
}

export default Dashboard;