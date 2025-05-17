import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseURL from "../../../utils/baseURL";

const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseURL()}/api/`,
    }),
    tagTypes: ['Order'],
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (data) => ({
                url: 'orders',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order'],
        }),
        getOrderByEmail: builder.query({
            query: (email) => `orders/email/${email}`,
            providesTags: ['Order'],
        }),
        getAllOrders: builder.query({
            query: () => 'orders',
            providesTags: ['Order'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({id, status}) => ({
                url: `orders/${id}/status`,
                method: "PUT",
                body: { status }
            }),
            invalidatesTags: ['Order']
        }),
        cancelOrder: builder.mutation({
            query: (id) => ({
                url: `orders/${id}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
        requestRefund: builder.mutation({
            query: ({id, refundReason}) => ({
                url: `orders/${id}/refund`,
                method: 'PUT',
                body: { refundReason },
            }),
            invalidatesTags: ['Order'],
        }),
        approveRefund: builder.mutation({
            query: (id) => ({
                url: `orders/${id}/approve-refund`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
        resetAllOrders: builder.mutation({
            query: () => ({
                url: 'orders/reset',
                method: 'DELETE',
            }),
            invalidatesTags: ['Order'],
        })
    })
})

export const {
    useCreateOrderMutation, 
    useGetOrderByEmailQuery,
    useGetAllOrdersQuery,
    useUpdateOrderStatusMutation,
    useCancelOrderMutation,
    useRequestRefundMutation,
    useApproveRefundMutation,
    useResetAllOrdersMutation
} = ordersApi;

export default ordersApi;