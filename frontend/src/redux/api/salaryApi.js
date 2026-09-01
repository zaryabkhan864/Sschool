import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salariesApi = createApi({
  reducerPath: "salariesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Salaries", "EmployeeSalaries", "UnpaidSalaries", "SalarySummary"],

  endpoints: (builder) => ({
    // GET ALL
    getSalaries: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
          paginate: params?.paginate,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return { url: "/finance/salaries", params: queryParams };
      },
      providesTags: (result) =>
        result?.salaries
          ? [
              ...result.salaries.map(({ _id }) => ({ type: "Salaries", id: _id })),
              { type: "Salaries", id: "LIST" },
            ]
          : [{ type: "Salaries", id: "LIST" }],
    }),

    // GET ONE
    getSalaryDetails: builder.query({
      query: (id) => `/finance/salaries/${id}`,
      providesTags: (result, error, id) => [{ type: "Salaries", id }],
    }),

    // GET BY EMPLOYEE
    getSalariesByEmployee: builder.query({
      query: (id) => `/finance/salaries/employee/${id}`,
      providesTags: (result, error, id) => [
        { type: "EmployeeSalaries", id },
      ],
    }),

    // GET UNPAID
    getUnpaidSalaries: builder.query({
      query: () => "/finance/salaries/unpaid",
      providesTags: ["UnpaidSalaries"],
    }),

    // GET SUMMARY FOR EMPLOYEE
    getEmployeeSalarySummary: builder.query({
      query: (employeeId) => `/finance/salaries/summary/${employeeId}`,
      providesTags: (result, error, employeeId) => [
        { type: "SalarySummary", id: employeeId },
      ],
    }),

    // CREATE
    createSalary: builder.mutation({
      query: (body) => ({
        url: "/finance/salaries",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "Salaries", id: "LIST" },
        { type: "EmployeeSalaries", id: body?.employeeId },
        { type: "SalarySummary", id: body?.employeeId },
        "UnpaidSalaries",
      ],
    }),

    // UPDATE
    updateSalary: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/finance/salaries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Salaries", id },
        { type: "Salaries", id: "LIST" },
        "UnpaidSalaries",
      ],
    }),

    // DELETE
    deleteSalary: builder.mutation({
      query: (id) => ({
        url: `/finance/salaries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Salaries", id: "LIST" }, "UnpaidSalaries"],
    }),

    // MARK AS PAID
    markSalaryAsPaid: builder.mutation({
      query: ({ id, paymentDate }) => ({
        url: `/finance/salaries/${id}/pay`,
        method: "PATCH",
        body: paymentDate ? { paymentDate } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Salaries", id },
        { type: "Salaries", id: "LIST" },
        "UnpaidSalaries",
      ],
    }),
  }),
});

export const {
  useGetSalariesQuery,
  useGetSalaryDetailsQuery,
  useGetSalariesByEmployeeQuery,
  useGetUnpaidSalariesQuery,
  useGetEmployeeSalarySummaryQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
  useMarkSalaryAsPaidMutation,
} = salariesApi;
