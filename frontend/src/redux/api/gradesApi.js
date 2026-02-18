// api/gradeApi.js - SIMPLIFIED VERSION
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Add any headers if needed
      const token = getState()?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["Grade"],
  endpoints: (builder) => ({
    // Get grades with pagination
    getGrades: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        keyword = "", 
        status,
        campus,
        year,
        academicLevelId,
        paginate = true // Default true
      } = {}) => {
        const params = new URLSearchParams();
        
        // Explicitly pass paginate flag to backend
        params.append('paginate', paginate.toString());
    
        if (paginate === true) {
          if (page) params.append('page', page);
          if (limit) params.append('limit', limit);
        }
        
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);
        if (campus) params.append('campus', campus);
        if (year) params.append('year', year);
        if (academicLevelId) params.append('academicLevelId', academicLevelId);
        
        return {
          url: `/grades?${params.toString()}`,
        };
      },
      
      transformResponse: (response) => ({
        success: response.success || false,
        grades: response.grades || [],
        pagination: response.pagination || null,
        counts: response.counts || response.pagination?.counts || {
          total: 0,
          active: 0,
          deactive: 0
        }
      }),
      
      providesTags: (result) => {
        if (!result) return [{ type: "Grade", id: "LIST" }];
        const tags = [{ type: "Grade", id: "LIST" }];
        if (result.grades) {
          result.grades.forEach(grade => tags.push({ type: "Grade", id: grade._id }));
        }
        return tags;
      },
      keepUnusedDataFor: 60,
    }),

    // Get grade details
    getGradeDetails: builder.query({
      query: (id) => `/grades/${id}`,
      transformResponse: (response) => response.grade || response,
      providesTags: (result, error, id) => [
        { type: "Grade", id }
      ],
    }),

    // Get grades for dropdown (no pagination)
    getGradesForDropdown: builder.query({
      query: ({ campus, year, status = "active" } = {}) => {
        const params = new URLSearchParams();
        params.append('paginate', 'false');
        if (campus) params.append('campus', campus);
        if (year) params.append('year', year);
        if (status) params.append('status', status);
        
        return {
          url: `/grades?${params.toString()}`,
        };
      },
      transformResponse: (response) => response.grades || [],
      providesTags: [{ type: "Grade", id: "DROPDOWN" }],
    }),

    // Create grade (Admin only)
    createGrade: builder.mutation({
      query: (body) => ({
        url: '/admin/grades',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: "Grade", id: "LIST" },
        { type: "Grade", id: "DROPDOWN" }
      ],
    }),

    // Update grade (Admin only)
    updateGrade: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/grades/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Grade", id },
        { type: "Grade", id: "LIST" }
      ],
    }),

    // Delete grade (Admin only)
    deleteGrade: builder.mutation({
      query: (id) => ({
        url: `/admin/grades/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Grade", id },
        { type: "Grade", id: "LIST" },
        { type: "Grade", id: "DROPDOWN" }
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetGradesQuery,
  useLazyGetGradesQuery,
  useGetGradeDetailsQuery,
  useGetGradesForDropdownQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
} = gradeApi;