import React, { useState } from 'react'
import InputField from './InputField'
import SelectField from './SelectField'
import { useForm } from 'react-hook-form';
import { useAddBookMutation } from '../../../redux/features/books/booksAPI';
import Swal from 'sweetalert2';
import '../../../app.css';


import {
    BookOpenIcon,
    DocumentTextIcon,
    UserIcon,
    ChatBubbleBottomCenterTextIcon,
    TagIcon,
    CurrencyDollarIcon,
    PlusCircleIcon,
    GlobeAltIcon,
    CalendarIcon,
    StarIcon,
    PhotoIcon,
    ArrowPathIcon as SpinnerIcon,
    TrophyIcon,
  } from '@heroicons/react/24/outline'

const AddBook = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [imageFile, setimageFile] = useState(null);
    const [addBook, {isLoading, isError}] = useAddBookMutation()
    const [imageFileName, setimageFileName] = useState('')
    
    const onSubmit = async (data) => {
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

        // Ensure all required fields are included and properly formatted
        const newBookData = {
            title: data.title,
            author: data.author || "Unknown", // Required in model
            category: data.category,
            categories: data.categories || "",
            description: data.description || "No description available",
            price: priceValue, // Use the validated price value
            coverImage: imageFile || "default-book-cover.jpg",
            trending: Boolean(data.trending),
            recommended: Boolean(data.recommended),
            newArrival: Boolean(data.newArrival),
            bestSeller: Boolean(data.bestSeller),
            awardWinner: Boolean(data.awardWinner),
            inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
            rating: Number(data.rating) || 0,
            language: data.language || "English",
            publishedDate: data.publishedDate ? new Date(data.publishedDate) : new Date()
        }
        
        console.log("Submitting book data:", newBookData);
        
        try {
            const result = await addBook(newBookData).unwrap();
            console.log("Server response:", result);
            
            Swal.fire({
                title: "Book added",
                text: "Your book is uploaded successfully!",
                icon: "success",
                showCancelButton: false,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK"
              });
              reset();
              setimageFileName('')
              setimageFile(null);
        } catch (error) {
            console.error("Error adding book:", error);
            Swal.fire({
                title: "Error",
                text: `Failed to add book: ${error.message || "Unknown error"}`,
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setimageFile(file);
            setimageFileName(file.name);
        }
    }
    
    return (
        <div className="max-w-2xl mx-auto md:p-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BookOpenIcon className="w-8 h-8 text-indigo-600" />
              <span>Add New Book</span>
            </h2>
            <p className="mt-2 text-gray-500">Fill in the details to add a new book to the collection</p>
          </div>
      
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title & Author */}
              <InputField
                label="Title"
                name="title"
                placeholder=""
                register={register}
                required={true}
                icon={<DocumentTextIcon className="w-5 h-5 text-gray-400" />}
              />
      
              <InputField
                label="Author"
                name="author"
                placeholder=""
                register={register}
                required={true}
                icon={<UserIcon className="w-5 h-5 text-gray-400" />}
              />
            </div>
      
            {/* Description */}
            <InputField
              label="Description"
              name="description"
              placeholder="A captivating story about..."
              type="textarea"
              register={register}
              icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400" />}
            />
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category & Price */}
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
                placeholder="0"
                register={register}
                required={true}
                step="1"
                icon={<CurrencyDollarIcon className="w-5 h-5 text-gray-400" />}
                prefix="₹"
              />
            </div>
      
            {/* Additional Categories */}
            <InputField
              label="Additional Categories"
              name="categories"
              placeholder="fantasy, classic, romance"
              register={register}
              icon={<PlusCircleIcon className="w-5 h-5 text-gray-400" />}
              helperText="Separate multiple categories with commas"
            />
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language & Published Date */}
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
      
            {/* Rating */}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="4.5"
                />
                <span className="absolute right-4 top-3 text-sm text-gray-400">stars</span>
              </div>
            </div>
      
            {/* Book Status Checkboxes */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Book Status</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'trending', label: 'Trending', icon: <StarIcon className="h-4 w-4 text-amber-500" /> },
                  { name: 'recommended', label: 'Recommended', icon: <StarIcon className="h-4 w-4 text-blue-500" /> },
                  { name: 'newArrival', label: 'New Arrival', icon: <PlusCircleIcon className="h-4 w-4 text-emerald-500" /> },
                  { name: 'bestSeller', label: 'Best Seller', icon: <TrophyIcon className="h-4 w-4 text-blue-500" /> },
                  { name: 'awardWinner', label: 'Award Winner', icon: <TrophyIcon className="h-4 w-4 text-purple-500" /> },
                  { name: 'inStock', label: 'In Stock', defaultChecked: true, icon: <BookOpenIcon className="h-4 w-4 text-gray-500" /> },
                ].map(({ name, label, defaultChecked, icon }) => (
                  <label key={name} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      {...register(name)}
                      defaultChecked={defaultChecked}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-1.5">
                      {icon}
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
      
            {/* Cover Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl p-6 transition-colors hover:border-indigo-500">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {imageFileName && (
                <p className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
                  Selected: <span className="font-medium">{imageFileName}</span>
                </p>
              )}
            </div>
      
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                  <span>Adding Book...</span>
                </div>
              ) : (
                'Add Book'
              )}
            </button>
          </form>
        </div>
      )
}

export default AddBook