import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaTrash, FaShoppingCart, FaSearch, FaArrowLeft, FaBook } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist, clearWishlist } from '../redux/features/wishlist/wishlistSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import Swal from 'sweetalert2';

const WishList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get wishlist state from Redux store
  const { wishlistItems, loading } = useSelector(state => state.wishlist);
  
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterText, setFilterText] = useState('');

  const handleRemoveFromWishlist = (itemId) => {
    Swal.fire({
      title: 'Remove from wishlist?',
      text: 'Are you sure you want to remove this item from your wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromWishlist(itemId));
      }
    });
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
    
    Swal.fire({
      title: 'Added to Cart!',
      text: `${item.title} has been added to your shopping cart.`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Continue Shopping',
      confirmButtonText: 'View Cart'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/cart');
      }
    });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedAndFilteredItems = () => {
    // First filter by search text
    let filtered = wishlistItems;
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      filtered = wishlistItems.filter(
        item => 
          item.title.toLowerCase().includes(searchLower) || 
          (item.author && item.author.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Then sort
    return filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-desc':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'date-asc':
          return new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
        case 'date-desc':
        default:
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      }
    });
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) return;
    
    Swal.fire({
      title: 'Clear entire wishlist?',
      text: 'Are you sure you want to remove all items from your wishlist? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear wishlist'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearWishlist());
        
        Swal.fire(
          'Cleared!',
          'Your wishlist has been cleared.',
          'success'
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaHeart className="text-pink-500 mr-3" />
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link 
            to="/" 
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <FaTrash className="mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {/* Filters and Sort */}
      {wishlistItems.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search wishlist..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="date-desc">Date Added (Newest First)</option>
              <option value="date-asc">Date Added (Oldest First)</option>
              <option value="alpha-asc">Title (A-Z)</option>
              <option value="alpha-desc">Title (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Wishlist Items */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredItems().map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="p-1">
                <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                  {item.coverImage ? (
                    <img 
                      src={item.coverImage} 
                      alt={item.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center px-4">
                      <FaBook className="mx-auto text-4xl mb-2" />
                      No cover image
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.author}</p>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    {item.formattedPrice || `Rs. ${item.price?.toFixed(2) || '0.00'}`}
                  </span>
                </div>
                
                <p className="text-gray-500 mt-3 text-sm line-clamp-2">
                  {item.description || 'No description available'}
                </p>
                
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash />
                  </button>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-pink-50 p-4 rounded-full mb-4">
            <FaHeart className="text-4xl text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Save items you're interested in by clicking the heart icon on book pages.
          </p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishList;
