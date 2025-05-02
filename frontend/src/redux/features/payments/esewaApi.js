import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Determine the base URL based on environment
const getBaseUrl = () => {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
        console.log('Using development eSewa API URL');
        return 'http://localhost:5000/api/payments/esewa';
    }
    // For production
    console.log('Using production eSewa API URL: https://book-web-backend-xi.vercel.app/api/payments/esewa');
    return 'https://book-web-backend-xi.vercel.app/api/payments/esewa';
};

const esewaApi = createApi({
    reducerPath: 'esewaApi',
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
    }),
    endpoints: (builder) => ({
        initiateEsewaPayment: builder.mutation({
            query: (orderId) => ({
                url: `/initiate/${orderId}`,
                method: 'POST',
            }),
        }),
        verifyEsewaPayment: builder.mutation({
            query: (paymentData) => ({
                url: '/verify',
                method: 'POST',
                body: paymentData,
            }),
        }),
        checkEsewaPaymentStatus: builder.query({
            query: (orderId) => `/status/${orderId}`,
        }),
    }),
});

export const {
    useInitiateEsewaPaymentMutation,
    useVerifyEsewaPaymentMutation,
    useCheckEsewaPaymentStatusQuery,
} = esewaApi;

export default esewaApi; 