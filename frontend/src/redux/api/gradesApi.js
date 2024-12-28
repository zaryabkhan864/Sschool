import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Grade", "AdminGrades", "Reviews"],
  endpoints: (builder) => ({
    getGrades: builder.query({
      query: (params) => ({
        url: "/grades",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getGradeDetails: builder.query({
      query: (id) => `/grade/${id}`,
      providesTags: ["Grade"],
    }),
    createGrade: builder.mutation({
      query(body) {
        return {
          url: "/admin/grades",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminGrades"],
    }),
    updateGrade: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/grades/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Grade", "AdminGrades"],
    }),
    deleteGrade: builder.mutation({
      query(id) {
        return {
          url: `/admin/grades/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminGrades"],
    }),
  }),
});

export const {
  useGetGradesQuery,
  useGetGradeDetailsQuery,

  useGetAdminGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,

  useDeleteGradeImageMutation,
  useDeleteGradeMutation,
} = gradeApi;
