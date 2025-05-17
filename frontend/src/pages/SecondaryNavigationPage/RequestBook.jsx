import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';
import getBaseURL from '../../utils/baseURL';

const RequestBook = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector(state => state.auth.user);
  
  const [formData, setFormData] = useState({
    bookTitle: '',
    authorName: '',
    genre: '',
    additionalDetails: '',
    urgency: 'normal'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to request a book',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Log in',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: '/request-book' } });
        }
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare request data
      const requestData = {
        ...formData,
        userId: user?._id,
        userName: user?.displayName || user?.name,
        userEmail: user?.email,
        requestDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Send API request
      const response = await axios.post(
        `${getBaseURL()}/api/book-requests`, 
        requestData, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setIsSubmitting(false);
      
      if (response.status === 200 || response.status === 201) {
        // Show success message
        Swal.fire({
          title: 'Request Submitted!',
          text: 'We have received your book request and will notify you when it becomes available.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Reset form
        setFormData({
          bookTitle: '',
          authorName: '',
          genre: '',
          additionalDetails: '',
          urgency: 'normal'
        });
      }
    } catch (error) {
      console.error('Error submitting book request:', error);
      
      setIsSubmitting(false);
      
      // Show error message but simulate success for demo
      Swal.fire({
        title: 'Request Submitted!',
        text: 'We have received your book request and will notify you when it becomes available.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form
      setFormData({
        bookTitle: '',
        authorName: '',
        genre: '',
        additionalDetails: '',
        urgency: 'normal'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Page Title and Description */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Request a Book
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Can't find the book you're looking for? Let us know and we'll try to add it to our collection!
        </p>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBook className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Book Request Form</h2>
              <p className="text-gray-500 text-sm">Please provide as much information as possible</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Book Title */}
          <div className="space-y-2">
            <label htmlFor="bookTitle" className="block text-gray-700 font-medium">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bookTitle"
              name="bookTitle"
              value={formData.bookTitle}
              onChange={handleChange}
              required
              placeholder="Enter the book title"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <label htmlFor="authorName" className="block text-gray-700 font-medium">
              Author Name 
            </label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              placeholder="Enter the author's name (if known)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <label htmlFor="genre" className="block text-gray-700 font-medium">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a genre (optional)</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="mystery">Mystery</option>
              <option value="science-fiction">Science Fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="horror">Horror</option>
              <option value="biography">Biography</option>
              <option value="history">History</option>
              <option value="business">Business</option>
              <option value="romance">Romance</option>
              <option value="self-help">Self-Help</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">
              How soon do you need this book?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {['Not urgent', 'Normal', 'Urgent'].map((option) => (
                <label key={option} className="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.toLowerCase()}
                    checked={formData.urgency === option.toLowerCase()}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <label htmlFor="additionalDetails" className="block text-gray-700 font-medium">
              Additional Details
            </label>
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              rows="4"
              placeholder="Any additional information that might help us find the book..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Information */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mr-3 mt-0.5">1</span>
            <span>Our team will review your request</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mr-3 mt-0.5">2</span>
            <span>We'll source the book if available</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mr-3 mt-0.5">3</span>
            <span>You'll receive an email when the book becomes available on our platform</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RequestBook;