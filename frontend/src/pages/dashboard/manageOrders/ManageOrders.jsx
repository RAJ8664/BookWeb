import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import { setOrders } from '../../../redux/features/orders/ordersSlice';
import { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation,
  useApproveRefundMutation,
  useResetAllOrdersMutation
} from '../../../redux/features/orders/ordersApi';
import Swal from 'sweetalert2';

const ManageOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading: reduxLoading } = useSelector((state) => state.orders);
  
  const { data: apiOrders, isLoading: apiLoading, isError, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus, { isLoading: updateLoading }] = useUpdateOrderStatusMutation();
  const [approveRefund, { isLoading: approveLoading }] = useApproveRefundMutation();
  const [resetAllOrders, { isLoading: resetLoading }] = useResetAllOrdersMutation();

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  
  // Use API data when available
  useEffect(() => {
    if (apiOrders && apiOrders.length > 0) {
      dispatch(setOrders(apiOrders));
    }
  }, [apiOrders, dispatch]);
  
  useEffect(() => {
    if (orders.length > 0) {
      applyFilters();
    }
  }, [orders, searchTerm, statusFilter, sortOption]);
  
  const applyFilters = () => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.id?.toLowerCase() || order._id?.toLowerCase() || '').includes(searchLower) ||
        (order.customerName?.toLowerCase() || order.name?.toLowerCase() || '').includes(searchLower) ||
        (order.customerEmail?.toLowerCase() || order.email?.toLowerCase() || '').includes(searchLower) ||
        (order.items && order.items.some(item => item.title?.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => (order.status || '').toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply sorting
    result = sortOrders(result, sortOption);
    
    setFilteredOrders(result);
  };
  
  const sortOrders = (ordersToSort, option) => {
    switch (option) {
      case 'newest':
        return [...ordersToSort].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      case 'oldest':
        return [...ordersToSort].sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
      case 'highest':
        return [...ordersToSort].sort((a, b) => {
          const aPrice = parseFloat((a.totalPrice || a.total || '0').toString().replace(/[^0-9.]/g, ''));
          const bPrice = parseFloat((b.totalPrice || b.total || '0').toString().replace(/[^0-9.]/g, ''));
          return bPrice - aPrice;
        });
      case 'lowest':
        return [...ordersToSort].sort((a, b) => {
          const aPrice = parseFloat((a.totalPrice || a.total || '0').toString().replace(/[^0-9.]/g, ''));
          const bPrice = parseFloat((b.totalPrice || b.total || '0').toString().replace(/[^0-9.]/g, ''));
          return aPrice - bPrice;
        });
      default:
        return ordersToSort;
    }
  };
  
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    Swal.fire({
      title: 'Update Order Status',
      text: `Are you sure you want to change the status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Send API request to update status
          await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
          
          // Update UI optimistically (will be refreshed by invalidation tag)
          const updatedOrders = orders.map(order => 
            (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
          );
          dispatch(setOrders(updatedOrders));
          
          Swal.fire(
            'Updated!',
            `Order status has been updated to "${newStatus}".`,
            'success'
          );
        } catch (error) {
          console.error('Error updating order status:', error);
          Swal.fire(
            'Error!',
            'Failed to update order status. Please try again.',
            'error'
          );
        }
      }
    });
  };
  
  const handleApproveRefund = async (orderId) => {
    Swal.fire({
      title: 'Approve Refund Request',
      text: 'Are you sure you want to approve this refund request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Send API request to approve refund
          await approveRefund(orderId).unwrap();
          
          // Update UI optimistically (will be refreshed by invalidation tag)
          const updatedOrders = orders.map(order => 
            (order.id === orderId || order._id === orderId) ? { ...order, status: 'refunded' } : order
          );
          dispatch(setOrders(updatedOrders));
          
          Swal.fire(
            'Approved!',
            'The refund has been approved and processed.',
            'success'
          );
        } catch (error) {
          console.error('Error approving refund:', error);
          Swal.fire(
            'Error!',
            'Failed to approve refund. Please try again.',
            'error'
          );
        }
      }
    });
  };
  
  const getStatusColor = (status) => {
    switch((status || '').toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'refund_processing':
        return 'bg-amber-100 text-amber-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  const handleResetAllOrders = () => {
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
        resetAllOrders()
          .unwrap()
          .then((response) => {
            dispatch(setOrders([])); // Clear the orders in Redux state
            Swal.fire(
              'Reset Complete!',
              `Successfully deleted ${response.deletedCount} orders and reset all statistics.`,
              'success'
            );
            refetch(); // Refresh the data
          })
          .catch((error) => {
            Swal.fire(
              'Error!',
              error?.data?.message || 'Failed to reset order data. Please try again.',
              'error'
            );
          });
      }
    });
  };

  // Show loading spinner when any loading is happening
  const isLoading = reduxLoading || apiLoading || updateLoading || approveLoading || resetLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error message if API call failed
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">There was a problem fetching order data from the server.</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <button 
            onClick={handleResetAllOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            disabled={resetLoading}
          >
            <FaTrash className="h-5 w-5" />
            Reset All Data
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center">
          <FaFilter className="text-gray-400 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refund_processing">Refund Processing</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.name || order.customerName}</div>
                      <div className="text-xs text-gray-400">{order.email || order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt || order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.totalPrice ? `₹${order.totalPrice}` : order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.productIds?.length || order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
                          value={order.status || 'pending'}
                          onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refund_processing">Refund Processing</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        
                        {order.status === 'refund_processing' && (
                          <button
                            onClick={() => handleApproveRefund(order._id || order.id)}
                            className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium hover:bg-green-200"
                          >
                            Approve Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No orders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders; 