import axios from 'axios';
import getBaseURL from '../utils/baseURL';

const API_URL = `${getBaseURL()}/api/books`;

// Helper to create form data from book object
const createBookFormData = (bookData) => {
  const formData = new FormData();
  
  // Add all text fields to form data
  Object.keys(bookData).forEach(key => {
    // Skip coverImage if it's a string URL (not a file)
    if (key === 'coverImage' && typeof bookData[key] === 'string') {
      return;
    }
    
    // Skip coverImage if it's undefined or null
    if (key === 'coverImage' && !bookData[key]) {
      return;
    }
    
    // Add all other fields
    if (key !== 'coverImage' || (key === 'coverImage' && bookData[key] instanceof File)) {
      formData.append(key, bookData[key]);
    }
  });
  
  return formData;
};

// Get all books
export const getAllBooks = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch books');
  }
};

// Get a single book by ID
export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch book');
  }
};

// Create a new book with image upload
export const createBook = async (bookData, token) => {
  try {
    const formData = createBookFormData(bookData);
    
    const response = await axios.post(`${API_URL}/create-book`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create book');
  }
};

// Update an existing book with optional image upload
export const updateBook = async (id, bookData, token) => {
  try {
    const formData = createBookFormData(bookData);
    
    const response = await axios.put(`${API_URL}/edit/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update book');
  }
};

// Delete a book
export const deleteBook = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete book');
  }
};

// Search books
export const searchBooks = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search?query=${query}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search books');
  }
};