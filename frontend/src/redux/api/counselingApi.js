import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const counselingApi = createApi({
  reducerPath: "counselingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Counseling", "AdminCounseling", "Reviews"],
  endpoints: (builder) => ({
    getCounselings: builder.query({
      query: (params) => ({
        url: "/counselings",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
        },
      }),
    }),
    getCounselingDetails: builder.query({
      query: (id) => `/counselings/${id}`,
      providesTags: ["Counseling"],
    }),
    createCounseling: builder.mutation({
      query(body) {
        return {
          url: "/admin/counselings",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminCounselings"],
    }),
    updateCounseling: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/counselings/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Counseling", "AdminCounselings"],
    }),
    deleteCounseling: builder.mutation({
      query(id) {
        return {
          url: `/admin/counselings/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminCounselings"],
    }),
  }),
});

export const {
  useGetCounselingsQuery,
  useGetCounselingDetailsQuery,
  useCreateCounselingMutation,
  useUpdateCounselingMutation,
  useDeleteCounselingMutation,
} = counselingApi;
