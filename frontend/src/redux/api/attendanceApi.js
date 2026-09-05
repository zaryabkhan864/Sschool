import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["AttendanceSheet"],
  endpoints: (builder) => ({
    // Roster + prefilled status for one class+course+date — the session
    // (period) itself is resolved server-side from the class's timetable.
    getAttendanceSheet: builder.query({
      query: ({ classGroup, course, date }) => ({
        url: "/attendance/sheet",
        params: { classGroup, course, date },
      }),
      providesTags: (result, error, arg) => [
        { type: "AttendanceSheet", id: `${arg.classGroup}-${arg.course}-${arg.date}` },
      ],
    }),
    submitAttendance: builder.mutation({
      query(body) {
        return { url: "/attendance", method: "POST", body };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "AttendanceSheet", id: `${arg.classGroup}-${arg.course}-${arg.date}` },
      ],
    }),
    getAttendanceHistory: builder.query({
      query: (params) => ({ url: "/attendance/history", params }),
    }),
    // 👇 NEW: month-wise class report broken down by actual date (per-day
    // status grid), aggregated server-side — the browser never has to
    // collapse potentially hundreds of raw session documents itself.
    getClassAttendanceCalendar: builder.query({
      query: (params) => ({ url: "/attendance/calendar/class", params }),
    }),
  }),
});

export const {
  useGetAttendanceSheetQuery,
  useSubmitAttendanceMutation,
  useGetAttendanceHistoryQuery,
  useGetClassAttendanceCalendarQuery,
} = attendanceApi;