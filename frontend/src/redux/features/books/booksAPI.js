import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseURL from '../../../utils/baseURL';

const baseQuery = fetchBaseQuery({ 
    baseUrl: `${getBaseURL()}/api/books`,
    credentials: 'include',
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if(token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        // Explicitly set these headers for CORS
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');
        return headers;
    }
})

const booksAPI = createApi({
    reducerPath: 'booksAPI',
    baseQuery,
    tagTypes: ['Books'],
    endpoints: (builder) => ({
        fetchAllBooks: builder.query({
            query: () => '/',
            providesTags: ['Books'],
            transformResponse: (response) => {
                // Check if the response has a books property
                return response.books || response;
            }
        }),
        fetchBookById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Books', id }],
            transformResponse: (response) => {
                // Check if the response has a book property
                return response.book || response;
            }
        }),
        searchBooks: builder.query({
            query: (searchTerm) => `/search?query=${encodeURIComponent(searchTerm)}`,
            transformResponse: (response) => {
                return response.results || [];
            }
        }),
        addBook: builder.mutation({
            query: (bookData) => {
                // Create a FormData object for multipart/form-data
                const formData = new FormData();
                
                // Handle file upload for coverImage
                if (bookData.coverImage instanceof File) {
                    formData.append('coverImage', bookData.coverImage);
                    
                    // Handle other data fields, excluding the file object
                    const { coverImage: _coverImage, ...restData } = bookData;
                    Object.keys(restData).forEach(key => {
                        // Convert boolean values to strings
                        if (typeof restData[key] === 'boolean') {
                            formData.append(key, restData[key].toString());
                        } else {
                            formData.append(key, restData[key]);
                        }
                    });
                } else {
                    // If not a File object, append all fields normally
                    Object.keys(bookData).forEach(key => {
                        if (typeof bookData[key] === 'boolean') {
                            formData.append(key, bookData[key].toString());
                        } else {
                            formData.append(key, bookData[key]);
                        }
                    });
                }
                
                return {
                    url: '/create-book',
                    method: 'POST',
                    body: formData,
                    // Don't set Content-Type, browser will set it with boundary
                    formData: true
                };
            },
            invalidatesTags: ['Books']
        }),
        updateBook: builder.mutation({
            query: ({ id, ...bookData }) => {
                // Create a FormData object for multipart/form-data
                const formData = new FormData();
                
                // Handle file upload for coverImage
                if (bookData.coverImage instanceof File) {
                    formData.append('coverImage', bookData.coverImage);
                    
                    // Handle other data fields, excluding the file object
                    const { coverImage: _coverImage, ...restData } = bookData;
                    Object.keys(restData).forEach(key => {
                        if (typeof restData[key] === 'boolean') {
                            formData.append(key, restData[key].toString());
                        } else {
                            formData.append(key, restData[key]);
                        }
                    });
                } else {
                    // If not a File object, append all fields normally
                    Object.keys(bookData).forEach(key => {
                        if (typeof bookData[key] === 'boolean') {
                            formData.append(key, bookData[key].toString());
                        } else {
                            formData.append(key, bookData[key]);
                        }
                    });
                }
                
                return {
                    url: `/edit/${id}`,
                    method: 'PUT',
                    body: formData,
                    formData: true
                };
            },
            invalidatesTags: ['Books']
        }),
        deleteBook: builder.mutation({
            query: (id) => ({
                url: `/delete/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Books']
        })
    })
})

export const {
    useFetchAllBooksQuery,
    useFetchBookByIdQuery,
    useSearchBooksQuery,
    useAddBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation
} = booksAPI;

export default booksAPI;

