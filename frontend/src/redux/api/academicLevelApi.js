import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const academicLevelApi = createApi({
  reducerPath: "academicLevelApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["AcademicLevel"],

  endpoints: (builder) => ({
    // GET ALL
    getAcademicLevels: builder.query({
      query: (params) => ({
        url: "/academic-level",
        params: {
          page: params?.page,
          // ✅ FIX: limit was missing — backend was always using default resPerPage=10
          // Now passes limit so backend pagination respects frontend page size
          limit: params?.limit,
          keyword: params?.keyword,
          paginate: params?.paginate,
          academicYear: params?.academicYear,
          campus: params?.campus,
        },
      }),
      providesTags: (result) =>
        result?.levels
          ? [
              ...result.levels.map(({ _id }) => ({ type: "AcademicLevel", id: _id })),
              { type: "AcademicLevel", id: "LIST" },
            ]
          : [{ type: "AcademicLevel", id: "LIST" }],
    }),

    // GET ONE
    getAcademicLevelDetails: builder.query({
      query: (id) => `/academic-level/${id}`,
      providesTags: (result, error, id) => [{ type: "AcademicLevel", id }],
    }),

    // CREATE
    createAcademicLevel: builder.mutation({
      query: (body) => ({
        url: "/admin/academic-level",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AcademicLevel", id: "LIST" }],
    }),

    // UPDATE
    updateAcademicLevel: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/academic-level/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AcademicLevel", id },
        { type: "AcademicLevel", id: "LIST" },
      ],
    }),

    // DELETE
    deleteAcademicLevel: builder.mutation({
      query: (id) => ({
        url: `/admin/academic-level/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AcademicLevel", id: "LIST" }],
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
