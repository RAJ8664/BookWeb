import React, { useEffect } from 'react'
import InputField from '../addBook/InputField'
import SelectField from '../addBook/SelectField'
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchBookByIdQuery, useUpdateBookMutation } from '../../../redux/features/books/booksAPI';
import Loading from '../../../components/Loading';
import Swal from 'sweetalert2';
import '../../../app.css';


import {
  PencilSquareIcon,
  BookOpenIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  GlobeAltIcon,
  CalendarIcon,
  StarIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const UpdateBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: bookData, isLoading, isError, refetch } = useFetchBookByIdQuery(id);
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const { register, handleSubmit, setValue, reset, watch } = useForm();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You need to log in to update books',
        icon: 'warning',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/admin');
      });
      return;
    }

    if (bookData) {
      console.log("Book data loaded:", bookData); // For debugging
      setValue('title', bookData.title);
      setValue('author', bookData.author);
      setValue('description', bookData.description);
      setValue('category', bookData.category);
      setValue('categories', bookData.categories);
      setValue('trending', bookData.trending);
      setValue('recommended', bookData.recommended);
      setValue('newArrival', bookData.newArrival);
      setValue('bestSeller', bookData.bestSeller);
      setValue('inStock', bookData.inStock);
      // Ensure price is set exactly as it comes from the server
      setValue('price', bookData.price);
      setValue('rating', bookData.rating);
      setValue('language', bookData.language);
      setValue('publishedDate', bookData.publishedDate ? new Date(bookData.publishedDate).toISOString().split('T')[0] : '');
      setValue('coverImage', bookData.coverImage);
    }
  }, [bookData, setValue, navigate]);

  const onSubmit = async (data) => {
    // Check if token exists before attempting to update
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your login session has expired. Please log in again.',
        icon: 'error',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/admin');
      });
      return;
    }

    // Parse and validate the price directly
    const priceValue = parseFloat(data.price);
    if (isNaN(priceValue)) {
      Swal.fire({
        title: "Invalid Price",
        text: "Please enter a valid number for the price",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }
    
    const updateBookData = {
      id: id,
      title: data.title,
      author: data.author,
      description: data.description,
      category: data.category,
      categories: data.categories,
      trending: data.trending,
      recommended: data.recommended,
      newArrival: data.newArrival,
      bestSeller: data.bestSeller,
      inStock: data.inStock,
      price: priceValue, // Use directly parsed value
      rating: Number(data.rating),
      language: data.language,
      publishedDate: data.publishedDate ? new Date(data.publishedDate) : undefined,
      coverImage: data.coverImage || bookData.coverImage,
    };
    
    console.log("Updating with data:", updateBookData); // For debugging
    
    try {
      const result = await updateBook(updateBookData).unwrap();
      console.log("Update response:", result); // For debugging
      
      Swal.fire({
        title: "Book Updated",
        text: "Your book is updated successfully!",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK"
      });
      await refetch();
      navigate('/dashboard/manage-books');
    } catch (error) {
      console.error("Failed to update book:", error);
      
      // Check for authentication errors
      if (error.status === 403 || error.status === 401) {
        Swal.fire({
          title: "Authentication Error",
          text: "You don't have permission to update this book or your session has expired. Please log in again.",
          icon: "error",
          confirmButtonText: "Go to Login"
        }).then(() => {
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/admin');
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to update book. Please try again.",
          icon: "error",
        });
      }
    }
  }
  
  // For debugging - watch the price field
  const currentPrice = watch('price');
  console.log("Current price value:", currentPrice);
  
  if (isLoading) return <Loading />
  if (isError) return <div>Error fetching book data</div>
  
  return (
    <div className="max-w-2xl mx-auto md:p-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <PencilSquareIcon className="w-8 h-8 text-indigo-600" />
          <span>Update Book Details</span>
        </h2>
        <p className="mt-2 text-gray-500">Revise the information below to update this book entry</p>
      </div>
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Title"
            name="title"
            placeholder="The Great Novel"
            register={register}
            required={true}
            icon={<BookOpenIcon className="w-5 h-5 text-gray-400" />}
          />
  
          <InputField
            label="Author"
            name="author"
            placeholder="J.K. Rowling"
            register={register}
            required={true}
            icon={<UserIcon className="w-5 h-5 text-gray-400" />}
          />
        </div>
  
        <InputField
          label="Description"
          name="description"
          placeholder="A captivating story about..."
          type="textarea"
          register={register}
          icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400" />}
          rows={4}
        />
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Category"
            name="category"
            options={[
              { value: '', label: 'Select Category', disabled: true },
              { value: 'fiction', label: 'Fiction' },
              { value: 'non-fiction', label: 'Non-Fiction' },
              { value: 'science', label: 'Science' },
              { value: 'history', label: 'History' },
              { value: 'biographies', label: 'Biographies' },
              { value: 'children', label: 'Children' },
              { value: 'mystery', label: 'Mystery' },
              { value: 'romance', label: 'Romance' },
              { value: 'thriller', label: 'Thriller' },
              { value: 'horror', label: 'Horror' },
              { value: 'fantasy', label: 'Fantasy' },
              { value: 'adventure', label: 'Adventure' },
              { value: 'biography', label: 'Biography' },
              { value: 'self-help', label: 'Self-Help' },
              { value: 'cooking', label: 'Cooking' },
              { value: 'art', label: 'Art' },
              { value: 'travel', label: 'Travel' }
            ]}
            register={register}
            required={true}
            icon={<TagIcon className="w-5 h-5 text-gray-400" />}
          />
  
          <InputField
            label="Price"
            name="price"
            type="number"
            placeholder="299"
            register={register}
            required={true}
            step="1"
            icon={<CurrencyDollarIcon className="w-5 h-5 text-gray-400" />}
            prefix="₹"
          />
        </div>
  
        <InputField
          label="Additional Categories"
          name="categories"
          placeholder="fantasy, classic, romance"
          register={register}
          icon={<PlusCircleIcon className="w-5 h-5 text-gray-400" />}
          helperText="Separate multiple categories with commas"
        />
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Language"
            name="language"
            placeholder="English"
            register={register}
            icon={<GlobeAltIcon className="w-5 h-5 text-gray-400" />}
          />
  
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span>Published Date</span>
            </label>
            <input
              type="date"
              {...register('publishedDate')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
            <StarIcon className="w-5 h-5 text-amber-400" />
            <span>Rating (0-5)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              {...register('rating')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
              placeholder="4.5"
            />
            <span className="absolute right-4 top-3 text-sm text-gray-400">stars</span>
          </div>
        </div>
  
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Book Status</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'trending', label: 'Trending' },
              { name: 'recommended', label: 'Recommended' },
              { name: 'newArrival', label: 'New Arrival' },
              { name: 'bestSeller', label: 'Best Seller' },
              { name: 'inStock', label: 'In Stock' },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  {...register(name)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
  
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          <div className="flex items-center space-x-4">
            <InputField
              name="coverImage"
              type="text"
              placeholder="https://example.com/book-cover.jpg"
              register={register}
              icon={<PhotoIcon className="w-5 h-5 text-gray-400" />}
            />
            {watch('coverImage') && (
              <div className="shrink-0 w-16 h-16 rounded-lg border overflow-hidden">
                <img 
                  src={watch('coverImage')} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
  
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <div className="flex items-center justify-center space-x-2">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            'Update Book'
          )}
        </button>
      </form>
    </div>
  )
}

export default UpdateBook