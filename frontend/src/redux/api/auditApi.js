import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Audit", "AuditStats", "TerminatedAudit", "ReHireAudit"],

  endpoints: (builder) => ({
    // ================= STATS =================
    getAuditStats: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params?.campus) queryParams.campus = params.campus;
        if (params?.academicYear) queryParams.academicYear = params.academicYear;
        return { url: "/audit/stats", params: queryParams };
      },
      providesTags: ["AuditStats"],
    }),

    // ================= ALL CONTRACTS AUDIT =================
    getAllContractsAudit: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          campus: params?.campus,
          academicYear: params?.academicYear,
          status: params?.status,
          createdBy: params?.createdBy,
          terminatedBy: params?.terminatedBy,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return { url: "/audit/contracts", params: queryParams };
      },
      providesTags: (result) =>
        result?.contracts
          ? [
              ...result.contracts.map(({ _id }) => ({ type: "Audit", id: _id })),
              { type: "Audit", id: "LIST" },
            ]
          : [{ type: "Audit", id: "LIST" }],
    }),

    // ================= SINGLE CONTRACT AUDIT =================
    getContractAudit: builder.query({
      query: (id) => `/audit/contracts/${id}`,
      providesTags: (result, error, id) => [{ type: "Audit", id }],
    }),

    // ================= TERMINATED CONTRACTS AUDIT =================
    getTerminatedContractsAudit: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          campus: params?.campus,
          academicYear: params?.academicYear,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return { url: "/audit/terminated", params: queryParams };
      },
      providesTags: ["TerminatedAudit"],
    }),

    // ================= RE-HIRE APPROVED CONTRACTS =================
    getReHireApprovedContracts: builder.query({
      query: () => "/audit/rehire-approved",
      providesTags: ["ReHireAudit"],
    }),

    // ================= EMPLOYEE AUDIT HISTORY =================
    getEmployeeAuditHistory: builder.query({
      query: (employeeId) => `/audit/employee/${employeeId}`,
      providesTags: (result, error, employeeId) => [
        { type: "Audit", id: `EMPLOYEE-${employeeId}` },
      ],
    }),

    // ================= CONTRACTS CREATED BY ADMIN =================
    getContractsCreatedByAdmin: builder.query({
      query: ({ adminId, page, limit } = {}) => {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        return { url: `/audit/created-by/${adminId}`, params };
      },
      providesTags: (result, error, { adminId }) => [
        { type: "Audit", id: `CREATED-BY-${adminId}` },
      ],
    }),

    // ================= CONTRACTS UPDATED BY ADMIN =================
    getContractsUpdatedByAdmin: builder.query({
      query: ({ adminId, page, limit } = {}) => {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        return { url: `/audit/updated-by/${adminId}`, params };
      },
      providesTags: (result, error, { adminId }) => [
        { type: "Audit", id: `UPDATED-BY-${adminId}` },
      ],
    }),
  }),
});

export const {
  useGetAuditStatsQuery,
  useGetAllContractsAuditQuery,
  useGetContractAuditQuery,
  useGetTerminatedContractsAuditQuery,
  useGetReHireApprovedContractsQuery,
  useGetEmployeeAuditHistoryQuery,
  useGetContractsCreatedByAdminQuery,
  useGetContractsUpdatedByAdminQuery,
} = auditApi;
