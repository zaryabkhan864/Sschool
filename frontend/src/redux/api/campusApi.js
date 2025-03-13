import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const campusApi = createApi({
  reducerPath: "campusApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Campus", "AdminCampus"],
  endpoints: (builder) => ({
    getCampus: builder.query({
      query: (params) => ({
        url: "/campus",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          paginate: params?.paginate
        },
      }),
    }),
    getCampusDetails: builder.query({
      query: (id) => `/campus/${id}`,
      providesTags: ["Campus"],
    }),
    createCampus: builder.mutation({
      query(body) {
        return {
          url: "/admin/campus",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminCampus"],
    }),
    updateCampus: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/campus/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Campus", "AdminCampus"],
    }),
    setCampusToken: builder.mutation({
      query: (id) => ({
        url: `/campus/token/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Campus"], // Agar campus ka data refresh karna ho
    }),
  }),
});

export const {
  useGetCampusQuery,
  useGetCampusDetailsQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useSetCampusTokenMutation,
} = campusApi;
