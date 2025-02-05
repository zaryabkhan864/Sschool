import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const feesApi = createApi({
    reducerPath: "feesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Fees", "StudentFees", "UnpaidFees", "OverdueFees"],
    endpoints: (builder) => ({
        getFees: builder.query({
            query: () => "/finance/get/fees",
            providesTags: ["Fees"],
        }),
        getFeeDetails: builder.query({
            query: (id) => `/fees/${id}`,
            providesTags: ["Fees"],
        }),
        createFee: builder.mutation({
            query: (body) => ({
                url: "/finance/fees",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Fees"],
        }),
        updateFee: builder.mutation({
            query: ({ id, body }) => ({
                url: `/fees/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Fees"],
        }),
        deleteFee: builder.mutation({
            query: (id) => ({
                url: `/fees/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Fees"],
        }),
        getFeesByStudent: builder.query({
            query: (id) => `/fees/student/${id}`,
            providesTags: ["StudentFees"],
        }),
        getUnpaidFees: builder.query({
            query: () => "/fees/unpaid",
            providesTags: ["UnpaidFees"],
        }),
        getOverdueFees: builder.query({
            query: () => "/fees/overdue",
            providesTags: ["OverdueFees"],
        }),
    }),
});

export const {
    useGetFeesQuery,
    useGetFeeDetailsQuery,
    useCreateFeeMutation,
    useUpdateFeeMutation,
    useDeleteFeeMutation,
    useGetFeesByStudentQuery,
    useGetUnpaidFeesQuery,
    useGetOverdueFeesQuery,
} = feesApi;
