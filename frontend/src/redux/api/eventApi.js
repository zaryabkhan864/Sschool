import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Event", "AdminEvents", "Reviews"],
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: "/events",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getEventDetails: builder.query({
      query: (id) => `/event/${id}`,
      providesTags: ["Event"],
    }),
    createEvent: builder.mutation({
      query(body) {
        return {
          url: "/admin/events",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminEvents"],
    }),
    updateEvent: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/event/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Event", "AdminEvents"],
    }),
    deleteEvent: builder.mutation({
      query(id) {
        return {
          url: `/admin/event/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminEvents"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailsQuery,

  useGetAdminEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,

  useDeleteEventImageMutation,
  useDeleteEventMutation,
} = eventApi;