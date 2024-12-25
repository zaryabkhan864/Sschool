import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
    reducerPath: "courseApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Course", "AdminCourses", "Reviews"],
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: (params) => ({
                url: "/courses",
                params: {
                    page: params?.page,
                    keyword: params?.keyword,
                    category: params?.category,
                },
            }),
        }),
        getCourseDetails: builder.query({
            query: (id) => `/course/${id}`,
            providesTags: ["Course"],
        }),
        createCourse: builder.mutation({
            query(body) {
                return {
                    url: "/admin/courses",
                    method: "POST",
                    body,
                };
            },
            invalidatesTags: ["AdminCourses"],
        }),
        updateCourse: builder.mutation({
            query({ id, body }) {
                return {
                    url: `/admin/courses/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Course", "AdminCourses"],
        }),
        deleteCourse: builder.mutation({
            query(id) {

                return {
                    url: `/admin/courses/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["AdminCourses"],
        }),

    }),
});

export const {
    useGetCoursesQuery,
    useGetCourseDetailsQuery,

    useGetAdminCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,

    useDeleteCourseImageMutation,
    useDeleteCourseMutation,

} = courseApi;
