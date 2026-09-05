import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Salaries", "EmployeeSalaries", "UnpaidSalaries", "SalarySummary", "SalaryStats"],

  endpoints: (builder) => ({
    getSalaries: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
          month: params?.month,
          year: params?.year,
          gender: params?.gender,
          paginate: params?.paginate,
          countOnly: params?.countOnly,
        };
        Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
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

    getSalaryDetails: builder.query({
      query: (id) => `/finance/salaries/${id}`,
      providesTags: (result, error, id) => [{ type: "Salaries", id }],
    }),

    getSalariesByEmployee: builder.query({
      query: (id) => `/finance/salaries/employee/${id}`,
      providesTags: (result, error, id) => [{ type: "EmployeeSalaries", id }],
    }),

    getUnpaidSalaries: builder.query({
      query: () => "/finance/salaries/unpaid",
      providesTags: ["UnpaidSalaries"],
    }),

    getUnpaidSalariesByEmployee: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          gender: params?.gender,
          countOnly: params?.countOnly,
        };
        Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
        return { url: "/finance/salaries/unpaid/by-employee", params: queryParams };
      },
      providesTags: ["UnpaidSalaries"],
    }),

    getEmployeeSalarySummary: builder.query({
      query: (employeeId) => `/finance/salaries/summary/${employeeId}`,
      providesTags: (result, error, employeeId) => [{ type: "SalarySummary", id: employeeId }],
    }),

    getSalaryStats: builder.query({
      query: (params = {}) => {
        const queryParams = { month: params?.month, year: params?.year };
        Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
        return { url: "/finance/salaries/stats", params: queryParams };
      },
      providesTags: ["SalaryStats"],
    }),

    createSalary: builder.mutation({
      query: (body) => ({ url: "/finance/salaries", method: "POST", body }),
      invalidatesTags: (result, error, body) => [
        { type: "Salaries", id: "LIST" },
        { type: "EmployeeSalaries", id: body?.employeeId },
        { type: "SalarySummary", id: body?.employeeId },
        "UnpaidSalaries",
        "SalaryStats",
      ],
    }),

    generateMonthlySalaries: builder.mutation({
      query: (body) => ({ url: "/finance/salaries/generate-monthly", method: "POST", body }),
      invalidatesTags: [{ type: "Salaries", id: "LIST" }, "UnpaidSalaries", "SalaryStats"],
    }),

    updateSalary: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/finance/salaries/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Salaries", id },
        { type: "Salaries", id: "LIST" },
        "UnpaidSalaries",
      ],
    }),

    deleteSalary: builder.mutation({
      query: (id) => ({ url: `/finance/salaries/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Salaries", id: "LIST" }, "UnpaidSalaries"],
    }),

    applySalaryDeduction: builder.mutation({
      query: ({ id, deductions, reason }) => ({
        url: `/finance/salaries/${id}/deduction`,
        method: "PATCH",
        body: { deductions, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Salaries", id },
        { type: "Salaries", id: "LIST" },
        "UnpaidSalaries",
        "SalaryStats",
      ],
    }),

    markSalaryAsPaid: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/finance/salaries/${id}/pay`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Salaries", id },
        { type: "Salaries", id: "LIST" },
        "UnpaidSalaries",
        "SalaryStats",
      ],
    }),

    paySalariesBulk: builder.mutation({
      query: (body) => ({ url: "/finance/salaries/pay-bulk", method: "PATCH", body }),
      invalidatesTags: [{ type: "Salaries", id: "LIST" }, "UnpaidSalaries", "SalaryStats"],
    }),
  }),
});

export const {
  useGetSalariesQuery,
  useGetSalaryDetailsQuery,
  useGetSalariesByEmployeeQuery,
  useGetUnpaidSalariesQuery,
  useGetUnpaidSalariesByEmployeeQuery,
  useGetEmployeeSalarySummaryQuery,
  useGetSalaryStatsQuery,
  useCreateSalaryMutation,
  useGenerateMonthlySalariesMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
  useApplySalaryDeductionMutation,
  useMarkSalaryAsPaidMutation,
  usePaySalariesBulkMutation,
} = salaryApi;
