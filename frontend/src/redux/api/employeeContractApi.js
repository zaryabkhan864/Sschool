// redux api
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";

export const employeeContractApi = createApi({
  reducerPath: "employeeContractApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  tagTypes: [
    "EmployeeContract",
    "UncontractedEmployees",
    "ActiveContracts",
    "StaffNeedingContract",
    "ExpiringContracts",
    "AdminUser",
    "AdminUsers",
  ],

  endpoints: (builder) => ({
    // ================= GET ALL CONTRACTS =================
    // ✅ SUPPORTS: gender (filters by employee gender) and countOnly
    // (returns just { total }, used for cheap stats without pulling the
    // full contract list). keyword resolved against the employee's
    // name/phone/email on the backend.
    getEmployeeContracts: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
          employee: params?.employee,
          role: params?.role,
          academicYear: params?.academicYear,
          campus: params?.campus,
          startDate: params?.startDate,
          endDate: params?.endDate,
          paginate: params?.paginate,
          gender: params?.gender,
          countOnly: params?.countOnly,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return { url: "/employee-contracts", params: queryParams };
      },
      providesTags: (result) =>
        result?.contracts
          ? [
              ...result.contracts.map(({ _id }) => ({ type: "EmployeeContract", id: _id })),
              { type: "EmployeeContract", id: "LIST" },
            ]
          : [{ type: "EmployeeContract", id: "LIST" }],
    }),

    // ================= GET SINGLE CONTRACT =================
    getEmployeeContractDetails: builder.query({
      query: (id) => `/employee-contracts/${id}`,
      providesTags: (result, error, id) => [{ type: "EmployeeContract", id }],
    }),

    // ================= CONTRACT HISTORY FOR EMPLOYEE =================
    getEmployeeContractHistory: builder.query({
      query: ({ employeeId, academicYear } = {}) => {
        const params = {};
        if (academicYear) params.academicYear = academicYear;
        return {
          url: `/employee-contracts/history/${employeeId}`,
          params,
        };
      },
      providesTags: (result, error, { employeeId }) => [
        { type: "EmployeeContract", id: `HISTORY-${employeeId}` },
      ],
    }),

    // ================= EXPIRING SOON =================
    getExpiringContracts: builder.query({
      query: (days = 30) => ({
        url: "/employee-contracts/expiring-soon",
        params: { days },
      }),
      providesTags: ["ExpiringContracts"],
    }),

    // ================= CHECK ACTIVE CONTRACT ON DATE =================
    checkActiveContractOnDate: builder.query({
      query: ({ employeeId, campusId, date } = {}) => {
        const params = { employeeId, campusId };
        if (date) params.date = date;
        return { url: "/employee-contracts/check", params };
      },
    }),

    // ================= UNCONTRACTED EMPLOYEES =================
    getUncontractedEmployees: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params?.academicYear) queryParams.academicYear = params.academicYear;
        if (params?.campus) queryParams.campus = params.campus;
        return {
          url: "/staff/uncontracted",
          params: Object.keys(queryParams).length ? queryParams : undefined,
        };
      },
      providesTags: ["UncontractedEmployees"],
    }),

    // ================= ACTIVE CONTRACTS =================
    getActiveContracts: builder.query({
      query: () => "/staff/active",
      providesTags: ["ActiveContracts"],
    }),

    // ================= STAFF NEEDING CONTRACT =================
    // ✅ SUPPORTS: page, limit (real server-side pagination), keyword
    // (name/phone/email search), gender filter, and countOnly (returns
    // just { total }, used for the stats card on the frontend).
    getStaffNeedingContract: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params?.campus) queryParams.campus = params.campus;
        if (params?.academicYear) queryParams.academicYear = params.academicYear;
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.keyword) queryParams.keyword = params.keyword;
        if (params?.gender) queryParams.gender = params.gender;
        if (params?.countOnly) queryParams.countOnly = params.countOnly;
        return {
          url: "/staff/needing-contract",
          params: Object.keys(queryParams).length ? queryParams : undefined,
        };
      },
      providesTags: ["StaffNeedingContract"],
    }),

    // ================= CREATE CONTRACT =================
    createEmployeeContract: builder.mutation({
      query: (body) => ({
        url: "/admin/employee-contracts",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.employee },
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "StaffNeedingContract",
        "AdminUsers",
      ],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const employeeId = data?.contract?.employee?._id || data?.contract?.employee || body?.employee;
          dispatch(
            authApi.util.invalidateTags([
              ...(employeeId ? [{ type: "AdminUser", id: employeeId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    // ================= UPDATE CONTRACT =================
    updateEmployeeContract: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/employee-contracts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeContract", id },
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const employeeId = data?.contract?.employee?._id || data?.contract?.employee;
          dispatch(
            authApi.util.invalidateTags([
              ...(employeeId ? [{ type: "AdminUser", id: employeeId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    // ================= UPDATE LEAVE ALLOWANCE =================
    // annualLeaveAllowance lives inside the (otherwise locked) salary
    // block, so it gets its own small mutation hitting the dedicated route.
    updateLeaveAllowance: builder.mutation({
      query: ({ id, annualLeaveAllowance }) => ({
        url: `/admin/employee-contracts/${id}/leave-allowance`,
        method: "PATCH",
        body: { annualLeaveAllowance },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeContract", id },
        { type: "EmployeeContract", id: "LIST" },
      ],
    }),

    // ================= DELETE CONTRACT (soft) =================
    deleteEmployeeContract: builder.mutation({
      query: (id) => ({
        url: `/admin/employee-contracts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "AdminUsers",
      ],
    }),

    // ================= TERMINATE CONTRACT =================
    terminateContract: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/employee-contracts/${id}/terminate`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeContract", id },
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const employeeId = data?.contract?.employee?._id || data?.contract?.employee;
          dispatch(
            authApi.util.invalidateTags([
              ...(employeeId ? [{ type: "AdminUser", id: employeeId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    // ================= RESIGN CONTRACT =================
    resignContract: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/employee-contracts/${id}/resign`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeContract", id },
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const employeeId = data?.contract?.employee?._id || data?.contract?.employee;
          dispatch(
            authApi.util.invalidateTags([
              ...(employeeId ? [{ type: "AdminUser", id: employeeId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    // ================= APPROVE RE-HIRE =================
    approveReHire: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/employee-contracts/${id}/rehire`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeContract", id },
        { type: "EmployeeContract", id: "LIST" },
      ],
    }),

    // ================= MARK EXPIRY ALERT SENT =================
    markExpiryAlertSent: builder.mutation({
      query: (id) => ({
        url: `/admin/employee-contracts/${id}/alert-sent`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EmployeeContract", id },
        "ExpiringContracts",
      ],
    }),

    // ================= TRANSFER EMPLOYEE =================
    transferEmployee: builder.mutation({
      query: (body) => ({
        url: "/admin/employee-contracts/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.employeeId },
        { type: "EmployeeContract", id: "LIST" },
        "UncontractedEmployees",
        "ActiveContracts",
        "StaffNeedingContract",
        "AdminUsers",
      ],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.util.invalidateTags([
              ...(body?.employeeId ? [{ type: "AdminUser", id: body.employeeId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    // ================= EXPIRE OVERDUE CONTRACTS (cron) =================
    expireOverdueContracts: builder.mutation({
      query: () => ({
        url: "/admin/employee-contracts/expire-overdue",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "EmployeeContract", id: "LIST" },
        "ActiveContracts",
        "UncontractedEmployees",
        "ExpiringContracts",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(["AdminUsers"]));
        } catch (e) {}
      },
    }),

    // ================= USER DETAILS (cross-api helper) =================
    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),
  }),
});

export const {
  useGetEmployeeContractsQuery,
  useGetEmployeeContractDetailsQuery,
  useGetEmployeeContractHistoryQuery,
  useGetExpiringContractsQuery,
  useCheckActiveContractOnDateQuery,
  useGetUncontractedEmployeesQuery,
  useGetActiveContractsQuery,
  useGetStaffNeedingContractQuery,
  useCreateEmployeeContractMutation,
  useUpdateEmployeeContractMutation,
  useUpdateLeaveAllowanceMutation,
  useDeleteEmployeeContractMutation,
  useTerminateContractMutation,
  useResignContractMutation,
  useApproveReHireMutation,
  useMarkExpiryAlertSentMutation,
  useTransferEmployeeMutation,
  useExpireOverdueContractsMutation,
  useGetUserByIdQuery,
} = employeeContractApi;
