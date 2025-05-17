import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksAPI';
import BookCard from '../books/BookCard';
import { FaFilter, FaSync } from 'react-icons/fa';

const CategoryBooks = () => {
  const { category } = useParams();
  const { data: books, isLoading, isError } = useFetchAllBooksQuery();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');

  // Filter books by category
  const categoryBooks = Array.isArray(books)
    ? books
        .filter(book => book.category?.toLowerCase() === category?.toLowerCase())
        .filter(book => {
          const price = parseFloat(book.price);
          return price >= priceRange.min && price <= priceRange.max;
        })
        .sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.publishedDate) - new Date(a.publishedDate);
          } else if (sortBy === 'oldest') {
            return new Date(a.publishedDate) - new Date(b.publishedDate);
          } else if (sortBy === 'priceHigh') {
            return b.price - a.price;
          } else if (sortBy === 'priceLow') {
            return a.price - b.price;
          } else if (sortBy === 'rating') {
            return b.rating - a.rating;
          }
          return 0;
        })
    : [];

  // Reset filters
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('newest');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md">
              <div className="h-48 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center text-red-500">
          Error loading books. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 capitalize">
          {category} Books
        </h1>
        <p className="text-gray-600">
          Discover our collection of {category} books
        </p>
      </div>

      {/* Filters and Results */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FaSync className="text-sm" />
                Reset
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="flex-1">
          {categoryBooks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Books Found</h3>
              <p className="text-gray-600 mb-6">
                No books found in the {category} category matching your filters.
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
                  Showing <span className="font-medium">{categoryBooks.length}</span> books
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FaFilter />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryBooks.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBooks; 