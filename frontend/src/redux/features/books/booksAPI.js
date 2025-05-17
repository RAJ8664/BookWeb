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

// Helper function to prepare form data
const prepareFormData = (bookData) => {
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
    
    return formData;
};

const booksAPI = createApi({
    reducerPath: 'booksAPI',
    baseQuery,
    tagTypes: ['Books', 'Book', 'NewArrivals', 'BestSellers', 'AwardWinners', 'Categories'],
    endpoints: (builder) => ({
        fetchAllBooks: builder.query({
            query: () => '/',
            providesTags: (result) => 
                result?.books
                    ? [
                        ...result.books.map(({ _id }) => ({ type: 'Books', id: _id })),
                        { type: 'Books', id: 'LIST' }
                    ]
                    : [{ type: 'Books', id: 'LIST' }],
            transformResponse: (response) => {
                // Check if the response has a books property
                return response.books || response;
            }
        }),
        fetchBookById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Book', id }],
            transformResponse: (response) => {
                // Check if the response has a book property
                return response.book || response;
            }
        }),
        searchBooks: builder.query({
            query: (searchTerm) => `/search?query=${encodeURIComponent(searchTerm)}`,
            providesTags: () => [{ type: 'Books', id: 'SEARCH' }],
            transformResponse: (response) => {
                return response.results || [];
            }
        }),
        fetchNewArrivals: builder.query({
            query: () => '/new-arrivals',
            providesTags: [{ type: 'NewArrivals', id: 'LIST' }],
            transformResponse: (response) => response.books || response,
        }),
        fetchBestSellers: builder.query({
            query: () => '/best-sellers',
            providesTags: [{ type: 'BestSellers', id: 'LIST' }],
            transformResponse: (response) => response.books || response,
        }),
        fetchAwardWinners: builder.query({
            query: () => '/award-winners',
            providesTags: [{ type: 'AwardWinners', id: 'LIST' }],
            transformResponse: (response) => response.books || response,
        }),
        fetchBooksByCategory: builder.query({
            query: (category) => `/category/${encodeURIComponent(category)}`,
            providesTags: (result, error, category) => [{ type: 'Categories', id: category }],
            transformResponse: (response) => response.books || response,
        }),
        addBook: builder.mutation({
            query: (bookData) => ({
                url: '/create-book',
                method: 'POST',
                body: prepareFormData(bookData),
                formData: true
            }),
            invalidatesTags: [
                { type: 'Books', id: 'LIST' },
                { type: 'NewArrivals', id: 'LIST' },
                { type: 'BestSellers', id: 'LIST' },
                { type: 'AwardWinners', id: 'LIST' }
            ]
        }),
        updateBook: builder.mutation({
            query: ({ id, ...bookData }) => ({
                url: `/edit/${id}`,
                method: 'PUT',
                body: prepareFormData(bookData),
                formData: true
            }),
            // Optimistic update
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                // Get current cache data
                try {
                    // We keep this variable even though it appears unused
                    // because we might need to uncomment the undo() call below
                    const _updateCache = dispatch(
                        booksAPI.util.updateQueryData('fetchBookById', id, (draft) => {
                            Object.assign(draft, patch);
                        })
                    );
                    
                    // Wait for the request to complete
                    await queryFulfilled;
                } catch {
                    // If the update fails, revert the cache update
                    // _updateCache.undo();
                    
                    // If there was an error, we need to refetch
                    dispatch(booksAPI.util.invalidateTags([{ type: 'Book', id }]));
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Book', id },
                { type: 'Books', id: 'LIST' },
                { type: 'NewArrivals', id: 'LIST' },
                { type: 'BestSellers', id: 'LIST' },
                { type: 'AwardWinners', id: 'LIST' }
            ]
        }),
        deleteBook: builder.mutation({
            query: (id) => ({
                url: `/delete/${id}`,
                method: 'DELETE'
            }),
            // Optimistic update
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistically remove the book from the cache
                const patchResult = dispatch(
                    booksAPI.util.updateQueryData('fetchAllBooks', undefined, (draft) => {
                        if (Array.isArray(draft)) {
                            return draft.filter(book => book._id !== id);
                        } else if (draft.books && Array.isArray(draft.books)) {
                            draft.books = draft.books.filter(book => book._id !== id);
                        }
                    })
                );
                
                try {
                    // Wait for the request to complete
                    await queryFulfilled;
                } catch {
                    // If the deletion fails, revert the cache update
                    patchResult.undo();
                }
            },
            invalidatesTags: [
                { type: 'Books', id: 'LIST' },
                { type: 'NewArrivals', id: 'LIST' },
                { type: 'BestSellers', id: 'LIST' },
                { type: 'AwardWinners', id: 'LIST' }
            ]
        })
    })
})

export const {
    useFetchAllBooksQuery,
    useFetchBookByIdQuery,
    useSearchBooksQuery,
    useFetchNewArrivalsQuery,
    useFetchBestSellersQuery,
    useFetchAwardWinnersQuery,
    useFetchBooksByCategoryQuery,
    useAddBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation
} = booksAPI;

export default booksAPI;

