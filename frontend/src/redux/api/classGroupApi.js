import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const classGroupApi = createApi({
  reducerPath: "classGroupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Auth token handle karne ke liye
      const token = getState()?.auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ClassGroup", "ClassGroupStudents"],
  endpoints: (builder) => ({
    // Get class groups with pagination and filters
    getClassGroups: builder.query({
      query: ({
        page = 1,
        limit = 10,
        keyword = "",
        status,
        campus,
        grade,
        academicLevel,
        teacherId, // 👈 NEW: restrict to class groups whose courses this teacher teaches
        paginate = true,
      } = {}) => {
        const params = new URLSearchParams();

        params.append("paginate", paginate.toString());

        if (paginate === true) {
          if (page) params.append("page", page);
          if (limit) params.append("limit", limit);
        }

        if (keyword) params.append("keyword", keyword);
        if (status) params.append("status", status);
        if (campus) params.append("campus", campus);
        if (grade) params.append("grade", grade);
        if (academicLevel) params.append("academicLevel", academicLevel);
        if (teacherId) params.append("teacherId", teacherId);

        return {
          url: `/class-groups?${params.toString()}`,
        };
      },

      transformResponse: (response) => ({
        success: response.success || false,
        classGroups: response.classGroups || [],
        pagination: response.pagination || null,
        counts: response.counts ||
          response.pagination?.counts || {
            total: 0,
            active: 0,
            deactive: 0,
          },
      }),

      providesTags: (result) => {
        if (!result) return [{ type: "ClassGroup", id: "LIST" }];
        const tags = [{ type: "ClassGroup", id: "LIST" }];
        if (result.classGroups) {
          result.classGroups.forEach((group) =>
            tags.push({ type: "ClassGroup", id: group._id })
          );
        }
        return tags;
      },
      keepUnusedDataFor: 60,
    }),

    // Get specific class group details
    getClassGroupDetails: builder.query({
      query: (id) => `/class-groups/${id}`,
      transformResponse: (response) => response.classGroup || response,
      providesTags: (result, error, id) => [{ type: "ClassGroup", id }],
    }),

    // ✅ NEW: Get all students enrolled in a class group
    getClassGroupStudents: builder.query({
      query: (id) => `/class-groups/${id}/students`,
      transformResponse: (response) => ({
        classGroup: response.classGroup || null,
        students: response.students || [],
      }),
      providesTags: (result, error, id) => [
        { type: "ClassGroupStudents", id },
      ],
      keepUnusedDataFor: 60,
    }),

    // Get class groups for dropdowns (No pagination)
    getClassGroupsForDropdown: builder.query({
      query: ({ campus, status = "active", grade, academicLevel } = {}) => {
        const params = new URLSearchParams();
        params.append("paginate", "false");
        if (campus) params.append("campus", campus);
        if (status) params.append("status", status);
        if (grade) params.append("grade", grade);
        if (academicLevel) params.append("academicLevel", academicLevel);
        return {
          url: `/class-groups?${params.toString()}`,
        };
      },
      transformResponse: (response) => response.classGroups || [],
      providesTags: [{ type: "ClassGroup", id: "DROPDOWN" }],
    }),

    // Create Class Group (Admin only)
    createClassGroup: builder.mutation({
      query: (body) => ({
        url: "/admin/class-groups",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "ClassGroup", id: "LIST" },
        { type: "ClassGroup", id: "DROPDOWN" },
      ],
    }),

    // Update Class Group (Admin only)
    updateClassGroup: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/class-groups/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClassGroup", id },
        { type: "ClassGroup", id: "LIST" },
        { type: "ClassGroup", id: "DROPDOWN" },
      ],
    }),

    // Delete Class Group (Admin only)
    deleteClassGroup: builder.mutation({
      query: (id) => ({
        url: `/admin/class-groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClassGroup", id },
        { type: "ClassGroup", id: "LIST" },
        { type: "ClassGroup", id: "DROPDOWN" },
      ],
    }),

    // 👇 NEW: for a teacher, returns just their own courses + the class
    // groups those courses belong to; for admin, returns everything.
    // Backed by the existing POST /teacher/class-groups/courses endpoint
    // (classGroupController.getCoursesAndClassGroupByRole) — used by the
    // Attendance module so a teacher only sees their own course/class
    // combinations to take attendance for.
    getCoursesAndClassGroupByRole: builder.mutation({
      query(body) {
        return {
          url: "/teacher/class-groups/courses",
          method: "POST",
          body, // { userId, userRole }
        };
      },
    }),
  }),
});

// Export hooks
export const {
  useGetClassGroupsQuery,
  useLazyGetClassGroupsQuery,
  useGetClassGroupDetailsQuery,
  useGetClassGroupStudentsQuery,
  useGetClassGroupsForDropdownQuery,
  useCreateClassGroupMutation,
  useUpdateClassGroupMutation,
  useDeleteClassGroupMutation,
  useGetCoursesAndClassGroupByRoleMutation,
} = classGroupApi;