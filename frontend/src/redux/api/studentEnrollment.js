import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentEnrollmentApi = createApi({
  reducerPath: "studentEnrollmentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  tagTypes: [
    "StudentEnrollment",
    "UnenrolledStudents",
    "EnrolledStudents",
    "AdminUser",
  ],

  endpoints: (builder) => ({
    // ================= GET ALL ENROLLMENTS =================
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
          startDate: params?.startDate, // ✅ ADDED
          paginate: params?.paginate,
        };

        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );

        return {
          url: "/student-enrollments",
          params: queryParams,
        };
      },

      transformResponse: (response) => response,

      providesTags: (result) =>
        result?.enrollments
          ? [
              ...result.enrollments.map(({ _id }) => ({
                type: "StudentEnrollment",
                id: _id,
              })),
              { type: "StudentEnrollment", id: "LIST" },
            ]
          : [{ type: "StudentEnrollment", id: "LIST" }],
    }),

    // ================= GET SINGLE =================
    getStudentEnrollmentDetails: builder.query({
      query: (id) => `/student-enrollments/${id}`,
      providesTags: (result, error, id) => [
        { type: "StudentEnrollment", id },
      ],
    }),

    // ================= UNENROLLED =================
    getUnenrolledStudents: builder.query({
      query: (params = {}) => {
        const queryParams = {
          academicYear: params?.academicYear,
        };

        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );

        return {
          url: "/students/unenrolled",
          params: queryParams,
        };
      },

      providesTags: ["UnenrolledStudents"],
    }),

    // ================= ENROLLED =================
    getEnrolledStudentsWithDetails: builder.query({
      query: () => "/students/enrolled",
      providesTags: ["EnrolledStudents"],
    }),

    // ================= CREATE =================
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
      ],
    }),

    // ================= UPDATE =================
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
      ],
    }),

    // ================= DELETE =================
    deleteStudentEnrollment: builder.mutation({
      query: (id) => ({
        url: `/admin/student-enrollments/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        { type: "StudentEnrollment", id: "LIST" },
        "UnenrolledStudents",
        "EnrolledStudents",
      ],
    }),

    // 🔥 ================= TRANSFER (NEW) =================
    transferStudent: builder.mutation({
      query: (body) => ({
        url: "/admin/student-enrollments/transfer",
        method: "POST",
        body,
      }),

      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.studentId }, // user update
        { type: "StudentEnrollment", id: "LIST" },  // list refresh
        "UnenrolledStudents",
        "EnrolledStudents",
      ],
    }),

    // ================= USER =================
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [
        { type: "AdminUser", id },
      ],
    }),
  }),
});

export const {
  useGetStudentEnrollmentsQuery,
  useGetStudentEnrollmentDetailsQuery,
  useGetUnenrolledStudentsQuery,
  useGetEnrolledStudentsWithDetailsQuery,
  useCreateStudentEnrollmentMutation,
  useUpdateStudentEnrollmentMutation,
  useDeleteStudentEnrollmentMutation,
  useTransferStudentMutation, // ✅ NEW HOOK
  useGetUserByIdQuery,
} = studentEnrollmentApi;