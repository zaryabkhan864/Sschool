import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const expensesApi = createApi({
    reducerPath: "expensesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Expenses", "ExpenseDetails", "ExpensesByCategory", "ExpensesByVendor", "ExpenseStats"],
    endpoints: (builder) => ({
        // Get all expenses — supports category, keyword, dateFrom/dateTo,
        // page/limit/countOnly. campus/academicYear default from cookies
        // server-side, no need to pass them.
        getExpenses: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    page: params?.page,
                    limit: params?.limit,
                    keyword: params?.keyword,
                    category: params?.category,
                    dateFrom: params?.dateFrom,
                    dateTo: params?.dateTo,
                    paginate: params?.paginate,
                    countOnly: params?.countOnly,
                };
                Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
                return { url: "/finance/get/expenses", params: queryParams };
            },
            providesTags: (result) =>
                result?.expenses
                    ? [
                          ...result.expenses.map(({ _id }) => ({ type: "Expenses", id: _id })),
                          { type: "Expenses", id: "LIST" },
                      ]
                    : [{ type: "Expenses", id: "LIST" }],
        }),

        // Get single expense details
        getExpenseDetails: builder.query({
            query: (id) => `/expenses/${id}`,
            providesTags: (result, error, id) => [{ type: "ExpenseDetails", id }],
        }),

        // 👇 NEW: totals per category for the stat cards
        getExpenseStats: builder.query({
            query: (params = {}) => {
                const queryParams = { dateFrom: params?.dateFrom, dateTo: params?.dateTo };
                Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
                return { url: "/finance/expenses/stats", params: queryParams };
            },
            providesTags: ["ExpenseStats"],
        }),

        // Create new expense
        createExpense: builder.mutation({
            query: (body) => ({
                url: "/finance/expenses",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Expenses", id: "LIST" }, "ExpenseStats"],
        }),

        // Update expense
        updateExpense: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/expenses/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Expenses", id },
                { type: "Expenses", id: "LIST" },
                { type: "ExpenseDetails", id },
                "ExpenseStats",
            ],
        }),

        // Delete expense
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `/expenses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Expenses", id: "LIST" }, "ExpenseStats"],
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

export const {
    useGetExpensesQuery,
    useGetExpenseDetailsQuery,
    useGetExpenseStatsQuery,       // 👈 NEW
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetExpensesByCategoryQuery,
    useGetExpensesByVendorQuery,
} = expensesApi;
