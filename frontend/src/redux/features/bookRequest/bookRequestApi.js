import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseURL from '../../../utils/baseURL';

export const bookRequestApi = createApi({
  reducerPath: 'bookRequestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseURL(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['BookRequests'],
  endpoints: (builder) => ({
    createBookRequest: builder.mutation({
      query: (requestData) => ({
        url: '/api/book-requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['BookRequests'],
    }),
    getAllBookRequests: builder.query({
      query: () => '/api/book-requests',
      transformResponse: (response) => {
        console.log('Transforming response:', response);
        return response;
      },
      providesTags: ['BookRequests'],
    }),
    getUnreadRequestsCount: builder.query({
      query: () => '/api/book-requests/unread-count',
      transformResponse: (response) => {
        console.log('Transforming unread count response:', response);
        return response;
      },
      providesTags: ['BookRequests'],
    }),
    markRequestAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/book-requests/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['BookRequests'],
    }),
    updateRequestStatus: builder.mutation({
      query: ({ id, status, adminComment }) => ({
        url: `/api/book-requests/${id}/status`,
        method: 'PATCH',
        body: { status, adminComment },
      }),
      invalidatesTags: ['BookRequests'],
    }),
    deleteBookRequest: builder.mutation({
      query: (id) => ({
        url: `/api/book-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BookRequests'],
    }),
  }),
});

export const {
  useCreateBookRequestMutation,
  useGetAllBookRequestsQuery,
  useGetUnreadRequestsCountQuery,
  useMarkRequestAsReadMutation,
  useUpdateRequestStatusMutation,
  useDeleteBookRequestMutation,
} = bookRequestApi; 