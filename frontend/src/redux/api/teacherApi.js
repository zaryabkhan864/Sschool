import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Teacher", "AdminTeachers", "Reviews"],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: (params) => ({
        url: "/teachers",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getTeacherDetails: builder.query({
      query: (id) => `/teacher/${id}`,
      providesTags: ["Teacher"],
    }),
    createTeacher: builder.mutation({
      query(body) {
        return {
          url: "/admin/teacher",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminTeachers"],
    }),
    updateTeacher: builder.mutation({
      query({ id, body }) {
        return {
          url: `admin/teacher/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Teacher", "AdminTeachers"],
    }),
    deleteTeacher: builder.mutation({
      query(id) {
        return {
          url: `/admin/teacher/${id}`,
          method: "DELETE",
        };
      },
      invalidateTages: ["AdminTeachers"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherDetailsQuery,

  useGetAdminTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,

  useDeleteTeacherImageMutation,
  useDeleteTeacherMutation,
} = teacherApi;
