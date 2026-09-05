import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Events", "EventDetails", "EventStats"],
  endpoints: (builder) => ({
    // Real pagination + filters now (page/limit/keyword/campus/isPaid/
    // dateFrom/dateTo/countOnly) — matches how every other list screen
    // in the app talks to its backend.
    getEvents: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          campus: params?.campus,
          isPaid: params?.isPaid,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          paginate: params?.paginate,
          countOnly: params?.countOnly,
        };
        Object.keys(queryParams).forEach((k) => queryParams[k] === undefined && delete queryParams[k]);
        return { url: "/events", params: queryParams };
      },
      providesTags: (result) =>
        result?.events
          ? [
              ...result.events.map(({ _id }) => ({ type: "Events", id: _id })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),

    getEventDetails: builder.query({
      query: (id) => `/event/${id}`,
      providesTags: (result, error, id) => [{ type: "EventDetails", id }],
    }),

    // 👇 NEW: total / paid / upcoming counts for the stat cards
    getEventStats: builder.query({
      query: () => "/events/stats",
      providesTags: ["EventStats"],
    }),

    createEvent: builder.mutation({
      query(body) {
        return {
          url: "/admin/events",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "Events", id: "LIST" }, "EventStats"],
    }),

    updateEvent: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/event/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
        { type: "EventDetails", id },
        "EventStats",
      ],
    }),

    deleteEvent: builder.mutation({
      query(id) {
        return {
          url: `/admin/event/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "Events", id: "LIST" }, "EventStats"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventDetailsQuery,
  useGetEventStatsQuery,     // 👈 NEW
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;

// 👉 REMOVED: useGetAdminEventsQuery and useDeleteEventImageMutation were
// exported previously but had no matching endpoint defined anywhere in
// this file (no `getAdminEvents` / `deleteEventImage` builder entries
// existed) — importing either of those hooks anywhere would have been
// `undefined` and crashed the moment it was called. If you actually need
// a separate admin-only events list or a "remove just the image" action,
// let me know and I'll add real endpoints for them.
