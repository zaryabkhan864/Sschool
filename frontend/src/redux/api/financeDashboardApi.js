// frontend/src/redux/api/financeDashboardApi.js
//
// NEW FILE — separate api slice, doesn't touch feesApi/salariesApi/etc.
// Only powers the "Recent Transactions" panel on the Finance Dashboard.

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financeDashboardApi = createApi({
    reducerPath: "financeDashboardApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["RecentActivity", "PayrollOverview"],
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
    }),
});

export const {
    useGetRecentFinanceActivityQuery,
    useGetPayrollOverviewQuery,
} = financeDashboardApi;
