import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCircleUser, FaRegHeart, FaChevronDown } from "react-icons/fa6";
import { IoSearch, IoCart } from "react-icons/io5";
import avatarImg from "../assets/avatar.png";
import logoImg from "../assets/logo.png";

const navigation = [
  { name: "Dashboard", href: "/user-dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Cart", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  const currentUser = true;

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

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-4 bg-white shadow-lg border-b border-gray-100">
      {/* Primary Navigation */}
      <nav className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center md:gap-16 gap-4">
          {/* Logo */}
          <Link to="/" className="hover:scale-105 transition-transform">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="h-12 w-auto cursor-pointer drop-shadow-md"
            />
          </Link>

          {/* Search Input */}
          <div className="relative sm:w-80 w-48 group">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search 1M+ titles..."
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5
                        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                        transition-all duration-200 placeholder-gray-400 text-gray-700"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="relative flex items-center md:gap-4 gap-2">
          {/* User Avatar */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all cursor-pointer"
                  aria-label="User menu"
                >
                  <img
                    src={avatarImg}
                    alt="User Avatar"
                    className="size-8 rounded-full border-2 border-white"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 origin-top-right transition-all duration-200">
                    <ul className="py-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                <FaCircleUser className="size-7" />
              </Link>
            )}
          </div>

          {/* Wishlist */}
          <button className="relative hidden sm:block text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100" aria-label="Wishlist cursor-pointer">
            <FaRegHeart className="size-6 cursor-pointer" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">0</span>
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                      transition-all p-2.5 sm:px-6 flex items-center gap-2 rounded-xl text-white font-semibold
                      shadow-md hover:shadow-lg relative"
          >
            <span className="text-sm hidden sm:inline">My Cart</span>
            <IoCart className="text-xl" />
            <span className="absolute -top-2 -right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">2</span>
          </Link>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <nav className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl mx-4">
          {/* Categories Dropdown */}
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1.5
                        px-4 py-1.5 rounded-lg bg-white border hover:border-blue-200 shadow-sm cursor-pointer"
            >
              Categories <FaChevronDown className={`text-xs transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
            </button>
            {isCategoriesOpen && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    onClick={() => setIsCategoriesOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Secondary Links */}
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
