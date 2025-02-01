import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Student", "AdminStudents", "Quiz"],
  endpoints: (builder) => ({
    addQuizMarks: builder.mutation({
      query(body) {
        console.log("what is body in api", body)
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

  }),
});

export const {
  useAddQuizMarksMutation,
  useUpdateQuizMarksMutation
} = quizApi;
