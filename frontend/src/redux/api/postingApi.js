import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const postingApi = createApi({
  reducerPath: "postingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Announcement", "Comments", "Posting"],
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation({
      query(body) {
        return {
          url: "/announcement",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Announcement"],
    }),
    getAnnouncements: builder.query({
      query: (params) => ({
        url: "/announcement",
        params: {
          page: params?.page,
        },
      }),
    }),
    updateAnnouncement: builder.mutation({
      query({ id, body }) {
        return {
          url: `/announcement/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Announcement"],
    }),
    deleteAnnouncement: builder.mutation({
      query(id) {
        return {
          url: `/announcement/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Announcement"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery
} = postingApi;
