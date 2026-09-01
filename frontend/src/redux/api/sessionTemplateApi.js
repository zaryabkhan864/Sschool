import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sessionTemplateApi = createApi({
  reducerPath: "sessionTemplateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include", 
  }),
  tagTypes: ["SessionTemplate"],
  endpoints: (builder) => ({
    getSessionTemplates: builder.query({
      query: (params) => ({
        url: "/session-template",
        params, 
      }),
      providesTags: ["SessionTemplate"],
    }),

    createSessionTemplate: builder.mutation({
      query: (body) => ({
        url: "/admin/session-template",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SessionTemplate"],
    }),

    updateSessionTemplate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/session-template/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SessionTemplate"],
    }),

    deleteSessionTemplate: builder.mutation({
      query: (id) => ({
        url: `/admin/session-template/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SessionTemplate"],
    }),
  }),
});

export const {
  useGetSessionTemplatesQuery,
  useCreateSessionTemplateMutation,
  useUpdateSessionTemplateMutation,
  useDeleteSessionTemplateMutation,
} = sessionTemplateApi;