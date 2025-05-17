import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCircleUser, FaRegHeart, FaChevronDown } from "react-icons/fa6";
import { IoSearch, IoCart } from "react-icons/io5";
import avatarImg from "../assets/avatar.png";
import logoImg from "../assets/logo.png";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useSearchBooksQuery } from "../redux/features/books/booksAPI";
import { FaBook } from "react-icons/fa";

const navigation = [
  { name: "Dashboard", href: "/userdashboard", icon: "📊" },
  { name: "Orders", href: "/orders", icon: "📦" },
  { name: "Cart", href: "/cart", icon: "🛒" },
  { name: "Check Out", href: "/checkout", icon: "💳" },
];

const categories = [
  { name: "Fiction", href: "/categories/fiction" },
  { name: "Non-Fiction", href: "/categories/non-fiction" },
  { name: "Science", href: "/categories/science" },
  { name: "History", href: "/categories/history" },
  { name: "Biographies", href: "/categories/biographies" },
  { name: "Children", href: "/categories/children" },
  { name: "Mystery", href: "/categories/mystery" },
  { name: "Romance", href: "/categories/romance" },
  { name: "Thriller", href: "/categories/thriller" },
  { name: "Horror", href: "/categories/horror" },
  { name: "Fantasy", href: "/categories/fantasy" },
  { name: "Adventure", href: "/categories/adventure" },
  { name: "Biography", href: "/categories/biography" },
  { name: "Self-Help", href: "/categories/self-help" },
  { name: "Cooking", href: "/categories/cooking" },
  { name: "Art", href: "/categories/art" },
  { name: "Travel", href: "/categories/travel" },
  
];

const secondaryNavigation = [
  { name: "All Books", href: "/books" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "Award Winners", href: "/award-winners" },
  { name: "Request a Book", href: "/request-book" },
];

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useSelector(state => state.auth.user);

  // Use RTK Query for search with debouncing
  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching,
  } = useSearchBooksQuery(searchQuery, {
    skip: searchQuery.length < 3,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show search results when we have a query and results
  useEffect(() => {
    if (searchQuery.length >= 3 && searchResults && searchResults.length > 0) {
      setShowSearchResults(true);
    } else if (searchQuery.length < 3) {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchItemClick = (bookId) => {
    navigate(`/books/${bookId}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setIsCategoriesOpen(false);
      setShowSearchResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="max-w-screen-2xl mx-auto px-2 sm:px-4 py-4 bg-white shadow-lg border-b border-gray-100">
      {/* Primary Navigation */}
      <nav className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        {/* Left Section */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 md:gap-16 flex-1">
          <Link to="/" className="hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <img 
              src={logoImg} 
              alt="BookWeb Logo" 
              className="h-8 md:h-12 w-auto cursor-pointer drop-shadow-md"
              width="120"
              height="48"
              loading="eager"
            />
          </Link>

          <div className="relative w-1/2 max-w-2xl group">
            <form onSubmit={handleSearch} className="relative w-full">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                aria-label="Search books"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length >= 3 && searchResults && searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5
                          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                          transition-all duration-200 placeholder-gray-400 text-gray-700"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div 
                ref={searchResultsRef}
                className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
              >
                {isSearching || isFetching ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Searching...</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((book) => (
                      <li 
                        key={book._id} 
                        onClick={() => handleSearchItemClick(book._id)}
                        className="p-3 border-b border-gray-100 hover:bg-blue-50 flex items-center cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 mr-3">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title}
                              className="h-14 w-10 object-cover rounded-md shadow-sm"
                            />
                          ) : (
                            <div className="h-14 w-10 flex items-center justify-center bg-blue-100 rounded-md">
                              <FaBook className="text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{book.title}</p>
                          <p className="text-sm text-gray-500 truncate">by {book.author}</p>
                          <p className="text-sm text-blue-600 mt-1">₹{book.price?.toFixed(2) || '0.00'}</p>
                        </div>
                      </li>
                    ))}
                    <li className="p-2 bg-gray-50 text-center">
                      <button 
                        onClick={handleSearch}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        See all results
                      </button>
                    </li>
                  </ul>
                ) : searchQuery.length >= 3 ? (
                  <div className="p-4 text-center text-gray-500">
                    No books found matching "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center justify-end sm:justify-start gap-2 sm:gap-4 flex-shrink-0">
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  <img
                    src={user?.photoURL || avatarImg}
                    alt="User Avatar"
                    className="size-8 rounded-full border-2 border-white object-cover"
                    width="32"
                    height="32"
                    loading="eager"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fadeIn">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.displayName || 'Welcome!'}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <ul className="py-2 space-y-1" role="menu">
                      {navigation.map((item) => (
                        <li key={item.name} role="none">
                          <Link
                            to={item.href}
                            role="menuitem"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <span className="mr-2">{item.icon}</span> {item.name}
                          </Link>
                        </li>
                      ))}
                      <li className="border-t border-gray-100" role="none">
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          role="menuitem"
                          className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="mr-2">🚪</span> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Login"
              >
                <FaCircleUser className="size-7" />
              </Link>
            )}
          </div>

          <Link
            to="/wishlist"
            className="relative text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer" 
            aria-label="Wishlist"
          >
            <FaRegHeart className="size-5 sm:size-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                      transition-all duration-300 p-2 sm:p-2.5 sm:px-6 flex items-center gap-2 rounded-xl text-white font-semibold
                      shadow-md hover:shadow-lg relative text-sm sm:text-base"
            aria-label="Cart"
          >
            <span className="hidden sm:inline">My Cart</span>
            <div className="relative">
              <IoCart className="text-lg sm:text-xl" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-white text-blue-700 text-xs font-bold px-1.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
          </Link>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <nav className="mt-4 pt-4 border-t border-gray-100" aria-label="Secondary navigation">
        <div className="flex flex-wrap justify-center gap-2 md:gap-6 bg-gradient-to-r from-blue-50 to-purple-50 px-2 sm:px-6 py-2 sm:py-3 rounded-xl">
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1.5
                        px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-white border hover:border-blue-200 shadow-sm transition-colors"
              aria-expanded={isCategoriesOpen}
            >
              Categories <FaChevronDown className={`text-xs transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`} />
            </button>
            {isCategoriesOpen && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 animate-fadeIn">
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.name} role="none">
                      <Link
                        to={category.href}
                        role="menuitem"
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors
                        px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-white hover:shadow-sm"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;