import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salariesApi = createApi({
    reducerPath: "salariesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Salaries", "EmployeeSalaries", "UnpaidSalaries"],
    endpoints: (builder) => ({
        getSalaries: builder.query({
            query: () => "/finance/get/salaries",
            providesTags: ["Salaries"],
        }),
        getSalaryDetails: builder.query({
            query: (id) => `/salaries/${id}`,
            providesTags: ["Salaries"],
        }),
        createSalary: builder.mutation({
            query: (body) => ({
                url: "/finance/salaries",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Salaries"],
        }),
        updateSalary: builder.mutation({
            query: ({ id, body }) => ({
                url: `/salaries/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Salaries"],
        }),
        deleteSalary: builder.mutation({
            query: (id) => ({
                url: `/salaries/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Salaries"],
        }),
        getSalariesByEmployee: builder.query({
            query: (id) => `/salaries/employee/${id}`,
            providesTags: ["EmployeeSalaries"],
        }),
        getUnpaidSalaries: builder.query({
            query: () => "/salaries/unpaid",
            providesTags: ["UnpaidSalaries"],
        }),
    }),
});

export const {
    useGetSalariesQuery,
    useGetSalaryDetailsQuery,
    useCreateSalaryMutation,
    useUpdateSalaryMutation,
    useDeleteSalaryMutation,
    useGetSalariesByEmployeeQuery,
    useGetUnpaidSalariesQuery,
} = salariesApi;