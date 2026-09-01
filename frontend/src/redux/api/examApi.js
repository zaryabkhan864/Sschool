// redux/api/examApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Exams", "Exam"],
  endpoints: (builder) => ({
    fetchOrCreateExam: builder.mutation({
      query(body) {
        return {
          url: "/teacher/exam/fetch-or-create",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "Exams", id: "LIST" }],
    }),

    getExams: builder.query({
      query: ({ page = 1, limit = 10, classGroup, course, keyword } = {}) => ({
        url: "/teacher/exams",
        params: {
          page,
          limit,
          ...(classGroup && { classGroup }),
          ...(course && { course }),
          ...(keyword && { keyword }),
        },
      }),
      providesTags: (result) =>
        result?.exams
          ? [
              ...result.exams.map(({ _id }) => ({ type: "Exams", id: _id })),
              { type: "Exams", id: "LIST" },
            ]
          : [{ type: "Exams", id: "LIST" }],
    }),

    getExamDetails: builder.query({
      query: (id) => `/exams/${id}`,
      providesTags: (result, error, id) => [{ type: "Exam", id }],
    }),

    updateExamMarks: builder.mutation({
      query({ id, ...body }) {
        return {
          url: `/teacher/exam/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Exam", id },
        { type: "Exams", id: "LIST" },
      ],
    }),

    deleteExam: builder.mutation({
      query(id) {
        return {
          url: `/teacher/exam/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "Exams", id: "LIST" }],
    }),
  }),
});

export const {
  useFetchOrCreateExamMutation,
  useGetExamsQuery,
  useGetExamDetailsQuery,
  useUpdateExamMarksMutation,
  useDeleteExamMutation,
} = examApi;
