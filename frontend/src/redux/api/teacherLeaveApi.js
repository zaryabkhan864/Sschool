import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherLeaveApi = createApi({
  reducerPath: "teacherLeaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["TeacherLeave", "AdminTeacherLeaves", "Reviews"],
  endpoints: (builder) => ({
    getTeacherLeaves: builder.query({
      query: (params) => ({
        url: "/teacherleaves",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getTeacherLeaveDetails: builder.query({
      query: (id) => `/teacherleave/${id}`,
      providesTags: ["TeacherLeave"],
    }),
    createTeacherLeave: builder.mutation({
      query(body) {
        return {
          url: "/admin/teacherleave",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminTeacherLeave"],
    }),
    updateTeacherLeave: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/teacherleave/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TeacherLeave", "AdminTeacherLeave"],
    }),
    deleteTeacherLeave: builder.mutation({
      query(id) {
        return {
          url: `/admin/teacherleave/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminTeacherLeave"],
    }),
  }),
});

export const {
  useGetTeacherLeavesQuery,
  useGetTeacherLeaveDetailsQuery,
  useCreateTeacherLeaveMutation,
  useUpdateTeacherLeaveMutation,
  useDeleteTeacherLeaveMutation,
} = teacherLeaveApi;
