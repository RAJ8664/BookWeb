import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseURL from "../../../utils/baseURL";

// Determine the base URL based on environment
const getBaseUrl = () => {
    const baseApiUrl = getBaseURL();
    console.log('Using eSewa API URL:', `${baseApiUrl}/api/payments/esewa`);
    return `${baseApiUrl}/api/payments/esewa`;
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