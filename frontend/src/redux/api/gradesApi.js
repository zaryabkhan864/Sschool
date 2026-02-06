import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Add any headers if needed
      return headers;
    }
  }),
  tagTypes: ["Grade", "GradesList"],
  endpoints: (builder) => ({
    // Get grades with pagination
// RTK Query for Grades
getGrades: builder.query({
  query: ({ 
    page = 1, 
    limit = 8, 
    keyword = "", 
    status,
    campus,
    year,
    teacherId,
    populateStudents,
    populateCourses,
    populateTeacher,
    academicLevelId,
    includeStudents,
    section 
  } = {}) => {
    
    const params = new URLSearchParams();
    
    // Basic pagination and search
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (keyword) params.append('keyword', keyword);
    
    // Filters
    if (status) params.append('status', status);
    if (campus) params.append('campus', campus);
    if (year) params.append('year', year);
    if (teacherId) params.append('teacherId', teacherId);
    if (academicLevelId) params.append('academicLevelId', academicLevelId);
    if (section) params.append('section', section);
    
    // Population options
    if (populateStudents === 'true' || populateStudents === true) {
      params.append('populateStudents', 'true');
    }
    
    if (populateCourses === 'true' || populateCourses === true) {
      params.append('populateCourses', 'true');
    }
    
    if (populateTeacher === 'true' || populateTeacher === true) {
      params.append('populateTeacher', 'true');
    }
    
    if (includeStudents === 'true' || includeStudents === true) {
      params.append('includeStudents', 'true');
    }
    
    // Agar limit 0 hai (dropdown ke liye) to page parameter hata do
    if (limit === 0) {
      params.delete('page');
    }
    
    const queryString = params.toString();
    
    return {
      url: queryString ? `/grades?${queryString}` : '/grades',
    };
  },
  
  // Transform response to ensure consistent structure
  transformResponse: (response) => {
    // Ensure response has the expected structure
    const transformed = {
      success: response.success || false,
      grades: response.grades || [],
      counts: {
        total: 0,
        active: 0,
        deactive: 0
      }
    };
    
    // Handle counts from different response structures
    if (response.counts) {
      transformed.counts = {
        total: response.counts.total || 0,
        active: response.counts.active || 0,
        deactive: response.counts.deactive || 0
      };
    } else if (response.pagination?.counts) {
      transformed.counts = {
        total: response.pagination.counts.total || 0,
        active: response.pagination.counts.active || 0,
        deactive: response.pagination.counts.deactive || 0
      };
    }
    
    // Add pagination if available
    if (response.pagination) {
      transformed.pagination = {
        total: response.pagination.total || 0,
        page: response.pagination.page || 1,
        limit: response.pagination.limit || 8,
        totalPages: response.pagination.totalPages || 1,
        counts: transformed.counts
      };
      
      // Agar pagination ke andar alag se counts nahi hai to upar wala use karo
      if (!response.pagination.counts) {
        transformed.pagination.counts = transformed.counts;
      }
    }
    
    return transformed;
  },
  
  // Provides tags for cache invalidation
  providesTags: (result) => {
    if (!result) {
      return [{ type: 'Grades', id: 'LIST' }];
    }
    
    const tags = [
      { type: 'Grades', id: 'LIST' },
      ...result.grades.map((grade) => ({ 
        type: 'Grade', 
        id: grade._id 
      }))
    ];
    
    // Agar paginated data hai to page-based tag bhi add karo
    if (result.pagination) {
      tags.push({ 
        type: 'Grades', 
        id: `PAGE_${result.pagination.page}_${result.pagination.limit}` 
      });
    }
    
    return tags;
  },
  
  // Optional: Keep data fresh with refetch options
  keepUnusedDataFor: 60, // 60 seconds
}),

    // Get grade details
    getGradeDetails: builder.query({
      query: (id) => `/grades/${id}`,
      transformResponse: (response) => response.grade || response,
      providesTags: (result, error, id) => [
        { type: 'Grade', id }
      ],
    }),

    // Get grades for dropdown
    getGradesForDropdown: builder.query({
      query: ({ campus, year } = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '0'); // Disable pagination
        
        if (campus) queryParams.append('campus', campus);
        if (year) queryParams.append('year', year);
        
        return {
          url: `/grades?${queryParams.toString()}`,
        };
      },
      transformResponse: (response) => response.grades || [],
      providesTags: [{ type: 'GradesList', id: 'DROPDOWN' }],
    }),

    // Get grade counts
    getGradeCounts: builder.query({
      query: ({ campus, year, status } = {}) => {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '1');
        
        if (campus) queryParams.append('campus', campus);
        if (year) queryParams.append('year', year);
        if (status) queryParams.append('status', status);
        
        return {
          url: `/grades?${queryParams.toString()}`,
        };
      },
      transformResponse: (response) => 
        response.counts || response.pagination?.counts || {
          total: 0,
          active: 0,
          deactive: 0
        },
      providesTags: [{ type: 'GradesList', id: 'COUNTS' }],
    }),

    // Admin mutations
    createGrade: builder.mutation({
      query: (body) => ({
        url: '/admin/grades',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'GradesList', id: 'LIST' },
        { type: 'GradesList', id: 'DROPDOWN' },
        { type: 'GradesList', id: 'COUNTS' }
      ],
    }),

    updateGrade: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/grades/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Grade', id },
        { type: 'GradesList', id: 'LIST' },
        { type: 'GradesList', id: 'DROPDOWN' },
        { type: 'GradesList', id: 'COUNTS' }
      ],
    }),

    deleteGrade: builder.mutation({
      query: (id) => ({
        url: `/admin/grades/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Grade', id },
        { type: 'GradesList', id: 'LIST' },
        { type: 'GradesList', id: 'DROPDOWN' },
        { type: 'GradesList', id: 'COUNTS' }
      ],
    }),

    // Missing endpoints that were removed but needed by components
    getGradeByUserIdAndRole: builder.mutation({
      query: (body) => ({
        url: `/grade/grade-by-role`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: 'GradesList', id: 'LIST' }
      ],
    }),

    getCourseByGradeAndTeacherID: builder.mutation({
      query: (data) => ({
        url: "/grades/getCourseByGradeAndTeacherID",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: 'GradesList', id: 'LIST' }
      ],
    }),
  }),
});

// Export all hooks including the missing ones
export const {
  useGetGradesQuery,
  useLazyGetGradesQuery,
  useGetGradeDetailsQuery,
  useGetGradesForDropdownQuery,
  useGetGradeCountsQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  // Export the missing hooks
  useGetGradeByUserIdAndRoleMutation,
  useGetCourseByGradeAndTeacherIDMutation,
} = gradeApi;