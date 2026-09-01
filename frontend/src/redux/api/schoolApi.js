// redux api
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const schoolApi = createApi({
  reducerPath: "schoolApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["School"],

  endpoints: (builder) => ({
    // ========== School (singleton) ==========
    getSchool: builder.query({
      query: () => "/school",
      transformResponse: (response) => response.school,
      providesTags: ["School"],
    }),

    upsertSchool: builder.mutation({
      query(body) {
        return { url: "/admin/school", method: "PUT", body };
      },
      invalidatesTags: ["School"],
    }),

    deleteSchoolLogo: builder.mutation({
      query: () => ({ url: "/admin/school/logo", method: "DELETE" }),
      invalidatesTags: ["School"],
    }),
  }),
});

export const {
  useGetSchoolQuery,
  useUpsertSchoolMutation,
  useDeleteSchoolLogoMutation,
} = schoolApi;
