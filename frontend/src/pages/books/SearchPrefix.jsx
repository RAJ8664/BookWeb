import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksAPI';
import { FaSearch, FaFilter, FaStar, FaSpinner, FaBookOpen, FaHeart, FaRegHeart, FaShoppingCart, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';

const AllBooks = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
  const user = useSelector(state => state.auth.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const booksPerPage = 12;

  // Fetch books data
  const { data: booksData, isLoading, isError } = useFetchAllBooksQuery();
  // const books = booksData || [];
  const books = (booksData || []).filter(book =>
    query ? book.title.toLowerCase().includes(query.toLowerCase()) : true
  );

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? book.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishedDate) - new Date(a.publishedDate);
      if (sortBy === 'oldest') return new Date(a.publishedDate) - new Date(b.publishedDate);
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    })
    .slice(0, 50); // Limit to 50 books

  // Get categories for filter
  const categories = [...new Set(books.map(book => book.category))];

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Book card animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Handle add to cart
  const handleAddToCart = (book, e) => {
    e.preventDefault(); // Prevent navigation to book details
    e.stopPropagation(); // Stop event bubbling
    
    dispatch(addToCart({
      _id: book._id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image || book.coverImage,
      quantity: 1
    }));

    Swal.fire({
      position: 'bottom-end',
      icon: 'success',
      title: 'Added to cart!',
      showConfirmButton: false,
      timer: 1500,
      toast: true
    });
  };

  // Handle buy now
  const handleBuyNow = (book, e) => {
    e.preventDefault(); // Prevent navigation to book details
    e.stopPropagation(); // Stop event bubbling
    
    dispatch(addToCart({
      _id: book._id,
      title: book.title,
      author: book.author,
      price: book.price,
      image: book.image || book.coverImage,
      quantity: 1
    }));
    
    // Navigate to checkout
    navigate('/checkout');
  };

  // Handle toggle wishlist
  const toggleWishlist = (book, e) => {
    e.preventDefault(); // Prevent navigation to book details
    e.stopPropagation(); // Stop event bubbling
    
    // Check if book is in wishlist
    const isInWishlist = wishlistItems.some(item => item._id === book._id);

    // Toggle wishlist state using Redux
    if (isInWishlist) {
      dispatch(removeFromWishlist(book._id));
    } else {
      dispatch(addToWishlist(book));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 space-y-3"
      >
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <h1 className="text-4xl font-bold mb-2">Explore Our Collection</h1>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto w-24 rounded-full" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Discover our curated library spanning countless genres and literary treasures
        </motion.p>
      </motion.div>
  
      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books by title, author, or ISBN..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all"
            />
          </div>
  
          {/* Category Filter */}
          <div className="w-full md:w-56 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaFilter className="w-5 h-5" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 appearance-none bg-gray-50"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">{category}</option>
              ))}
            </select>
          </div>
  
          {/* Sort By */}
          <div className="w-full md:w-56">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 appearance-none bg-gray-50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
  
          {/* Reset Filters */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={resetFilters}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2"
          >
            <FaSync className="text-sm" />
            Reset Filters
          </motion.button>
        </div>
      </motion.div>
  
      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <p className="text-gray-600 font-medium">
          Showing {currentBooks.length} of {filteredBooks.length} results
          {filterCategory && ` in `}
          {filterCategory && <span className="text-blue-600">{filterCategory}</span>}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </motion.div>
  
      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64 space-x-3"
        >
          <FaSpinner className="text-blue-500 text-3xl animate-spin" />
          <span className="text-gray-600 font-medium">Curating Your Collection...</span>
        </motion.div>
      )}
  
      {/* Error State */}
      {isError && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-red-50 border border-red-100 p-6 rounded-xl text-center"
        >
          <div className="text-red-600 mb-3 flex justify-center">
            <FaExclamationTriangle className="text-2xl" />
          </div>
          <p className="text-red-700 font-medium">
            We encountered an issue loading the books. Please refresh or try again later.
          </p>
        </motion.div>
      )}
  
      {/* No Results */}
      {!isLoading && !isError && filteredBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <div className="inline-block p-6 bg-blue-50 rounded-full">
            <FaBookOpen className="text-4xl text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">No Books Match Your Search</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Try different keywords or adjust your filters to discover more titles
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={resetFilters}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Clear All Filters
          </motion.button>
        </motion.div>
      )}
  
      {/* Books Grid */}
      {!isLoading && !isError && filteredBooks.length > 0 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {currentBooks.map((book) => {
            const isInWishlist = wishlistItems.some(item => item._id === book._id);
            
            return (
              <motion.div
                key={book._id}
                variants={itemVariants}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative border border-gray-100"
              >
                <Link to={`/books/${book._id}`} className="block">
                  {/* Book Image */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={book.image || book.coverImage || '/placeholder-book.jpg'}
                      alt={book.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-book.jpg';
                      }}
                    />
                    
                    {/* Discount Badge */}
                    {book.discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {book.discountPercentage}% OFF
                      </div>
                    )}
                    
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => toggleWishlist(book, e)}
                      className="absolute top-3 left-3 z-20 bg-white/90 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all
                                hover:scale-110 active:scale-95 ring-1 ring-gray-200/50"
                      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isInWishlist ? (
                        <FaHeart className="text-red-500 text-xl" />
                      ) : (
                        <FaRegHeart className="text-gray-400 hover:text-red-400 text-xl transition-colors" />
                      )}
                    </button>
                  </div>
  
                  {/* Book Details */}
                  <div className="p-4 space-y-3">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-yellow-400">
                        <FaStar className="w-4 h-4" />
                        <span className="ml-1 font-medium">{book.rating}</span>
                      </div>
                      <span className="text-gray-400 text-sm">({book.reviews || 0} reviews)</span>
                    </div>
  
                    {/* Title & Author */}
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{book.title}</h3>
                    <p className="text-gray-600 text-sm truncate">{book.author}</p>
  
                    {/* Price & Category */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-gray-900">Rs.{book.price}</span>
                        {book.originalPrice > book.price && (
                          <span className="text-gray-400 text-sm line-through">Rs.{book.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {book.category}
                      </span>
                    </div>
                  </div>
                </Link>
  
                {/* Action Buttons */}
                <div className="flex gap-2 p-4 pt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => handleAddToCart(book, e)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => handleBuyNow(book, e)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                  >
                    Buy Now
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
  
      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </motion.button>
  
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <motion.button
                    key={pageNumber}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 min-w-[40px] rounded-lg ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </motion.button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="px-3 text-gray-400">...</span>;
              }
              return null;
            })}
  
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AllBooks;
