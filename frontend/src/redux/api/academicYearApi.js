import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const academicYearApi = createApi({
  reducerPath: "academicYearApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include", // ✅ ensure cookies are sent
  }),
  tagTypes: ["AcademicYear"],

  endpoints: (builder) => ({
    getAcademicYears: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params?.page,
          limit: params?.limit,
          keyword: params?.keyword,
          status: params?.status,
          paginate: params?.paginate,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return {
          url: "/academic-years",
          params: queryParams,
        };
      },
      transformResponse: (response) => response,
      providesTags: (result) =>
        result?.academicYears
          ? [
              ...result.academicYears.map(({ _id }) => ({
                type: "AcademicYear",
                id: _id,
              })),
              { type: "AcademicYear", id: "LIST" },
            ]
          : [{ type: "AcademicYear", id: "LIST" }],
    }),

    getAcademicYearsList: builder.query({
      query: (params = {}) => {
        const queryParams = {
          limit: params?.limit,
          sort: params?.sort,
          keyword: params?.keyword,
          isCurrent: params?.isCurrent,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return {
          url: "/academic-years/list",
          params: queryParams,
        };
      },
      transformResponse: (response) => response,
      providesTags: (result) =>
        result?.academicYears
          ? [
              ...result.academicYears.map(({ _id }) => ({
                type: "AcademicYear",
                id: _id,
              })),
              { type: "AcademicYear", id: "LIST" },
            ]
          : [{ type: "AcademicYear", id: "LIST" }],
    }),

    getAcademicYearDetails: builder.query({
      query: (id) => `/academic-years/${id}`,
      providesTags: (result, error, id) => [{ type: "AcademicYear", id }],
    }),

    createAcademicYear: builder.mutation({
      query: (body) => ({
        url: "/admin/academic-years",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AcademicYear", id: "LIST" }],
    }),

    updateAcademicYear: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/academic-years/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AcademicYear", id },
        { type: "AcademicYear", id: "LIST" },
      ],
    }),

    deleteAcademicYear: builder.mutation({
      query: (id) => ({
        url: `/admin/academic-years/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AcademicYear", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAcademicYearsQuery,
  useGetAcademicYearsListQuery,
  useGetAcademicYearDetailsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
} = academicYearApi;