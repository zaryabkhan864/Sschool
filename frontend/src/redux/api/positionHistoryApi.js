import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const positionHistoryApi = createApi({
  reducerPath: "positionHistoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["ContractTimeline", "ContractCurrentPosition", "EmployeeTimeline"],

  endpoints: (builder) => ({
    // ========== Record a position change ==========
    // body: { contractId, role, designationLevel, salary, effectiveDate, reason, note }
    // reason must be one of: "initial" | "promotion" | "demotion" | "salary_revision" | "lateral_move"
    recordPositionChange: builder.mutation({
      query(body) {
        return { url: "/position-history", method: "POST", body };
      },
      invalidatesTags: (result, error, body) => [
        { type: "ContractTimeline", id: body?.contractId },
        { type: "ContractCurrentPosition", id: body?.contractId },
        "EmployeeTimeline",
      ],
    }),

    // ========== Contract-scoped ==========
    getContractPositionTimeline: builder.query({
      query: (contractId) => `/position-history/contract/${contractId}`,
      providesTags: (result, error, contractId) => [
        { type: "ContractTimeline", id: contractId },
      ],
    }),

    getContractCurrentPosition: builder.query({
      query: (contractId) => `/position-history/contract/${contractId}/current`,
      providesTags: (result, error, contractId) => [
        { type: "ContractCurrentPosition", id: contractId },
      ],
    }),

    // ========== Employee-scoped: full career across all contracts ==========
    getEmployeeCareerTimeline: builder.query({
      query: (employeeId) => `/position-history/employee/${employeeId}`,
      providesTags: (result, error, employeeId) => [
        { type: "EmployeeTimeline", id: employeeId },
      ],
    }),
  }),
});

export const {
  useRecordPositionChangeMutation,
  useGetContractPositionTimelineQuery,
  useGetContractCurrentPositionQuery,
  useGetEmployeeCareerTimelineQuery,
} = positionHistoryApi;
