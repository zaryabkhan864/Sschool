// redux/api/quizApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Quizzes", "Quiz"],
  endpoints: (builder) => ({
    // Loads an existing quiz (classGroup+course+quizNumber+year) or
    // creates a new one seeded with the class group's active students.
    fetchOrCreateQuiz: builder.mutation({
      query(body) {
        return {
          url: "/teacher/quiz/fetch-or-create",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "Quizzes", id: "LIST" }],
    }),

    getQuizzes: builder.query({
      query: ({ page = 1, limit = 10, classGroup, course, keyword } = {}) => ({
        url: "/teacher/quizzes",
        params: {
          page,
          limit,
          ...(classGroup && { classGroup }),
          ...(course && { course }),
          ...(keyword && { keyword }),
        },
      }),
      providesTags: (result) =>
        result?.quizzes
          ? [
              ...result.quizzes.map(({ _id }) => ({ type: "Quizzes", id: _id })),
              { type: "Quizzes", id: "LIST" },
            ]
          : [{ type: "Quizzes", id: "LIST" }],
    }),

    getQuizDetails: builder.query({
      query: (id) => `/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
    }),

    updateQuizMarks: builder.mutation({
      query({ id, ...body }) {
        return {
          url: `/teacher/quiz/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id },
        { type: "Quizzes", id: "LIST" },
      ],
    }),

    deleteQuiz: builder.mutation({
      query(id) {
        return {
          url: `/teacher/quiz/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "Quizzes", id: "LIST" }],
    }),
  }),
});

export const {
  useFetchOrCreateQuizMutation,
  useGetQuizzesQuery,
  useGetQuizDetailsQuery,
  useUpdateQuizMarksMutation,
  useDeleteQuizMutation,
} = quizApi;
