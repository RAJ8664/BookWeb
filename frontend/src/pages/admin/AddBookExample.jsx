import { useState } from 'react';
import { createBook } from '../../services/bookService';
import BookImageUpload from '../../components/BookImageUpload';
import { useAuth } from '../../context/AuthContext'; // Assuming you have an auth context

const AddBookExample = () => {
  const { user } = useAuth(); // Get authenticated user with token
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    price: '',
    language: 'English',
    coverImage: null // Will hold the File object
  });
  
  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image selection from the BookImageUpload component
  const handleImageSelect = (file) => {
    setFormData({
      ...formData,
      coverImage: file
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setSuccessMessage('');
    setErrorMessage('');
    
    // Basic validation
    if (!formData.title || !formData.author || !formData.category || !formData.price) {
      setErrorMessage('Please fill all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await createBook(formData, user.token);
      setSuccessMessage('Book created successfully!');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        author: '',
        category: '',
        description: '',
        price: '',
        language: 'English',
        coverImage: null
      });
      
      console.log('Book created:', response.book);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create book');
      console.error('Error creating book:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Book Image Upload Component */}
        <BookImageUpload 
          onImageSelect={handleImageSelect} 
          initialImage={null}
        />
        
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        
        {/* Author */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
            Author *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>
        
        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          >
            <option value="">Select Category</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="biography">Biography</option>
            <option value="technology">Technology</option>
            <option value="business">Business</option>
            <option value="children">Children</option>
          </select>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            rows="4"
          ></textarea>
        </div>
        
        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        {/* Language */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language">
            Language
          </label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookExample; 