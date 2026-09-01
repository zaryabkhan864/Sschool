import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const campusApi = createApi({
  reducerPath: "campusApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Campus"],

  endpoints: (builder) => ({
    // GET ALL
    getCampus: builder.query({
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
          url: "/campus",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.campuses
          ? [
              ...result.campuses.map(({ _id }) => ({ type: "Campus", id: _id })),
              { type: "Campus", id: "LIST" },
            ]
          : [{ type: "Campus", id: "LIST" }],
    }),

    // GET ONE
    getCampusDetails: builder.query({
      query: (id) => `/campus/${id}`,
      providesTags: (result, error, id) => [{ type: "Campus", id }],
    }),

    // CREATE
    createCampus: builder.mutation({
      query: (body) => ({
        url: "/admin/campus",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Campus", id: "LIST" }],
    }),

    // UPDATE
    updateCampus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/campus/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Campus", id },
        { type: "Campus", id: "LIST" },
      ],
    }),

    // DELETE
    deleteCampus: builder.mutation({
      query: (id) => ({
        url: `/admin/campus/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Campus", id: "LIST" }],
    }),

    // SET CAMPUS TOKEN (cookie)
    setCampusToken: builder.mutation({
      query: (id) => ({
        url: `/campus/token/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCampusQuery,
  useGetCampusDetailsQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useDeleteCampusMutation,
  useSetCampusTokenMutation,
} = campusApi;
