// services/gradeApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Grades", "Grade", "AdminGrades"],
  endpoints: (builder) => ({
    // GET all grades (with filters & pagination)
    getGrades: builder.query({
      query: ({ page = 1, limit = 10, keyword = "", status } = {}) => ({
        url: "/grades",
        params: { 
          page, 
          limit, 
          keyword,
          ...(status && { status })
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.grades.map(({ _id }) => ({ type: "Grades", id: _id })),
              { type: "Grades", id: "LIST" },
            ]
          : [{ type: "Grades", id: "LIST" }],
    }),

    // GET single grade details
    getGradeDetails: builder.query({
      query: (id) => `/grades/${id}`,
      providesTags: (result, error, id) => [{ type: "Grade", id }],
    }),

    // CREATE new grade (Admin only)
    createGrade: builder.mutation({
      query({ gradeName, academicLevel, description, ...rest }) {
        return {
          url: "/admin/grades",
          method: "POST",
          body: { gradeName, academicLevel, description, ...rest },
        };
      },
      invalidatesTags: [
        { type: "Grades", id: "LIST" },
        { type: "AdminGrades" }
      ],
    }),

    // UPDATE grade (Admin only)
    updateGrade: builder.mutation({
      query({ id, gradeName, academicLevel, description, status, ...rest }) {
        return {
          url: `/admin/grades/${id}`,
          method: "PUT",
          body: { gradeName, academicLevel, description, status, ...rest },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Grades", id },
        { type: "Grade", id },
        { type: "AdminGrades" }
      ],
    }),

    // DELETE grade (Admin only)
    deleteGrade: builder.mutation({
      query(id) {
        return {
          url: `/admin/grades/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [
        { type: "Grades", id: "LIST" },
        { type: "AdminGrades" }
      ],
    }),

    getGradesByAcademicLevel: builder.query({
      query: (academicLevelId) => `/grades/by-academic-level/${academicLevelId}`,
      providesTags: (result, error, id) => [{ type: "Grades", id: `academicLevel-${id}` }],
    }),
  }),
});

export const {
  useGetGradesByAcademicLevelQuery,
  useGetGradesQuery,
  useLazyGetGradesQuery,
  useGetGradeDetailsQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
} = gradeApi;