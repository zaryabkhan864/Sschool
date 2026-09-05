// frontend/src/redux/api/financeDashboardApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financeDashboardApi = createApi({
    reducerPath: "financeDashboardApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["RecentActivity", "PayrollOverview", "AcademicYearSummary"],
    endpoints: (builder) => ({
        getRecentFinanceActivity: builder.query({
            query: (limit = 8) => ({
                url: "/finance/dashboard/recent-activity",
                params: { limit },
            }),
            providesTags: ["RecentActivity"],
        }),

        // Projected/committed monthly payroll from active EmployeeContract.salary
        // blocks — decided at contract-creation time, separate from what's
        // already been paid out (that's the Salary collection).
        getPayrollOverview: builder.query({
            query: () => "/finance/dashboard/payroll-overview",
            providesTags: ["PayrollOverview"],
        }),

        // 👇 NEW: "how much has come in, how much is still owed to us,
        // how much have we paid out, how much do we still owe" — for the
        // whole selected academic year, per currency.
        getAcademicYearFinanceSummary: builder.query({
            query: () => "/finance/dashboard/academic-year-summary",
            providesTags: ["AcademicYearSummary"],
        }),
    }),
});

export const {
    useGetRecentFinanceActivityQuery,
    useGetPayrollOverviewQuery,
    useGetAcademicYearFinanceSummaryQuery, // 👈 NEW
} = financeDashboardApi;