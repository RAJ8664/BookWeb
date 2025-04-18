import React, { useState } from 'react';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksAPI';
import BookCard from "../books/BookCard";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";

const BestSellers = () => {
  const { data: books, isLoading, isError } = useFetchAllBooksQuery();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("popularity");

  // Get all available genres from books
  const allGenres = Array.isArray(books)
    ? [...new Set(books.filter(book => book.genre).map(book => book.genre))]
    : [];

  // Filter and sort best seller books
  const bestSellerBooks = Array.isArray(books)
    ? books
        .filter(book => book.bestSeller) // Only include books marked as best sellers
        .filter(book => {
          // Filter by genre if any selected
          if (selectedGenres.length > 0 && book.genre) {
            return selectedGenres.includes(book.genre);
          }
          return true;
        })
        .filter(book => {
          // Filter by price range
          const price = parseFloat(book.price);
          return price >= priceRange.min && price <= priceRange.max;
        })
        // Sort books
        .sort((a, b) => {
          if (sortBy === "popularity") {
            return 0; // Assuming they're already sorted by popularity
          } else if (sortBy === "priceAsc") {
            return parseFloat(a.price) - parseFloat(b.price);
          } else if (sortBy === "priceDesc") {
            return parseFloat(b.price) - parseFloat(a.price);
          } else if (sortBy === "title") {
            return a.title.localeCompare(b.title);
          }
          return 0;
        })
    : [];

  // Toggle genre selection
  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedGenres([]);
    setPriceRange({ min: 0, max: 10000 });
    setSortBy("popularity");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <FaArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-center">Best Sellers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="flex items-center space-x-3 mb-8">
          <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <FaArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-red-600">Error Loading Books</h1>
        <p className="text-lg text-gray-600 mb-8">There was a problem loading best sellers. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors md:hidden"
        >
          {showFilters ? <FiX /> : <FiFilter />}
          <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {/* Page Title and Description */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Best Sellers
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our most popular books that readers can't get enough of.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Side Panel */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 lg:w-72 flex-shrink-0`}>
          <div className="sticky top-8 bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h3 className="text-gray-700 font-medium mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popularity">Popularity</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="title">Title: A-Z</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-gray-700 font-medium mb-3">Price Range</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Min</label>
                  <input
                    type="number"
                    min="0"
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Max</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Genres */}
            {allGenres.length > 0 && (
              <div>
                <h3 className="text-gray-700 font-medium mb-3">Genres</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {allGenres.map((genre) => (
                    <div key={genre} className="flex items-center">
                      <input
                        type="checkbox"
                        id={genre}
                        checked={selectedGenres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={genre} className="ml-2 text-gray-700">
                        {genre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Book Grid */}
        <div className="flex-1">
          {bestSellerBooks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Best Sellers Found</h3>
              <p className="text-gray-600 mb-6">
                No books match your current filters or there are no best sellers available.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-medium">{bestSellerBooks.length}</span> best sellers
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {bestSellerBooks.map((book) => (
                  <BookCard key={book._id || book.id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellers;