import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const academicLevelApi = createApi({
  reducerPath: "academicLevelApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["AcademicLevel"],
  endpoints: (builder) => ({
    //   Get list – pass academicYear and campus explicitly
    getAcademicLevels: builder.query({
      query: (params) => ({
        url: "/academic-level",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          paginate: params?.paginate,
          academicYear: params?.academicYear,   // new
          campus: params?.campus,               // new
        },
      }),
      providesTags: ["AcademicLevel"],
    }),

    getAcademicLevelDetails: builder.query({
      query: (id) => `/academic-level/${id}`,
      providesTags: ["AcademicLevel"],
    }),

    createAcademicLevel: builder.mutation({
      query: (body) => ({
        url: "/admin/academic-level",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AcademicLevel"],
    }),

    updateAcademicLevel: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/academic-level/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AcademicLevel"],
    }),

    deleteAcademicLevel: builder.mutation({
      query: (id) => ({
        url: `/admin/academic-level/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AcademicLevel"],
    }),
  }),
});

export const {
  useGetAcademicLevelsQuery,
  useGetAcademicLevelDetailsQuery,
  useCreateAcademicLevelMutation,
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation,
} = academicLevelApi;