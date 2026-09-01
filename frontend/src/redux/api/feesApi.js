// redux apis 
// redux 
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const feesApi = createApi({
    reducerPath: "feesApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: [
        "Fees",
        "StudentFees",
        "UnpaidFees",
        "OverdueFees",
        "CurrencyFees",
        "UpcomingDues",
        "PendingDues",   // 👈 NEW
        "ClearedDues",   // 👈 NEW
        "PaidFees",      // 👈 NEW
        "UpcomingDuesByStudent", // 👈 NEW
        "PaidDuesByStudent",     // 👈 NEW
    ],
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
            invalidatesTags: ["Fees", "CurrencyFees"],
        }),
        updateFee: builder.mutation({
            query: ({ id, body }) => ({
                url: `/fees/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Fees", "CurrencyFees"],
        }),
        deleteFee: builder.mutation({
            query: (id) => ({
                url: `/fees/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Fees", "CurrencyFees"],
        }),
        getFeesByStudent: builder.query({
            query: (id) => `/fees/student/${id}`,
            providesTags: (result, error, id) => [{ type: "StudentFees", id }],
        }),
        getUnpaidFees: builder.query({
            query: () => "/fees/unpaid",
            providesTags: ["UnpaidFees"],
        }),
        getOverdueFees: builder.query({
            query: () => "/fees/overdue",
            providesTags: ["OverdueFees"],
        }),
        // 👇 new endpoint: currency-wise stats
        getFeesByCurrency: builder.query({
            query: () => "/fees/statistics/currency",
            providesTags: ["CurrencyFees"],
        }),
        // 👇 new: fee installments due soon that finance needs to chase
        // (covers Monthly/Quarterly/Half Yearly payers whose next due
        // date isn't obvious from a single annual total).
        getUpcomingFeeDues: builder.query({
            query: (days = 7) => ({
                url: "/fees/reminders/upcoming",
                params: { days },
            }),
            providesTags: ["UpcomingDues"],
        }),
        // 👇 new: mark a specific installment's reminder as sent so it
        // stops showing up in the upcoming-dues list.
        markFeeReminderSent: builder.mutation({
            query: (id) => ({
                url: `/fees/${id}/reminder-sent`,
                method: "PATCH",
            }),
            invalidatesTags: ["UpcomingDues"],
        }),

        // ================= NEW: PENDING DUES (ListFees screen) =================
        // One row per student who owes something — powers the "who needs to
        // pay" list. Supports keyword/gender search, pagination, a cheap
        // countOnly mode for stats cards, and duePeriod to filter by
        // overdue / this_month / next_month / later.
        getPendingDues: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    page: params?.page,
                    limit: params?.limit,
                    keyword: params?.keyword,
                    gender: params?.gender,
                    countOnly: params?.countOnly,
                    duePeriod: params?.duePeriod,
                };
                Object.keys(queryParams).forEach(
                    (key) => queryParams[key] === undefined && delete queryParams[key]
                );
                return { url: "/fees/dues/pending", params: queryParams };
            },
            providesTags: ["PendingDues"],
        }),

        // ================= NEW: CLEARED DUES (ListDues screen) =================
        getClearedDues: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    page: params?.page,
                    limit: params?.limit,
                    keyword: params?.keyword,
                    gender: params?.gender,
                    countOnly: params?.countOnly,
                };
                Object.keys(queryParams).forEach(
                    (key) => queryParams[key] === undefined && delete queryParams[key]
                );
                return { url: "/fees/dues/cleared", params: queryParams };
            },
            providesTags: ["ClearedDues"],
        }),

        // ================= NEW: PAID FEES LIST (PaidFeesStudentDetails screen) =================
        // Flat, most-recent-first list of Paid fee records with the paying
        // student's details populated — the receipt-history counterpart to
        // getPendingDues above. Supports the same keyword/gender/pagination
        // pattern, plus feeType and a paymentDate range for reporting.
        getPaidFeesList: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    page: params?.page,
                    limit: params?.limit,
                    studentId: params?.studentId,
                    keyword: params?.keyword,
                    gender: params?.gender,
                    feeType: params?.feeType,
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    countOnly: params?.countOnly,
                };
                Object.keys(queryParams).forEach(
                    (key) => queryParams[key] === undefined && delete queryParams[key]
                );
                return { url: "/fees/paid", params: queryParams };
            },
            providesTags: ["PaidFees"],
        }),

        // ================= NEW: UPCOMING DUES BY STUDENT (PaidFeesOrDueList screen) =================
        // One row per student whose installment(s) fall due within the next
        // `days` (default 7 on the backend) — distinct from getPendingDues
        // (broader "needs action now" bucket) and from getUpcomingFeeDues
        // (flat, one row per installment). Each row carries its own
        // `feeIds` so "Pay Now" can pre-select exactly that group.
        getUpcomingDuesByStudent: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    days: params?.days,
                    page: params?.page,
                    limit: params?.limit,
                    keyword: params?.keyword,
                    gender: params?.gender,
                    countOnly: params?.countOnly,
                };
                Object.keys(queryParams).forEach(
                    (key) => queryParams[key] === undefined && delete queryParams[key]
                );
                return { url: "/fees/dues/upcoming", params: queryParams };
            },
            providesTags: ["UpcomingDuesByStudent"],
        }),

        // ================= NEW: BULK MARK REMINDED =================
        // Called as markFeeRemindersSentBulk(feeIds) — the array IS the
        // argument, not wrapped in an object (matches PaidFeesOrDueList.jsx).
        markFeeRemindersSentBulk: builder.mutation({
            query: (feeIds) => ({
                url: "/fees/reminders/mark-sent-bulk",
                method: "PATCH",
                body: { feeIds },
            }),
            invalidatesTags: ["UpcomingDuesByStudent", "UpcomingDues"],
        }),

        // ================= NEW: PAID DUES BY STUDENT (PaidFeesList screen) =================
        // One row per student who has made at least one payment — total
        // paid, how many installments, last payment date. Distinct from
        // getPaidFeesList (flat, one row per installment, used by the
        // per-student drill-down PaidFeesStudentDetails.jsx).
        getPaidDuesByStudent: builder.query({
            query: (params = {}) => {
                const queryParams = {
                    page: params?.page,
                    limit: params?.limit,
                    keyword: params?.keyword,
                    gender: params?.gender,
                    countOnly: params?.countOnly,
                };
                Object.keys(queryParams).forEach(
                    (key) => queryParams[key] === undefined && delete queryParams[key]
                );
                return { url: "/fees/dues/paid", params: queryParams };
            },
            providesTags: ["PaidDuesByStudent"],
        }),

        // ================= NEW: BULK PAY (CollectFee screen) =================
        payFees: builder.mutation({
            query: (body) => ({
                url: "/fees/pay",
                method: "PATCH",
                body,
            }),
            invalidatesTags: (result, error, body) => [
                "Fees",
                "PendingDues",
                "ClearedDues",
                "CurrencyFees",
                "UpcomingDues",
                "UpcomingDuesByStudent",
                "PaidDuesByStudent",
                "PaidFees",
                ...(body?.studentId ? [{ type: "StudentFees", id: body.studentId }] : []),
            ],
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
    useGetFeesByCurrencyQuery,  
    useGetUpcomingFeeDuesQuery,  
    useMarkFeeReminderSentMutation, 
    useGetPendingDuesQuery,       // 👈 NEW
    useGetClearedDuesQuery,       // 👈 NEW
    usePayFeesMutation,           // 👈 NEW
    useGetPaidFeesListQuery,      // 👈 NEW
    useGetUpcomingDuesByStudentQuery,  // 👈 NEW
    useMarkFeeRemindersSentBulkMutation, // 👈 NEW
    useGetPaidDuesByStudentQuery, // 👈 NEW
} = feesApi;
