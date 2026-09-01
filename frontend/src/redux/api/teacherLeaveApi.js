import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherLeaveApi = createApi({
  reducerPath: "teacherLeaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["TeacherLeave", "AdminTeacherLeaves", "Reviews", "TeacherLeaveBalance"],
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
    // ✅ NEW: allowance vs used vs remaining for a teacher (optionally for a given year)
    getTeacherLeaveBalance: builder.query({
      query: ({ teacherId, year } = {}) => ({
        url: `/teacherleave/balance/${teacherId}`,
        params: year ? { year } : undefined,
      }),
      providesTags: (result, error, { teacherId }) => [
        { type: "TeacherLeaveBalance", id: teacherId },
      ],
    }),
    createTeacherLeave: builder.mutation({
      query(body) {
        return {
          url: "/admin/teacherleave",
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, body) => [
        "AdminTeacherLeave",
        { type: "TeacherLeaveBalance", id: body?.teacher },
      ],
    }),
    updateTeacherLeave: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/teacherleave/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["TeacherLeave", "AdminTeacherLeave", "TeacherLeaveBalance"],
    }),
    deleteTeacherLeave: builder.mutation({
      query(id) {
        return {
          url: `/admin/teacherleave/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminTeacherLeave", "TeacherLeaveBalance"],
    }),
  }),
});

export const {
  useGetTeacherLeavesQuery,
  useGetTeacherLeaveDetailsQuery,
  useGetTeacherLeaveBalanceQuery,
  useCreateTeacherLeaveMutation,
  useUpdateTeacherLeaveMutation,
  useDeleteTeacherLeaveMutation,
} = teacherLeaveApi;
