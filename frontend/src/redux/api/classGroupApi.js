import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classGroupApi = createApi({
  reducerPath: "classGroupApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["ClassGroup"],
  endpoints: (builder) => ({
    getClassGroups: builder.query({
      query: (params) => ({
        url: "/class-group",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          paginate: params?.paginate,
        },
      }),
      providesTags: ["ClassGroup"],
    }),

    getClassGroupDetails: builder.query({
      query: (id) => `/class-group/${id}`,
      providesTags: ["ClassGroup"],
    }),

    createClassGroup: builder.mutation({
      query: (body) => ({
        url: "/admin/class-group",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ClassGroup"],
    }),

    updateClassGroup: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/class-group/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ClassGroup"],
    }),

    deleteClassGroup: builder.mutation({
      query: (id) => ({
        url: `/admin/class-group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassGroup"],
    }),
  }),
});

export const {
  useGetClassGroupsQuery,
  useGetClassGroupDetailsQuery,
  useCreateClassGroupMutation,
  useUpdateClassGroupMutation,
  useDeleteClassGroupMutation,
} = classGroupApi;
