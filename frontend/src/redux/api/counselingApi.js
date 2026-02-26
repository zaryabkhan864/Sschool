import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const counselingApi = createApi({
  reducerPath: "counselingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Counselings", "Counseling", "AdminCounselings"],
  endpoints: (builder) => ({
    // GET all counselings (with filters & pagination)
    getCounselings: builder.query({
      query: ({ page = 1, limit = 8, keyword = "", status, campus, year, issueType, reporterRole } = {}) => ({
        url: "/counselings",
        params: { page, limit, keyword, status, campus, year, issueType, reporterRole },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.counselings.map(({ _id }) => ({ type: "Counselings", id: _id })),
              { type: "Counselings", id: "LIST" },
            ]
          : [{ type: "Counselings", id: "LIST" }],
    }),

    // GET single counseling details
    getCounselingDetails: builder.query({
      query: (id) => `/counselings/${id}`,
      providesTags: (result, error, id) => [{ type: "Counseling", id }],
    }),

    // CREATE new counseling
    createCounseling: builder.mutation({
      query(body) {
        // body should contain: student, issueType, complainDescription, incidentDate (optional)
        return {
          url: "/admin/counselings",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "AdminCounselings", id: "LIST" }],
    }),

    // UPDATE counseling
    updateCounseling: builder.mutation({
      query({ id, body }) {
        // body may include: student, issueType, complainDescription, incidentDate,
        // teacherComment, counselorComment, principalComment, actionTaken, status
        return {
          url: `/admin/counselings/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Counseling", id },
        { type: "AdminCounselings", id: "LIST" },
      ],
    }),

    // DELETE counseling
    deleteCounseling: builder.mutation({
      query(id) {
        return {
          url: `/admin/counselings/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "AdminCounselings", id: "LIST" }],
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