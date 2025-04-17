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
import { XCircleIcon } from "@heroicons/react/24/outline";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";



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
    <div className="container mx-auto px-4 py-8 sm:py-12 bg-gradient-to-br from-white to-indigo-50">
      {/* Back button with elegant hover effect */}
      <div className="mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-all duration-300 group"
          aria-label="Return to books list"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1.5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-sm sm:text-base font-medium">Back to Books</span>
        </Link>
      </div>
  
      {/* Notification with smooth animation */}
      {showAddedNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-4 right-4 left-4 sm:left-auto bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg z-50 shadow-lg flex items-center sm:max-w-xs"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" />
          <p className="text-sm sm:text-base font-medium">Added to cart successfully!</p>
        </motion.div>
      )}
  
      {/* Main content with glass morphism effect */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
          {/* Image container with 3D hover effect */}
          <div className="w-full max-w-[350px] mx-auto lg:w-1/3 lg:max-w-none xl:w-1/4 relative group perspective">
            <motion.div
              whileHover={{ 
                rotateY: 5, 
                rotateX: -5,
                z: 10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative"
            >
              <img 
                src={`${getImgUrl(book.coverImage)}`} 
                alt={book.title} 
                className="rounded-xl w-full object-cover object-center transform transition-all duration-500"
                style={{ transformStyle: "preserve-3d" }}
              />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-indigo-100 rounded-full -z-10 opacity-70 blur-md"></div>
              <div className="absolute -top-3 -left-3 w-16 h-16 bg-amber-100 rounded-full -z-10 opacity-70 blur-md"></div>
              
              {/* Out of stock overlay with animation */}
              {!book.inStock && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-red-50/95 flex items-center justify-center rounded-xl backdrop-blur-sm"
                >
                  <span className="text-red-700 font-bold text-lg sm:text-xl px-4 py-2 border-2 border-red-300 rounded-lg">
                    Out of Stock
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>
  
          {/* Content area with elegant typography */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                By <span className="font-semibold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer">{book.author}</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex">
                  {renderRatingStars(book.rating)}
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base bg-gray-100 px-2 py-0.5 rounded-md">
                  ({book.rating.toFixed(1)} / 5.0)
                </span>
              </div>
            </div>
  
            {/* Price and stock info with elegant design */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {book.formattedPrice || `Rs. ${book.price.toFixed(2)}`}
                </p>
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  {book.inStock ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
                      <XCircleIcon className="w-4 h-4 mr-1.5" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
  
              {/* Shipping info with glass morphism */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <TruckIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-base sm:text-lg text-gray-900">Ships within 5-7 Business Days</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Free shipping in Nepal • Low cost worldwide
                    </p>
                  </div>
                </div>
              </div>
  
              {/* Quantity selector with modern design */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2.5 text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <span className="text-lg font-medium">−</span>
                  </motion.button>
                  <span className="w-12 text-center px-2 py-2 text-lg font-medium bg-white">
                    {quantity}
                  </span>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-4 py-2.5 text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <span className="text-lg font-medium">+</span>
                  </motion.button>
                </div>
              </div>
  
              {/* Action buttons with advanced animations */}
              <div className="flex flex-wrap gap-4 pt-3">
                <motion.button 
                  onClick={handleAddToCart}
                  className="w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3.5 rounded-xl font-medium shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!book.inStock}
                >
                  <ShoppingBagIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Add to Cart</span>
                </motion.button>
                
                <motion.button 
                  onClick={handleBuyNow}
                  className="w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3.5 rounded-xl font-medium shadow-md hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
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
      </div>
  
      {/* Content Sections with elegant cards */}
      <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-12 sm:space-y-16">
        {/* About the Book section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 border-b border-gray-200 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2 text-indigo-600" />
            About the Book
          </h2>
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {book.description}
          </p>
        </section>
  
        {/* Product Details with elegant layout */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Product Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            {[
              { label: "Category", value: book.category },
              { label: "Language", value: book.language },
              { label: "ISBN", value: book.isbn },
              { label: "Publication Date", value: new Date(book.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) },
              { label: "Pages", value: book.pages || "Not specified" },
              { label: "Publisher", value: book.publisher || "Not specified" }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <dt className="font-medium text-gray-900 mb-1">{item.label}</dt>
                <dd className="text-indigo-700">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
  
        {/* Reviews section with elegant empty state */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8 pb-2 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Customer Reviews
            </h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white bg-indigo-600 font-medium flex items-center gap-2 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-all text-sm sm:text-base"
              aria-label="Write a review"
            >
              <PencilIcon className="w-4 h-4 flex-shrink-0" />
              <span>Write a Review</span>
            </motion.button>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 sm:p-8 rounded-xl text-center border border-indigo-100">
            <div className="max-w-md mx-auto">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">No Reviews Yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-5">
                Be the first to share your thoughts about this book!
              </p>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center text-indigo-600 border border-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <StarIcon className="w-4 h-4 mr-2" />
                Start Rating
              </motion.button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SingleBook;
