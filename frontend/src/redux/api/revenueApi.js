import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const revenueApi = createApi({
    reducerPath: "revenueApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Revenue"],
    endpoints: (builder) => ({
        getRevenue: builder.query({
            query: () => "/finance/revenue",
            providesTags: ["Revenue"],
        }),
        getRevenueDetails: builder.query({
            query: (id) => `/revenue/${id}`,
            providesTags: ["Revenue"],
        }),
        createRevenue: builder.mutation({
            query: (body) => ({
                url: "/finance/revenue",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Revenue"],
        }),
        updateRevenue: builder.mutation({
            query: ({ id, body }) => ({
                url: `/revenue/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Revenue"],
        }),
        deleteRevenue: builder.mutation({
            query: (id) => ({
                url: `/revenue/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Revenue"],
        }),
        getRevenueVsExpenses: builder.query({
            query: () => "/revenue/expenses",
        }),

    }),
});

export const {
    useGetRevenueQuery,
    useGetRevenueDetailsQuery,
    useCreateRevenueMutation,
    useUpdateRevenueMutation,
    useDeleteRevenueMutation,
    useGetRevenueVsExpensesQuery
} = revenueApi;