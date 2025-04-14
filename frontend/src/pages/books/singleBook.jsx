import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useFetchBookByIdQuery } from "../../redux/features/books/booksAPI";
import { getImgUrl } from "../../utils/getImgUrl";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar
} from "react-icons/fa";

import { 
  CheckCircleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  PencilIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { motion } from "framer-motion";

// Helper component for product details
const DetailItem = ({ label, value }) => (
  <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
    <dt className="font-medium text-gray-600">{label}:</dt>
    <dd className="text-gray-700">{value}</dd>
  </div>
);

const SingleBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading, isError } = useFetchBookByIdQuery(id);
  const [quantity, setQuantity] = useState(1);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...book,
      quantity
    }));
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...book, quantity }));
    navigate("/checkout");
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    for (let i = 0; i < 5 - fullStars - (hasHalfStar ? 1 : 0); i++) stars.push(<FaRegStar key={`empty-star-${i}`} className="text-yellow-400" />);
    return stars;
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16">Loading...</div>;
  }

  if (isError || !book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error loading book details</p>
        <Link to="/" className="text-blue-600">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Back button with better mobile touch target */}
      <div className="mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group"
          aria-label="Return to books list"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-sm sm:text-base">Back to Books</span>
        </Link>
      </div>
  
      {/* Notification with animation and mobile positioning */}
      {showAddedNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 left-4 sm:left-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg z-50 shadow-md flex items-center sm:max-w-xs"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm sm:text-base">Added to cart successfully!</p>
        </motion.div>
      )}
  
      {/* Top Section with improved mobile layout */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Image container with better mobile handling */}
        <div className="w-full max-w-[300px] mx-auto lg:w-1/3 lg:max-w-none xl:w-1/4 relative group">
          <motion.img 
            src={`${getImgUrl(book.coverImage)}`} 
            alt={book.title} 
            className="rounded-xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          {!book.inStock && (
            <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center rounded-xl">
              <span className="text-red-700 font-bold text-base sm:text-lg">Out of Stock</span>
            </div>
          )}
        </div>
  
        {/* Content area with improved spacing */}
        <div className="flex-1 space-y-5 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              By <span className="font-semibold text-indigo-700">{book.author}</span>
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              {renderRatingStars(book.rating)}
              <span className="text-gray-600 font-medium text-sm sm:text-base">
                ({book.rating.toFixed(1)} / 5.0)
              </span>
            </div>
          </div>
  
          {/* Price and stock info with better mobile layout */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
              <p className="text-3xl sm:text-4xl font-bold text-emerald-600">
                {book.formattedPrice || `Rs. ${book.price.toFixed(2)}`}
              </p>
              <div className="flex items-center gap-1 text-sm sm:text-base">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span className={book.inStock ? "text-green-700" : "text-red-700"}>
                  {book.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
  
            {/* Shipping info with responsive layout */}
            <div className="bg-indigo-50/50 p-3 sm:p-4 rounded-lg border border-indigo-100">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 text-indigo-800">
                <TruckIcon className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-medium text-base sm:text-lg">Ships within 5-7 Business Days</p>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    Free shipping in Nepal • Low cost worldwide
                  </p>
                </div>
              </div>
            </div>
  
            {/* Quantity selector with better mobile UX */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-700 font-medium text-sm sm:text-base">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 border-r border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <span className="text-lg font-medium">−</span>
                </button>
                <span className="w-12 text-center px-2.5 py-1.5 sm:py-2 text-base sm:text-lg">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 border-l border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <span className="text-lg font-medium">+</span>
                </button>
              </div>
            </div>
  
            {/* Action buttons with improved touch targets */}
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <motion.button 
                onClick={handleAddToCart}
                className="w-auto min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 sm:py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                disabled={!book.inStock}
              >
                <ShoppingBagIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Add to Cart</span>
              </motion.button>
              
              <motion.button 
                onClick={handleBuyNow}
                className="w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 sm:py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                disabled={!book.inStock}
              >
                <CreditCardIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Buy Now</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Content Sections with improved responsive spacing */}
      <div className="max-w-3xl mt-12 sm:mt-16 space-y-12 sm:space-y-16">
        {/* About the Book section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
            About the Book
          </h2>
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {book.description}
          </p>
        </section>
  
        {/* Product Details */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Product Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">Category:</dt>
              <dd className="text-gray-700">{book.category}</dd>
            </div>
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">Language:</dt>
              <dd className="text-gray-700">{book.language}</dd>
            </div>
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">ISBN:</dt>
              <dd className="text-gray-700">{book.isbn}</dd>
            </div>
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">Publication Date:</dt>
              <dd className="text-gray-700">{new Date(book.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</dd>
            </div>
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">Pages:</dt>
              <dd className="text-gray-700">{book.pages || "Not specified"}</dd>
            </div>
            <div className="flex gap-2 py-2.5 px-4 bg-gray-50 rounded-lg">
              <dt className="font-medium text-gray-600">Publisher:</dt>
              <dd className="text-gray-700">{book.publisher || "Not specified"}</dd>
            </div>
          </dl>
        </section>
  
        {/* Reviews section with responsive button */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <button 
              className="text-indigo-600 font-medium flex items-center gap-2 hover:text-indigo-700 text-base sm:text-lg"
              aria-label="Write a review"
            >
              <PencilIcon className="w-5 h-5 flex-shrink-0" />
              <span>Write a Review</span>
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl text-center">
            <div className="max-w-md mx-auto">
              <ChatBubbleLeftEllipsisIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Be the first to share your thoughts about this book!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
  
};

export default SingleBook;
