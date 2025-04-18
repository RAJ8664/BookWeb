import React, { useState } from 'react'
import { useFetchAllBooksQuery, useDeleteBookMutation, useUpdateBookMutation } from '../../../redux/features/books/booksAPI';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    StarIcon,
    NewspaperIcon,
    TrophyIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
  } from "@heroicons/react/24/outline";


const ManageBooks = () => {
    const navigate = useNavigate();
    const [updateBook] = useUpdateBookMutation();
    const {data: books, refetch, isLoading} = useFetchAllBooksQuery();
    const [deleteBook] = useDeleteBookMutation();

    //handle delete book
    const handleDeleteBook = async (id) => {
        try {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteBook(id).unwrap();
                    Swal.fire('Deleted!', 'Book has been deleted.', 'success');
                    refetch();
                }
            });
        } catch (error) {
            console.error("Error deleting book:", error.message);
            Swal.fire('Error!', 'Failed to delete book. Please try again.', 'error');
        }
    };

    //handle edit book
    const handleEditClick = (id) => {
        navigate(`/dashboard/edit-book/${id}`);
    };

    // Helper function to display exact price
    const displayExactPrice = (price) => {
        if (price === undefined || price === null) return "0";
        // Use toString to prevent any automatic rounding
        return price.toString();
    };

    // Toggle book status (bestseller, awardWinner, trending, etc)
    const toggleBookStatus = async (id, field, currentValue) => {
        try {
            // Prepare update data with just the field to toggle
            const updateData = {
                id: id,
                [field]: !currentValue
            };
            
            // Update the book
            await updateBook(updateData).unwrap();
            
            // Show success message
            const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
            const actionText = !currentValue ? 'added to' : 'removed from';
            
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `Book ${actionText} ${capitalizedField}`,
                showConfirmButton: false,
                timer: 1500,
                toast: true
            });
            
            // Refetch books to update UI
            refetch();
        } catch (error) {
            console.error(`Error updating book ${field}:`, error);
            Swal.fire('Error!', `Failed to update book status. Please try again.`, 'error');
        }
    };

    return (
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">All Books</h3>
                <Link to="/dashboard/add-new-book" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  Add New Book
                </Link>
              </div>
      
              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="mt-2 text-gray-600">Loading books...</p>
                </div>
              )}
      
              {/* Table Container */}
              {!isLoading && (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {["#", "Book Title", "Author", "Category", "Price", "Status", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
      
                    <tbody className="bg-white divide-y divide-slate-200">
                      {books?.map((book, index) => (
                        <tr key={book._id} className="hover:bg-slate-50 transition-colors duration-150">
                          {/* Index */}
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{index + 1}</td>
                          
                          {/* Book Title */}
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-xs truncate">
                            {book.title}
                          </td>
                          
                          {/* Author */}
                          <td className="px-6 py-4 text-sm text-slate-600">{book.author || "Unknown"}</td>
                          
                          {/* Category */}
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                              {book.category || book.genre || "Uncategorized"}
                            </span>
                          </td>
                          
                          {/* Price */}
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                            ₹{displayExactPrice(book.price)}
                          </td>
                          
                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Trending Status Toggle */}
                              <button 
                                onClick={() => toggleBookStatus(book._id, 'trending', book.trending)}
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center border ${
                                  book.trending 
                                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <StarIcon className="w-3 h-3 mr-1" /> 
                                Trending
                              </button>

                              {/* New Arrival Status Toggle */}
                              <button 
                                onClick={() => toggleBookStatus(book._id, 'newArrival', book.newArrival)}
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center border ${
                                  book.newArrival 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <NewspaperIcon className="w-3 h-3 mr-1" /> 
                                New
                              </button>

                              {/* Best Seller Status Toggle */}
                              <button 
                                onClick={() => toggleBookStatus(book._id, 'bestSeller', book.bestSeller)}
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center border ${
                                  book.bestSeller 
                                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <TrophyIcon className="w-3 h-3 mr-1" /> 
                                Best Seller
                              </button>

                              {/* Award Winner Status Toggle */}
                              <button 
                                onClick={() => toggleBookStatus(book._id, 'awardWinner', book.awardWinner)}
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center border ${
                                  book.awardWinner 
                                    ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                              >
                                <TrophyIcon className="w-3 h-3 mr-1" /> 
                                Award Winner
                              </button>

                              {/* In Stock Status */}
                              {!book.inStock && (
                                <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium flex items-center">
                                  <XCircleIcon className="w-3 h-3 mr-1" /> Out of Stock
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-6 py-4 flex items-center space-x-4">
                            <Link
                              to={`/dashboard/edit-book/${book._id}`}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm font-medium"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="text-rose-600 hover:text-rose-900 flex items-center text-sm font-medium"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      );
}

export default ManageBooks
