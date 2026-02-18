import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Courses", "Course", "AdminCourses", "CoursesByRole"],
  endpoints: (builder) => ({
    // GET all courses (with filters & pagination)
    getCourses: builder.query({
      query: ({ page = 1, limit = 5, keyword = "", teacherId } = {}) => ({
        url: "/courses",
        params: { 
          page, 
          limit, 
          keyword,
          ...(teacherId && { teacherId })
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.courses.map(({ _id }) => ({ type: "Courses", id: _id })),
              { type: "Courses", id: "LIST" },
            ]
          : [{ type: "Courses", id: "LIST" }],
    }),

    // GET single course details
    getCourseDetails: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    // CREATE new course
    createCourse: builder.mutation({
      query({ courseName, description, code, teacher, grade, ...rest }) {
        return {
          url: "/admin/courses",
          method: "POST",
          body: { courseName, description, code, teacher, grade, ...rest },
        };
      },
      invalidatesTags: [
        { type: "Courses", id: "LIST" },
        { type: "AdminCourses" }
      ],
    }),

    // UPDATE course – expects individual fields
    updateCourse: builder.mutation({
      query({ id, courseName, description, code, teacher, grade, ...rest }) {
        return {
          url: `/admin/courses/${id}`,
          method: "PUT",
          body: { courseName, description, code, teacher, grade, ...rest },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Courses", id },
        { type: "Course", id },
        { type: "AdminCourses" }
      ],
    }),

    // DELETE course
    deleteCourse: builder.mutation({
      query(id) {
        return {
          url: `/admin/courses/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: [
        { type: "Courses", id: "LIST" },
        { type: "AdminCourses" }
      ],
    }),

    // Get courses by grade + teacher
    getCourseByGradeAndTeacherID: builder.mutation({
      query: (body) => ({
        url: `/courses/grade/teacher`,
        method: "POST",
        body,
      }),
    }),

    // Get courses & class groups by user role
    getCoursesByRole: builder.query({
      query: ({ userId, userRole }) => {
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (userRole) params.append("role", userRole);
        return `/courses/by-role?${params.toString()}`;
      },
      transformResponse: (response) => ({
        classGroups: response.classGroups || [],
        courses: response.courses || [],
      }),
      providesTags: ["CoursesByRole"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseDetailsQuery,
  useGetCourseByGradeAndTeacherIDMutation,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesByRoleQuery,
} = courseApi;