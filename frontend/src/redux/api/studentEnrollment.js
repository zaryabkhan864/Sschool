import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";
import { feesApi } from "./feesApi";

export const studentEnrollmentApi = createApi({
  reducerPath: "studentEnrollmentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  tagTypes: [
    "StudentEnrollment",
    "UnenrolledStudents",
    "EnrolledStudents",
    "StudentsNeedingEnrollment",
    "ExpiringEnrollments",
    "AdminUser",
    "AdminUsers",
  ],

  endpoints: (builder) => ({
    getStudentEnrollments: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
          student: params?.student,
          academicYear: params?.academicYear,
          classGroup: params?.classGroup,
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
        return { url: "/student-enrollments", params: queryParams };
      },
      providesTags: (result) =>
        result?.enrollments
          ? [
              ...result.enrollments.map(({ _id }) => ({ type: "StudentEnrollment", id: _id })),
              { type: "StudentEnrollment", id: "LIST" },
            ]
          : [{ type: "StudentEnrollment", id: "LIST" }],
    }),
    getStudentEnrollmentDetails: builder.query({
      query: (id) => `/student-enrollments/${id}`,
      providesTags: (result, error, id) => [{ type: "StudentEnrollment", id }],
    }),

    getStudentEnrollmentHistory: builder.query({
      query: ({ studentId, academicYear } = {}) => {
        const params = {};
        if (academicYear) params.academicYear = academicYear;
        return {
          url: `/student-enrollments/history/${studentId}`,
          params,
        };
      },
      providesTags: (result, error, { studentId }) => [
        { type: "StudentEnrollment", id: `HISTORY-${studentId}` },
      ],
    }),
    getExpiringEnrollments: builder.query({
      query: (days = 30) => ({
        url: "/student-enrollments/expiring-soon",
        params: { days },
      }),
      providesTags: ["ExpiringEnrollments"],
    }),

    checkActiveEnrollmentOnDate: builder.query({
      query: ({ studentId, campusId, date } = {}) => {
        const params = { studentId, campusId };
        if (date) params.date = date;
        return { url: "/student-enrollments/check", params };
      },
    }),
    getUnenrolledStudents: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params?.academicYear) queryParams.academicYear = params.academicYear;
        if (params?.campus) queryParams.campus = params.campus;
        if (params?.page !== undefined) queryParams.page = params.page;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.keyword) queryParams.keyword = params.keyword;
        if (params?.gender) queryParams.gender = params.gender;
        if (params?.countOnly) queryParams.countOnly = params.countOnly;
        return {
          url: "/students/unenrolled",
          params: Object.keys(queryParams).length ? queryParams : undefined,
        };
      },
      providesTags: ["UnenrolledStudents"],
    }),

    getEnrolledStudentsWithDetails: builder.query({
      query: () => "/students/enrolled",
      providesTags: ["EnrolledStudents"],
    }),
    getStudentsNeedingEnrollment: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params?.campus) queryParams.campus = params.campus;
        if (params?.academicYear) queryParams.academicYear = params.academicYear;
        return {
          url: "/students/needing-enrollment",
          params: Object.keys(queryParams).length ? queryParams : undefined,
        };
      },
      providesTags: ["StudentsNeedingEnrollment"],
    }),
    createStudentEnrollment: builder.mutation({
      query: (body) => ({
        url: "/admin/student-enrollments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.student },
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const studentId =
            data?.enrollment?.student?._id || data?.enrollment?.student || body?.student;
          dispatch(
            authApi.util.invalidateTags([
              ...(studentId ? [{ type: "AdminUser", id: studentId }] : []),
              "AdminUsers",
            ])
          );
          dispatch(feesApi.util.invalidateTags(["Fees", "CurrencyFees"]));
        } catch (e) {}
      },
    }),
    updateStudentEnrollment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/student-enrollments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StudentEnrollment", id },
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const studentId =
            data?.enrollment?.student?._id || data?.enrollment?.student;
          dispatch(
            authApi.util.invalidateTags([
              ...(studentId ? [{ type: "AdminUser", id: studentId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),
    deleteStudentEnrollment: builder.mutation({
      query: (id) => ({
        url: `/admin/student-enrollments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
    }),
    terminateEnrollment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/student-enrollments/${id}/terminate`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StudentEnrollment", id },
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const studentId =
            data?.enrollment?.student?._id || data?.enrollment?.student;
          dispatch(
            authApi.util.invalidateTags([
              ...(studentId ? [{ type: "AdminUser", id: studentId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),
    resignEnrollment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/student-enrollments/${id}/resign`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StudentEnrollment", id },
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const studentId =
            data?.enrollment?.student?._id || data?.enrollment?.student;
          dispatch(
            authApi.util.invalidateTags([
              ...(studentId ? [{ type: "AdminUser", id: studentId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),

    approveReEnroll: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/student-enrollments/${id}/re-enroll`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StudentEnrollment", id },
        { type: "StudentEnrollment", id: "LIST" },
      ],
    }),
    markEnrollmentExpiryAlertSent: builder.mutation({
      query: (id) => ({
        url: `/admin/student-enrollments/${id}/alert-sent`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StudentEnrollment", id },
        "ExpiringEnrollments",
      ],
    }),
    transferStudent: builder.mutation({
      query: (body) => ({
        url: "/admin/student-enrollments/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.studentId },
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.util.invalidateTags([
              ...(body?.studentId ? [{ type: "AdminUser", id: body.studentId }] : []),
              "AdminUsers",
            ])
          );
        } catch (e) {}
      },
    }),
    expireOverdueEnrollments: builder.mutation({
      query: () => ({
        url: "/admin/student-enrollments/expire-overdue",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "StudentEnrollment", id: "LIST" },
        "EnrolledStudents",
        "UnenrolledStudents",
        "ExpiringEnrollments",
        "StudentsNeedingEnrollment",
        "AdminUsers",
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(["AdminUsers"]));
        } catch (e) {}
      },
    }),
    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),
  }),
});

export const {
  useGetStudentEnrollmentsQuery,
  useGetStudentEnrollmentDetailsQuery,
  useGetStudentEnrollmentHistoryQuery,
  useGetExpiringEnrollmentsQuery,
  useCheckActiveEnrollmentOnDateQuery,
  useGetUnenrolledStudentsQuery,
  useGetEnrolledStudentsWithDetailsQuery,
  useGetStudentsNeedingEnrollmentQuery,
  useCreateStudentEnrollmentMutation,
  useUpdateStudentEnrollmentMutation,
  useDeleteStudentEnrollmentMutation,
  useTerminateEnrollmentMutation,
  useResignEnrollmentMutation,
  useApproveReEnrollMutation,
  useMarkEnrollmentExpiryAlertSentMutation,
  useTransferStudentMutation,
  useExpireOverdueEnrollmentsMutation,
  useGetUserByIdQuery,
} = studentEnrollmentApi;
