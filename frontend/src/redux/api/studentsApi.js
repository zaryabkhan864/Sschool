import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Reviews"],
  endpoints: (builder) => ({
    getStudents: builder.query({
      query: (params) => ({
        url: "/students",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getStudentsWithGrades: builder.query({
      query: (params) => ({
        url: "/students/grades",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getStudentDetails: builder.query({
      query: (id) => `/student/${id}`,
      providesTags: ["Student"],
    }),

    createStudent: builder.mutation({
      query(body) {
        return {
          url: "/admin/students",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminStudents"],
    }),
    updateStudent: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/student/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Student", "AdminStudents"],
    }),
    uploadStudentImages: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/student/${id}/upload_images`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Student"],
    }),
    deleteStudentImage: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/students/${id}/delete_image`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Student"],
    }),
    deleteStudent: builder.mutation({
      query(id) {
        return {
          url: `/admin/student/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminStudents"],
    }),


    getStudentsQuizDetailsByQuizData: builder.mutation({
      query(body) {
        return {
          url: "/students/quiz-record",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Student Record By Quiz Form Record"],
    }),


  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentsWithGradesQuery,
  useGetStudentDetailsQuery,

  useGetAdminStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useUploadStudentImagesMutation,
  useDeleteStudentImageMutation,
  useDeleteStudentMutation,


  useGetStudentsQuizDetailsByQuizDataMutation
} = studentApi;
