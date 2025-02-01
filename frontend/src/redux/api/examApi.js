import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Quiz"],
  endpoints: (builder) => ({
    updateExamMarks: builder.mutation({
      query({ id, body }) {
        return {
          url: `/exam/${id}`,
          method: "PUT",
          body,
        };
      },
    }),
    getExamMarks: builder.mutation({
        query(body) {
          return {
            url: "/exam/student-marks",
            method: "POST",
            body,
          };
        },
        invalidatesTags: ["Student Record By Exam Form Record"],
      }),

  }),
});

export const {
  useGetExamMarksMutation,
  useUpdateExamMarksMutation
} = examApi;
