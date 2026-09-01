// redux/api/homeworkApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const homeworkApi = createApi({
  reducerPath: "homeworkApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["HomeworkAssignments", "HomeworkAssignment", "HomeworkSubmissions", "StudentHomework"],
  endpoints: (builder) => ({
    // ---------------- Teacher: postings ----------------

    // GET list (paginated) — campus/academicYear are read from cookies on
    // the backend, so we never send them from here.
    getHomeworkAssignments: builder.query({
      query: ({
        page = 1,
        limit = 8,
        classGroup,
        course,
        type,
        status,
        keyword,
        paginate,
      } = {}) => ({
        url: "/teacher/homework-assignments",
        params: {
          page,
          limit,
          ...(classGroup && { classGroup }),
          ...(course && { course }),
          ...(type && { type }),
          ...(status && { status }),
          ...(keyword && { keyword }),
          ...(paginate !== undefined && { paginate }),
        },
      }),
      providesTags: (result) =>
        result?.homeworks
          ? [
              ...result.homeworks.map(({ _id }) => ({ type: "HomeworkAssignments", id: _id })),
              { type: "HomeworkAssignments", id: "LIST" },
            ]
          : [{ type: "HomeworkAssignments", id: "LIST" }],
    }),

    getHomeworkAssignmentDetails: builder.query({
      query: (id) => `/homework-assignments/${id}`,
      providesTags: (result, error, id) => [{ type: "HomeworkAssignment", id }],
    }),

    createHomeworkAssignment: builder.mutation({
      query(body) {
        return {
          url: "/teacher/homework-assignments",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "HomeworkAssignments", id: "LIST" }],
    }),

    updateHomeworkAssignment: builder.mutation({
      query({ id, ...body }) {
        return {
          url: `/teacher/homework-assignments/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "HomeworkAssignments", id },
        { type: "HomeworkAssignment", id },
        { type: "HomeworkAssignments", id: "LIST" },
      ],
    }),

    deleteHomeworkAssignment: builder.mutation({
      query(id) {
        return {
          url: `/teacher/homework-assignments/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "HomeworkAssignments", id: "LIST" }],
    }),

    // Teacher's own class groups + courses, for the posting form dropdowns.
    // Self-contained — does NOT depend on the existing /courses/by-role
    // endpoint (that one expects a POST body but is queried with GET
    // elsewhere in the app, so it never actually resolves).
    getTeacherClassGroupsAndCourses: builder.query({
      query: () => "/teacher/homework-meta",
    }),

    // ---------------- Teacher: submissions ----------------

    getSubmissionsForAssignment: builder.query({
      query: (id) => `/teacher/homework-assignments/${id}/submissions`,
      providesTags: (result, error, id) => [{ type: "HomeworkSubmissions", id }],
    }),

    gradeSubmission: builder.mutation({
      query({ id, marksObtained, feedback }) {
        return {
          url: `/teacher/homework-submissions/${id}/grade`,
          method: "PUT",
          body: { marksObtained, feedback },
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: "HomeworkSubmissions", id: "LIST" }],
    }),

    // ---------------- Shared ----------------

    getSubmissionDetails: builder.query({
      query: (id) => `/homework-submissions/${id}`,
      providesTags: (result, error, id) => [{ type: "HomeworkSubmissions", id }],
    }),

    deleteSubmission: builder.mutation({
      query(id) {
        return {
          url: `/homework-submissions/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [{ type: "HomeworkSubmissions", id: "LIST" }],
    }),

    // ---------------- Student ----------------

    getStudentHomework: builder.query({
      query: ({ classGroup, type, status } = {}) => ({
        url: "/student/homework-assignments",
        params: {
          ...(classGroup && { classGroup }),
          ...(type && { type }),
          ...(status && { status }),
        },
      }),
      providesTags: (result) =>
        result?.homeworks
          ? [
              ...result.homeworks.map(({ _id }) => ({ type: "StudentHomework", id: _id })),
              { type: "StudentHomework", id: "LIST" },
            ]
          : [{ type: "StudentHomework", id: "LIST" }],
    }),

    submitHomework: builder.mutation({
      query(body) {
        return {
          url: "/student/homework-submissions",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [
        { type: "StudentHomework", id: "LIST" },
        { type: "HomeworkSubmissions", id: "LIST" },
      ],
    }),

    // Helper: students belonging to a class group (used for "individual"
    // targeting in the posting form). If your classGroupApi already
    // exposes this, prefer that hook instead and drop this one.
    getClassGroupStudents: builder.query({
      query: (classGroupId) => `/class-groups/${classGroupId}/students`,
      providesTags: (result, error, id) => [{ type: "HomeworkAssignment", id: `students-${id}` }],
    }),
  }),
});

export const {
  useGetHomeworkAssignmentsQuery,
  useGetHomeworkAssignmentDetailsQuery,
  useGetTeacherClassGroupsAndCoursesQuery,
  useCreateHomeworkAssignmentMutation,
  useUpdateHomeworkAssignmentMutation,
  useDeleteHomeworkAssignmentMutation,
  useGetSubmissionsForAssignmentQuery,
  useGradeSubmissionMutation,
  useGetSubmissionDetailsQuery,
  useDeleteSubmissionMutation,
  useGetStudentHomeworkQuery,
  useSubmitHomeworkMutation,
  useGetClassGroupStudentsQuery,
} = homeworkApi;
