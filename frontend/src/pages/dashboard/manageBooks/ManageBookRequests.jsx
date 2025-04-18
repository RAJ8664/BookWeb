import React, { useState, useEffect } from 'react';
import {
  useGetAllBookRequestsQuery,
  useMarkRequestAsReadMutation,
  useUpdateRequestStatusMutation,
  useDeleteBookRequestMutation
} from '../../../redux/features/bookRequest/bookRequestApi';
import { FaBook, FaCheck, FaEye, FaRegTimesCircle, FaTrash } from 'react-icons/fa';
import { BiRefresh } from 'react-icons/bi';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading';

const ManageBookRequests = () => {
  const [filter, setFilter] = useState('all');
  const [commentInput, setCommentInput] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [localRequests, setLocalRequests] = useState([]);

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetAllBookRequestsQuery();
  const [markAsRead] = useMarkRequestAsReadMutation();
  const [updateStatus] = useUpdateRequestStatusMutation();
  const [deleteRequest] = useDeleteBookRequestMutation();

  // Debug: Log the API response
  useEffect(() => {
    console.log('Book requests data:', data);
    console.log('Loading state:', isLoading);
    console.log('Error:', error);

    // When data is loaded, update the requests state
    if (data && data.success && data.requests && Array.isArray(data.requests)) {
      console.log(`Setting ${data.requests.length} requests from API`);
      setLocalRequests(data.requests);
    }
  }, [data, isLoading, error]);

  // Handle viewing request details
  const handleViewDetails = (request) => {
    if (!request.isRead) {
      markAsRead(request._id)
        .unwrap()
        .then(() => {
          setSelectedRequest(request);
        })
        .catch((error) => {
          console.error('Failed to mark request as read:', error);
        });
    } else {
      setSelectedRequest(request);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      // For accept/reject, prompt for admin comment
      const { value: adminComment, isConfirmed } = await Swal.fire({
        title: `${newStatus === 'accepted' ? 'Accept' : 'Reject'} Request`,
        input: 'textarea',
        inputLabel: 'Add a comment (optional)',
        inputPlaceholder: newStatus === 'accepted' 
          ? 'We will try to add this book soon...'
          : 'Reason for rejection...',
        showCancelButton: true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            resolve(); // Comment is optional
          });
        }
      });

      if (!isConfirmed) return;
      
      updateStatus({ id, status: newStatus, adminComment })
        .unwrap()
        .then(() => {
          Swal.fire({
            title: 'Success!',
            text: `Request ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          refetch();
          setSelectedRequest(null);
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error!',
            text: `Failed to ${newStatus} request: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        });
    } else if (newStatus === 'fulfilled') {
      // For fulfillment, confirm first
      Swal.fire({
        title: 'Mark as Fulfilled?',
        text: 'This will mark the request as complete. Continue?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, fulfill it',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          updateStatus({ id, status: 'fulfilled' })
            .unwrap()
            .then(() => {
              Swal.fire({
                title: 'Success!',
                text: 'Request marked as fulfilled',
                icon: 'success',
                confirmButtonText: 'OK'
              });
              refetch();
              setSelectedRequest(null);
            })
            .catch((error) => {
              Swal.fire({
                title: 'Error!',
                text: `Failed to fulfill request: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
              });
            });
        }
      });
    }
  };

  // Handle request deletion
  const handleDeleteRequest = (id) => {
    Swal.fire({
      title: 'Delete Request?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRequest(id)
          .unwrap()
          .then(() => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The book request has been deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            refetch();
            if (selectedRequest && selectedRequest._id === id) {
              setSelectedRequest(null);
            }
          })
          .catch((error) => {
            Swal.fire({
              title: 'Error!',
              text: `Failed to delete request: ${error.message}`,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          });
      }
    });
  };

  // Filter requests based on selected filter
  const getFilteredRequests = () => {
    // Debug the data structure
    console.log('Filtering requests with localRequests:', localRequests);
    
    if (localRequests.length === 0) {
      console.log('No local requests available');
      return [];
    }
    
    console.log(`Found ${localRequests.length} requests to filter`);
    
    if (filter === 'all') return localRequests;
    if (filter === 'unread') return localRequests.filter(req => !req.isRead);
    return localRequests.filter(req => req.status === filter);
  };

  const filteredRequests = getFilteredRequests();
  console.log('Filtered requests to display:', filteredRequests);

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600';
      case 'normal': return 'text-yellow-600';
      case 'not urgent': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Get status color and badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      case 'fulfilled':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Fulfilled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Manage Book Requests
          {localRequests.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({localRequests.filter(req => !req.isRead).length} unread)
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => refetch()} 
            className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition"
          >
            <BiRefresh className="text-lg" />
            <span>Refresh</span>
          </button>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="unread">Unread</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4 h-[calc(100vh-180px)] overflow-y-auto">
          {/* Debug info */}
          <div className="mb-4 p-2 bg-gray-100 rounded-md">
            <p>API Data: {data ? 'Received' : 'None'}</p>
            <p>Local Requests: {localRequests.length}</p>
            <p>Filtered Requests: {filteredRequests.length}</p>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaBook className="text-4xl mb-2 text-gray-400" />
              <p>No book requests found</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredRequests.map(request => (
                <li 
                  key={request._id}
                  onClick={() => handleViewDetails(request)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedRequest && selectedRequest._id === request._id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-gray-100'
                  } ${!request.isRead ? 'font-semibold' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-gray-800 font-medium">{request.bookTitle}</h3>
                      <p className="text-sm text-gray-600">
                        By: {request.userName} | {formatDate(request.requestDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!request.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Request Details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6 h-[calc(100vh-180px)] overflow-y-auto">
          {!selectedRequest ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaBook className="text-5xl mb-3 text-gray-400" />
              <p className="text-xl">Select a request to view details</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
                <div className="flex space-x-2">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'accepted')}
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md flex items-center text-sm"
                      >
                        <FaCheck className="mr-1" /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest._id, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md flex items-center text-sm"
                      >
                        <FaRegTimesCircle className="mr-1" /> Reject
                      </button>
                    </>
                  )}
                  {selectedRequest.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'fulfilled')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md flex items-center text-sm"
                    >
                      <FaCheck className="mr-1" /> Mark Fulfilled
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteRequest(selectedRequest._id)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center text-sm"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Book Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Book Title</label>
                      <p className="text-gray-800">{selectedRequest.bookTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Author Name</label>
                      <p className="text-gray-800">{selectedRequest.authorName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Genre</label>
                      <p className="text-gray-800 capitalize">{selectedRequest.genre || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Urgency</label>
                      <p className={`capitalize ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {selectedRequest.urgency}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Request Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Requested By</label>
                      <p className="text-gray-800">{selectedRequest.userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">User Email</label>
                      <p className="text-gray-800">{selectedRequest.userEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Request Date</label>
                      <p className="text-gray-800">{formatDate(selectedRequest.requestDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Current Status</label>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.additionalDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Additional Details</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-800">
                    {selectedRequest.additionalDetails}
                  </div>
                </div>
              )}

              {selectedRequest.adminComment && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Admin Comment</h3>
                  <div className="bg-blue-50 p-3 rounded-md text-gray-800">
                    {selectedRequest.adminComment}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookRequests; 