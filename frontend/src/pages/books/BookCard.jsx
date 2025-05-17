import React, { useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "../../redux/features/wishlist/wishlistSlice";
import Swal from 'sweetalert2';
import { useAuth } from "../../context/AuthContext";

import { FaBolt, FaCheckCircle, FaBook } from 'react-icons/fa';

// Default fallback images
const DEFAULT_IMAGE = "default-book-cover.jpg";

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if the book is in cart
  const cartItems = useSelector((state) => state.cart.cartItems);
  const isInCart = cartItems.some(item => item.id === book.id);
  
  // Check if the book is in wishlist
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isInWishlist = wishlistItems.some(item => item.id === book.id);
  
  // Handle image display - properly handle Cloudinary URLs
  const [imageError, setImageError] = useState(false);
  
  // Function to get the appropriate image source
  const getImageSrc = () => {
    // If no cover image or error loading it, return empty string
    if (!book.coverImage || imageError) {
      return "";
    }
    
    // If it's already a URL (like Cloudinary URL), use it directly
    if (book.coverImage.startsWith('http')) {
      return book.coverImage;
    }
    
    // If it's a filename that might be in assets
    try {
      return new URL(`../../assets/${book.coverImage}`, import.meta.url).href;
    } catch (error) {
      console.error("Error with image path:", error);
      return "";
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleBuyNow = (product) => {
    // Add to cart first if not already there
    if (!isInCart) {
      dispatch(addToCart(product));
    }
    // Navigate to checkout
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    // Toggle wishlist state using Redux
    if (isInWishlist) {
      dispatch(removeFromWishlist(book.id));
    } else {
      dispatch(addToWishlist(book));
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 border border-gray-100/80 w-full max-w-xs mx-auto group">
      {/* Wishlist Button */}
      <button 
        onClick={toggleWishlist}
        className="absolute top-4 right-4 z-20 bg-white/90 p-2.5 rounded-full shadow-sm hover:shadow-md transition-all
                  hover:scale-110 active:scale-95 ring-1 ring-gray-200/50"
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isInWishlist ? (
          <FaHeart className="text-red-500 text-xl animate-pulse" />
        ) : (
          <FaRegHeart className="text-gray-400 hover:text-red-400 text-xl transition-colors" />
        )}
      </button>
  
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
        <Link to={`/books/${book.id}`} className="absolute inset-0">
          {getImageSrc() ? (
            <img
              src={getImageSrc()}
              alt={book.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
              <FaBook className="text-4xl mb-2" />
              <span className="text-sm font-medium">No Cover Available</span>
            </div>
          )}
        </Link>
      </div>
  
      {/* Content Section */}
      <div className="mt-4 space-y-3">
        {/* Title & Author */}
        <div className="text-center">
          <Link to={`/books/${book.id}`} className="inline-block">
            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{book.author}</p>
          </Link>
        </div>
  
        {/* Price Badge */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
            {book.formattedPrice || `₹${book.price.toFixed(2)}`}
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAddToCart(book)}
            disabled={isInCart}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all 
              ${isInCart 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg cursor-pointer'}
            `}
          >
            {isInCart ? (
              <FaCheckCircle className="flex-shrink-0" />
            ) : (
              <FiShoppingCart className="flex-shrink-0 text-lg" />
            )}
            <span className="text-sm font-medium truncate">
              {isInCart ? "Added" : "Add to Cart"}
            </span>
          </button>
          
          <button 
            onClick={() => handleBuyNow(book)}
            className="py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700
                      text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaBolt className="flex-shrink-0 text-sm" />
            <span className="text-sm font-medium">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
