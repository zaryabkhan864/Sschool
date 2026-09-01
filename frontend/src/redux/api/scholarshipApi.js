// src/redux/api/scholarshipApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scholarshipApi = createApi({
  reducerPath: "scholarshipApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),

  tagTypes: ["Scholarship"],

  endpoints: (builder) => ({
    getScholarshipByStudent: builder.query({
      query: ({ studentId, academicYear } = {}) => {
        const params = {};
        if (academicYear) params.academicYear = academicYear;
        return { url: `/scholarships/student/${studentId}`, params };
      },
      providesTags: (result, error, { studentId }) => [
        { type: "Scholarship", id: `STUDENT-${studentId}` },
      ],
    }),

    getScholarships: builder.query({
      query: (params = {}) => ({ url: "/admin/scholarships", params }),
      providesTags: (result) =>
        result?.scholarships
          ? [
              ...result.scholarships.map(({ _id }) => ({ type: "Scholarship", id: _id })),
              { type: "Scholarship", id: "LIST" },
            ]
          : [{ type: "Scholarship", id: "LIST" }],
    }),

    createScholarship: builder.mutation({
      query: (body) => ({
        url: "/admin/scholarships",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "Scholarship", id: "LIST" },
        { type: "Scholarship", id: `STUDENT-${body?.studentId}` },
      ],
    }),

    updateScholarship: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/scholarships/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, studentId }) => [
        { type: "Scholarship", id },
        { type: "Scholarship", id: "LIST" },
        { type: "Scholarship", id: `STUDENT-${studentId}` },
      ],
    }),

    deleteScholarship: builder.mutation({
      query: (id) => ({
        url: `/admin/scholarships/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Scholarship", id: "LIST" }],
    }),
  }),
});

export const {
  useGetScholarshipByStudentQuery,
  useGetScholarshipsQuery,
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
  useDeleteScholarshipMutation,
} = scholarshipApi;
