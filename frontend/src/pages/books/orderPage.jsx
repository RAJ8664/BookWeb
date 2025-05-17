import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  useGetOrderByEmailQuery, 
  useCancelOrderMutation,
  useRequestRefundMutation 
} from '../../redux/features/orders/ordersApi';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const OrdersPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orderData, isLoading, isError, refetch } = useGetOrderByEmailQuery(
    user?.email,
    { skip: !user?.email }
  );
  
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [requestRefund, { isLoading: isRefunding }] = useRequestRefundMutation();

  // Memoized sorting and filtering logic
  const processedOrders = useMemo(() => {
    if (!orderData) return [];
    
    let filteredOrders = [...orderData];
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order._id.toLowerCase().includes(term) || 
        order.name?.toLowerCase().includes(term) ||
        order.email?.toLowerCase().includes(term) ||
        (order.address?.city && order.address.city.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    return filteredOrders.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [orderData, sortOrder, searchTerm]);

  useEffect(() => {
    setOrders(processedOrders);
  }, [processedOrders]);

  useEffect(() => {
    if (!loading && (!user || !user.email)) {
      Swal.fire({
        title: "Authentication Required",
        text: "You need to be logged in to view your orders",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else {
          navigate("/");
        }
      });
    }
  }, [user, loading, navigate]);

  const handleRefresh = () => {
    refetch();
    Swal.fire({
      icon: 'info',
      title: 'Refreshing Orders',
      text: 'Getting your latest order information...',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const downloadInvoice = (order) => {
    Swal.fire({
      title: 'Generate Invoice',
      html: `
        <p>Order #${order._id.substring(0, 8)}</p>
        <p>Total: Rs.${order.totalPrice?.toFixed(2)}</p>
        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Download PDF',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real implementation, you would generate a PDF here
        Swal.fire('Success', 'Invoice downloaded successfully!', 'success');
      }
    });
  };

  const handleCancelOrder = (orderId, paymentMethod) => {
    // Create message based on payment method
    let confirmMessage = 'Are you sure you want to cancel this order?';
    let paymentInfo = '';
    
    if (paymentMethod === 'eSewa') {
      paymentInfo = 'Since you paid with eSewa, a refund will be processed automatically if you cancel.';
    } else if (paymentMethod === 'Cash on Delivery') {
      paymentInfo = 'Since you selected Cash on Delivery, no refund will be processed.';
    }
    
    Swal.fire({
      title: 'Cancel Order',
      html: `
        <p>${confirmMessage}</p>
        <p class="mt-2 text-sm ${paymentMethod === 'eSewa' ? 'text-green-600' : 'text-gray-600'}">${paymentInfo}</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        cancelOrder(orderId)
          .unwrap()
          .then((response) => {
            Swal.fire(
              'Cancelled!',
              response.message || 'Your order has been cancelled.',
              'success'
            );
            refetch();
          })
          .catch((error) => {
            Swal.fire(
              'Error!',
              error?.data?.message || 'Failed to cancel the order. Please try again.',
              'error'
            );
          });
      }
    });
  };
  
  const handleRequestRefund = (orderId) => {
    Swal.fire({
      title: 'Request Refund for Cancelled Order',
      html: `
        <p>Please provide a reason for your refund request:</p>
        <p class="mt-2 text-sm text-gray-600">(Note: Refunds are only available for cancelled orders paid through online payment methods)</p>
        <textarea id="refundReason" class="swal2-textarea" placeholder="Enter your reason here..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Refund Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      preConfirm: () => {
        const reason = document.getElementById('refundReason').value;
        if (!reason) {
          Swal.showValidationMessage('Please enter a reason for your refund request');
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        requestRefund({ id: orderId, refundReason: result.value })
          .unwrap()
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Refund Request Submitted!',
              html: `
                <p>Your refund request has been submitted successfully.</p>
                <p class="mt-2 text-sm text-gray-600">Your order status is now "Refund Processing".</p>
                <p class="mt-2 text-sm text-gray-600">An administrator will review your request and process your refund.</p>
              `
            });
            refetch();
          })
          .catch((error) => {
            Swal.fire(
              'Error!',
              error?.data?.message || 'Failed to submit refund request. Please try again.',
              'error'
            );
          });
      }
    });
  };

  const renderOrderStatus = (status) => {
    const statusConfig = {
      'delivered': { bgColor: 'bg-green-100', textColor: 'text-green-700', icon: '✓' },
      'shipped': { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: '🚚' },
      'cancelled': { bgColor: 'bg-red-100', textColor: 'text-red-700', icon: '✕' },
      'pending': { bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: '⏳' },
      'processing': { bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: '🔄' },
      'refund_processing': { bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: '⌛' },
      'refunded': { bgColor: 'bg-purple-100', textColor: 'text-purple-700', icon: '💰' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${config.bgColor} ${config.textColor}`}>
        <span>{config.icon}</span>
        <span>{status?.replace('_', ' ') || 'pending'}</span>
      </span>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 font-medium">Loading your orders...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">There was a problem loading your orders. Please try again later.</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 pl-10 w-full sm:w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              
              <button 
                onClick={handleRefresh} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg"
                title="Refresh Orders"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-xl font-semibold">
                    <Link to={`/order/${order._id}`} className="hover:underline text-blue-600 flex items-center gap-2">
                      <span>Order #{order._id.substring(0, 8)}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {renderOrderStatus(order.status)}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="text-sm px-3 py-1 border border-blue-300 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Invoice
                      </button>
                      
                      {/* Cancel button - only for pending or processing orders */}
                      {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'processing') && (
                        <button
                          onClick={() => handleCancelOrder(order._id, order.paymentMethod)}
                          disabled={isCancelling}
                          className="text-sm px-3 py-1 border border-red-300 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Order
                        </button>
                      )}
                      
                      {/* Refund button - only for cancelled orders with online payment methods */}
                      {order.status?.toLowerCase() === 'cancelled' && order.paymentMethod !== 'Cash on Delivery' && (
                        <button
                          onClick={() => handleRequestRefund(order._id)}
                          disabled={isRefunding}
                          className="text-sm px-3 py-1 border border-purple-300 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Request Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {order.name}</p>
                      <p><span className="font-medium">Email:</span> {order.email}</p>
                      <p><span className="font-medium">Phone:</span> {order.phone}</p>
                      <p><span className="font-medium">Payment:</span> {order.paymentMethod || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Shipping Address
                    </h3>
                    {order.address ? (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{order.address.city}</p>
                        {order.address.state && <p>{order.address.state}</p>}
                        {order.address.zipcode && <p>{order.address.zipcode}</p>}
                        {order.address.country && <p>{order.address.country}</p>}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No address provided</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Order Summary
                  </h3>
                  <p className="font-bold text-lg text-blue-700">Total: Rs.{order.totalPrice?.toFixed(2)}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Products
                  </h3>
                  <div className="space-y-3">
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <div className="flex items-center gap-3">
                            {product.coverImage && (
                              <img
                                src={product.coverImage}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{product.title}</p>
                              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                <p>Quantity: {product.quantity || 1}</p>
                                <p>Price: Rs.{product.price?.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">No products in this order</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-5xl mb-4">📦</div>
            <h2 className="text-2xl font-medium mb-4 text-gray-700">You haven't placed any orders yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Browse our collection and find something you like! Your order history will appear here once you make a purchase.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              Shop Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
