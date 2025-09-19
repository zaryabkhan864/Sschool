import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Quiz"],
  endpoints: (builder) => ({
    addQuizMarks: builder.mutation({
      query(body) {
        return {
          url: "/students/quiz/marks",
          method: "POST",
          body,
        };
      }
    }),
    updateQuizMarks: builder.mutation({
      query({ id, body }) {
        return {
          url: `/students/quiz/${id}`,
          method: "PUT",
          body,
        };
      },
    }),
    getStudentsQuizDetailsByQuizData: builder.mutation({
      query(body) {
        return {
          url: "/students/quiz-record",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Student Record By Quiz Form Record"],
    }),
  }),
});

export const {
  useAddQuizMarksMutation,
  useUpdateQuizMarksMutation,
  useGetStudentsQuizDetailsByQuizDataMutation
} = quizApi;
