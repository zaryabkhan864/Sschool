import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const weekDayApi = createApi({
  reducerPath: "weekDayApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["WeekDay"],
  endpoints: (builder) => ({
    // 📋 Get all Week Days (with pagination, search, filter)
    getWeekDays: builder.query({
      query: (params) => ({
        url: "/week-day",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          paginate: params?.paginate,
          // agar aur filters chahiye (jaise isWorkingDay) toh yahan add kar sakte ho
        },
      }),
      providesTags: ["WeekDay"],
    }),

    // 🔍 Get single Week Day details (admin)
    getWeekDayDetails: builder.query({
      query: (id) => `/admin/week-day/${id}`,
      providesTags: ["WeekDay"],
    }),

    // ➕ Create Week Day (admin)
    createWeekDay: builder.mutation({
      query: (body) => ({
        url: "/admin/week-day",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WeekDay"],
    }),

    // ✏️ Update Week Day (admin)
    updateWeekDay: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/week-day/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WeekDay"],
    }),

    // ❌ Delete Week Day (admin)
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
  useGetWeekDayDetailsQuery,   // ✅ ab ye export bhi ho raha hai
  useCreateWeekDayMutation,
  useUpdateWeekDayMutation,
  useDeleteWeekDayMutation,
} = weekDayApi;