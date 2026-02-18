import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const daySessionConfigApi = createApi({
  reducerPath: "daySessionConfigApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include",   // 👈 required for cookies
  }),
  tagTypes: ["DaySessionConfig"],
  endpoints: (builder) => ({
    getDaySessionConfigs: builder.query({
      query: (params) => ({ url: "/day-session-config", params }),
      providesTags: ["DaySessionConfig"],
    }),
    createDaySessionConfig: builder.mutation({
      query: (body) => ({
        url: "/admin/day-session-config",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DaySessionConfig"],
    }),
    updateDaySessionConfig: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/day-session-config/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["DaySessionConfig"],
    }),
    deleteDaySessionConfig: builder.mutation({
      query: (id) => ({
        url: `/admin/day-session-config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DaySessionConfig"],
    }),
  }),
});

export const {
  useGetDaySessionConfigsQuery,
  useCreateDaySessionConfigMutation,
  useUpdateDaySessionConfigMutation,
  useDeleteDaySessionConfigMutation,
} = daySessionConfigApi;