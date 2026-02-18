import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const timeTableSlotApi = createApi({
  reducerPath: "timeTableSlotApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" , credentials: "include",   }),
  tagTypes: ["TimeTable"],
  endpoints: (builder) => ({
    getAndCreateTimeTable: builder.query({
      query: (classGroupId) => ({
        url: `/timetable-slot/${classGroupId}`,
      }),
      providesTags: ["TimeTable"],
    }),
    updateTimeTableSlots: builder.mutation({
      query: ({ classGroupId, slots }) => ({
        url: `/timetable-slot/${classGroupId}`,
        method: "PUT",
        body: { slots },
      }),
      invalidatesTags: ["TimeTable"],
    }),
    getAvailableCoursesForSlot: builder.query({
      query: (params) => ({
        url: `/available-courses`,
        params,
      }),
      providesTags: ["TimeTable"],
    }),
  }),
});

export const {
  useGetAndCreateTimeTableQuery,
  useUpdateTimeTableSlotsMutation,
  useGetAvailableCoursesForSlotQuery,
} = timeTableSlotApi;