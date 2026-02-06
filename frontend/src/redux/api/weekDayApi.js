import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const weekDayApi = createApi({
  reducerPath: "weekDayApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["WeekDay"],
  endpoints: (builder) => ({
    getWeekDays: builder.query({
      query: () => "/week-day",
      providesTags: ["WeekDay"],
    }),

    createWeekDay: builder.mutation({
      query: (body) => ({
        url: "/admin/week-day",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WeekDay"],
    }),

    updateWeekDay: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/week-day/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WeekDay"],
    }),

    deleteWeekDay: builder.mutation({
      query: (id) => ({
        url: `/admin/week-day/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WeekDay"],
    }),
  }),
});

export const {
  useGetWeekDaysQuery,
  useCreateWeekDayMutation,
  useUpdateWeekDayMutation,
  useDeleteWeekDayMutation,
} = weekDayApi;
