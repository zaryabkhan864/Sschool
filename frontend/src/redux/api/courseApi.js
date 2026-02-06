import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Courses", "Course", "AdminCourses"], // Added "Courses" tag
  endpoints: (builder) => ({
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
    
    getCourseDetails: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    
    createCourse: builder.mutation({
      query(body) {
        return {
          url: "/admin/courses",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [
        { type: "Courses", id: "LIST" },
        { type: "AdminCourses" }
      ],
    }),
    
    updateCourse: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/courses/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Courses", id },
        { type: "Course", id },
        { type: "AdminCourses" }
      ],
    }),
    
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
    
    getCourseByGradeAndTeacherID: builder.mutation({
      query: (body) => ({
        url: `/courses/grade/teacher`,
        method: "POST",
        body,
      }),
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
} = courseApi;