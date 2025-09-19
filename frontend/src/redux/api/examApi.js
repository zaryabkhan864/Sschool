import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Exam"],
  endpoints: (builder) => ({
    addExamMarks: builder.mutation({
      query(body) {
        return {
          url: "/students/exam/marks",
          method: "POST",
          body,
        };
      }
    }),
    updateExamMarks: builder.mutation({
      query({ id, body }) {
        return {
          url: `/students/exam/${id}`,
          method: "PUT",
          body,
        };
      },
    }),
    getStudentsExamDetailsByExamData: builder.mutation({
      query(body) {
        return {
          url: "/students/exam-record",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Student Record By Exam Form Record"],
    }),

  }),
});

export const {
  useAddExamMarksMutation,
  useUpdateExamMarksMutation,
  useGetStudentsExamDetailsByExamDataMutation
} = examApi;
