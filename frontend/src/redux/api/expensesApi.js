import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const expensesApi = createApi({
    reducerPath: "expensesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Expenses", "ExpenseDetails", "ExpensesByCategory", "ExpensesByVendor"],
    endpoints: (builder) => ({
        // Get all expenses
        getExpenses: builder.query({
            query: () => "/finance/get/expenses",
            providesTags: ["Expenses"],
        }),

        // Get single expense details
        getExpenseDetails: builder.query({
            query: (id) => `/expenses/${id}`,
            providesTags: ["ExpenseDetails"],
        }),

        // Create new expense
        createExpense: builder.mutation({
            query: (body) => ({
                url: "/finance/expenses",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Expenses"],
        }),

        // Update expense
        updateExpense: builder.mutation({
            query: ({ id, body }) => ({
                url: `/expenses/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Expenses", "ExpenseDetails"],
        }),

        // Delete expense
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `/expenses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Expenses"],
        }),

        // Get expenses by category
        getExpensesByCategory: builder.query({
            query: (category) => `/expenses/category/${category}`,
            providesTags: ["ExpensesByCategory"],
        }),

        // Get expenses by vendor
        getExpensesByVendor: builder.query({
            query: (vendor) => `/expenses/vendor/${vendor}`,
            providesTags: ["ExpensesByVendor"],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetExpensesQuery,
    useGetExpenseDetailsQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetExpensesByCategoryQuery,
    useGetExpensesByVendorQuery,
} = expensesApi;