import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const postingApi = createApi({
  reducerPath: "postingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Announcement"],
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
    // 👇 FIX: this query never had `providesTags`, so the "Announcement"
    // tag that create/update/delete invalidate had nothing to actually
    // invalidate — the Wall never auto-refreshed after posting, it only
    // updated on a manual page reload.
    getAnnouncements: builder.query({
      query: (params) => ({
        url: "/announcement",
        params: {
          page: params?.page,
          classGroup: params?.classGroup, // optional staff filter
          keyword: params?.keyword,
        },
      }),
      providesTags: ["Announcement"],
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
    // 👇 NEW: comment endpoints — the backend routes/controllers already
    // existed (routes/comment.js, controllers/commentController.js), but
    // nothing on the frontend called them, so the Wall had no way to add,
    // edit, or delete a comment. Comments come back as part of each
    // announcement (via the Announcement model's virtual `comments`
    // populate), so the simplest correct cache-invalidation is to
    // invalidate the whole "Announcement" tag — that re-fetches the Wall
    // feed with the updated comment list included.
    addComment: builder.mutation({
      query(body) {
        return {
          url: "/comment",
          method: "POST",
          body, // { announcementId, message, userId }
        };
      },
      invalidatesTags: ["Announcement"],
    }),
    updateComment: builder.mutation({
      query({ id, ...body }) {
        return {
          url: `/comment/${id}`,
          method: "PUT",
          body, // { message }
        };
      },
      invalidatesTags: ["Announcement"],
    }),
    deleteComment: builder.mutation({
      query(id) {
        return {
          url: `/comment/${id}`,
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
  useGetAnnouncementsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = postingApi;