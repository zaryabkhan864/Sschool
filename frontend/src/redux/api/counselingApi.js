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
  }),
});

export const { useGetCounselingsQuery, useCreateCounselingMutation } =
  counselingApi;
