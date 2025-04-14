import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseURL from '../../../utils/baseURL'
const baseQuery = fetchBaseQuery({ 
    baseUrl: `${getBaseURL()}/api/books`,
    credentials: 'include',
    prepareHeaders: (headers, api) => {
        const token = localStorage.getItem('token');
        if(token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
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
        addBook: builder.mutation({
            query: (newbook) => ({
                url: '/create-book',
                method: 'POST',
                body: newbook
            }),
            invalidatesTags: ['Books']
        }),
        updateBook: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/edit/${id}`,
                method: 'PUT',
                body: rest,
                headers: {
                    'Content-Type': 'application/json'
                }

            }),
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

export const { useFetchAllBooksQuery, useFetchBookByIdQuery, useAddBookMutation, useUpdateBookMutation, useDeleteBookMutation } = booksAPI;
export default booksAPI;

