// redux/api/projectApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Projects", "Project", "ProjectSubmissions", "StudentProjects"],
  endpoints: (builder) => ({
    // ---------------- Teacher: postings ----------------
    getProjects: builder.query({
      query: ({ page = 1, limit = 8, classGroup, course, status, keyword, paginate } = {}) => ({
        url: "/teacher/projects",
        params: {
          page,
          limit,
          ...(classGroup && { classGroup }),
          ...(course && { course }),
          ...(status && { status }),
          ...(keyword && { keyword }),
          ...(paginate !== undefined && { paginate }),
        },
      }),
      providesTags: (result) =>
        result?.projects
          ? [
              ...result.projects.map(({ _id }) => ({ type: "Projects", id: _id })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),

    getProjectDetails: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    createProject: builder.mutation({
      query(body) {
        return { url: "/teacher/projects", method: "POST", body };
      },
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    updateProject: builder.mutation({
      query({ id, ...body }) {
        return { url: `/teacher/projects/${id}`, method: "PUT", body };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Projects", id },
        { type: "Project", id },
        { type: "Projects", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation({
      query(id) {
        return { url: `/teacher/projects/${id}`, method: "DELETE" };
      },
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    // ---------------- Teacher: submissions ----------------
    getSubmissionsForProject: builder.query({
      query: (id) => `/teacher/projects/${id}/submissions`,
      providesTags: (result, error, id) => [{ type: "ProjectSubmissions", id }],
    }),

    gradeProjectSubmission: builder.mutation({
      query({ id, marksObtained, feedback }) {
        return {
          url: `/teacher/project-submissions/${id}/grade`,
          method: "PUT",
          body: { marksObtained, feedback },
        };
      },
      invalidatesTags: [{ type: "ProjectSubmissions", id: "LIST" }],
    }),

    // ---------------- Shared ----------------
    getProjectSubmissionDetails: builder.query({
      query: (id) => `/project-submissions/${id}`,
      providesTags: (result, error, id) => [{ type: "ProjectSubmissions", id }],
    }),

    deleteProjectSubmission: builder.mutation({
      query(id) {
        return { url: `/project-submissions/${id}`, method: "DELETE" };
      },
      invalidatesTags: [{ type: "ProjectSubmissions", id: "LIST" }],
    }),

    // ---------------- Student ----------------
    getStudentProjects: builder.query({
      query: ({ classGroup, status } = {}) => ({
        url: "/student/projects",
        params: {
          ...(classGroup && { classGroup }),
          ...(status && { status }),
        },
      }),
      providesTags: (result) =>
        result?.projects
          ? [
              ...result.projects.map(({ _id }) => ({ type: "StudentProjects", id: _id })),
              { type: "StudentProjects", id: "LIST" },
            ]
          : [{ type: "StudentProjects", id: "LIST" }],
    }),

    submitProject: builder.mutation({
      query(body) {
        return { url: "/student/project-submissions", method: "POST", body };
      },
      invalidatesTags: [
        { type: "StudentProjects", id: "LIST" },
        { type: "ProjectSubmissions", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectDetailsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetSubmissionsForProjectQuery,
  useGradeProjectSubmissionMutation,
  useGetProjectSubmissionDetailsQuery,
  useDeleteProjectSubmissionMutation,
  useGetStudentProjectsQuery,
  useSubmitProjectMutation,
} = projectApi;
