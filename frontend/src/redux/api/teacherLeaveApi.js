import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherLeaveApi = createApi({
  reducerPath: "teacherLeaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["TeacherLeave", "TeacherLeaveBalance"],
  endpoints: (builder) => ({
    getTeacherLeaves: builder.query({
      query: (params) => ({
        url: "/teacherleaves",
        params: {
          page: params?.page,
          // 👇 FIX: `limit` and `status` were never actually forwarded to
          // the backend — the "items per page" selector and the Status
          // filter dropdown both silently had zero effect.
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
        },
      }),
      // 👇 FIX: this query never had `providesTags`, so nothing the
      // mutations below invalidated actually refreshed this list — it
      // only updated via manual refetch() calls sprinkled through the UI.
      providesTags: (result) =>
        result?.teacherLeaves
          ? [
              ...result.teacherLeaves.map((tl) => ({ type: "TeacherLeave", id: tl._id })),
              { type: "TeacherLeave", id: "LIST" },
            ]
          : [{ type: "TeacherLeave", id: "LIST" }],
    }),
    getTeacherLeaveDetails: builder.query({
      query: (id) => `/teacherleave/${id}`,
      providesTags: (result, error, id) => [{ type: "TeacherLeave", id }],
    }),
    // Allowance vs used vs remaining for a teacher (optionally for a given year)
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
      // 👇 FIX: previously invalidated "AdminTeacherLeave" (singular),
      // which didn't match anything this query provides (typo vs the
      // declared "AdminTeacherLeaves" tagType, and getTeacherLeaves
      // provided nothing at all) — the list never auto-refreshed.
      invalidatesTags: (result, error, body) => [
        { type: "TeacherLeave", id: "LIST" },
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
      invalidatesTags: (result, error, { id }) => [
        { type: "TeacherLeave", id },
        { type: "TeacherLeave", id: "LIST" },
        "TeacherLeaveBalance",
      ],
    }),
    deleteTeacherLeave: builder.mutation({
      query(id) {
        return {
          url: `/admin/teacherleave/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, id) => [
        { type: "TeacherLeave", id },
        { type: "TeacherLeave", id: "LIST" },
        "TeacherLeaveBalance",
      ],
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