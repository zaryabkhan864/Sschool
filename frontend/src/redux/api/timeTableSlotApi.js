import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const timeTableSlotApi = createApi({
  reducerPath: "timeTableSlotApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["TimeTableSlot"],
  endpoints: (builder) => ({
    getTimeTableSlots: builder.query({
      query: (params) => ({
        url: "/timetable-slot",
        params,
      }),
      providesTags: ["TimeTableSlot"],
    }),

    createTimeTableSlot: builder.mutation({
      query: (body) => ({
        url: "/admin/timetable-slot",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TimeTableSlot"],
    }),

    deleteTimeTableSlot: builder.mutation({
      query: (id) => ({
        url: `/admin/timetable-slot/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TimeTableSlot"],
    }),
  }),
});

export const {
  useGetTimeTableSlotsQuery,
  useCreateTimeTableSlotMutation,
  useDeleteTimeTableSlotMutation,
} = timeTableSlotApi;
