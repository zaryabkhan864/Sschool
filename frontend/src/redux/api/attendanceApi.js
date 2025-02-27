import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Attendance"],
  endpoints: (builder) => ({
    updateAttendance: builder.mutation({
      query({ id, body }) {
        return {
          url: `/attendance/${id}`,
          method: "PUT",
          body,
        };
      },
    }),
    getAttendance: builder.mutation({
        query(body) {
          return {
            url: "/attendance/new",
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["Student Attendance Records"],
      }),

  }),
});

export const {
  useGetAttendanceMutation,
  useUpdateAttendanceMutation
} = attendanceApi;
