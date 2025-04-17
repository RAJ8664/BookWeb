import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCircleUser, FaRegHeart, FaChevronDown } from "react-icons/fa6";
import { IoSearch, IoCart } from "react-icons/io5";
import avatarImg from "../assets/avatar.png";
import logoImg from "../assets/logo.png";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";

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
];

const secondaryNavigation = [
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "Award Winners", href: "/award-winners" },
  { name: "Featured Authors", href: "/featured-authors" },
  { name: "Request a Book", href: "/request-book" },
];

const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  const searchInputRef = useRef(null);
  const { logout } = useAuth();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log(`Searching for: ${searchQuery}`);
      // Could redirect to search results page
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setIsCategoriesOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-4 bg-white shadow-lg border-b border-gray-100">
      {/* Primary Navigation */}
      <nav className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/" className="hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImg} 
              alt="Bookstore Logo" 
              className="h-12 w-auto cursor-pointer drop-shadow-md"
              width="120"
              height="48"
              loading="eager"
            />
          </Link>

          <form onSubmit={handleSearch} className="relative sm:w-80 w-48 group">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 1M+ titles..."
              aria-label="Search books"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5
                        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                        transition-all duration-200 placeholder-gray-400 text-gray-700"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center md:gap-4 gap-2">
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

          <button 
            className="relative hidden sm:block text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors" 
            aria-label="Wishlist"
          >
            <FaRegHeart className="size-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">0</span>
          </button>

          <Link
            to="/cart"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                      transition-all duration-300 p-2.5 sm:px-6 flex items-center gap-2 rounded-xl text-white font-semibold
                      shadow-md hover:shadow-lg relative"
            aria-label="Cart"
          >
            <span className="text-sm hidden sm:inline">My Cart</span>
            <div className="relative">
              <IoCart className="text-xl" />
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
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl mx-4">
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1.5
                        px-4 py-1.5 rounded-lg bg-white border hover:border-blue-200 shadow-sm transition-colors"
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
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors
                        px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm"
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