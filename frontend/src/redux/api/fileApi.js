import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const fileApi = createApi({
  reducerPath: "fileApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["file"],
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query(body) {
        return {
          url: "/file",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["file"],
    }),
    deleteFile: builder.mutation({
      query(body) {
        return {
          url: `/file`,
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["file"],
    }),
  }),
});

export const {
  useDeleteFileMutation,
  useUploadFileMutation,
} = fileApi;
