import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Comments", "Posting"],
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query(body) {
        return {
          url: "/comment",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Comments"],
    }),
    updateComment: builder.mutation({
      query({ id, body }) {
        return {
          url: `/comment/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Comments"],
    }),
    deleteComment: builder.mutation({
      query(id) {
        return {
          url: `/comment/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Comments"],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
