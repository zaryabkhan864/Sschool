import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticated, setLoading, setUser } from "../features/userSlice";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["User", "AdminUsers", "AdminUser", "AcademicYears", "ClassGroups"],

  endpoints: (builder) => ({
    // ========== Auth ==========
    register: builder.mutation({
      query(body) {
        return { url: "/register", method: "POST", body };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(authApi.endpoints.getMe.initiate(null));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    login: builder.mutation({
      query(body) {
        return { url: "/login", method: "POST", body };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          await dispatch(authApi.endpoints.getMe.initiate(null));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    logout: builder.query({
      query: () => "/logout",
    }),

    // ========== Current User ==========
    getMe: builder.query({
      query: () => `/me`,
      transformResponse: (result) => result.user,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          dispatch(setIsAuthenticated(true));
          dispatch(setLoading(false));
        } catch (error) {
          dispatch(setLoading(false));
          console.log(error);
        }
      },
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation({
      query(body) {
        return { url: "/me/update", method: "PUT", body };
      },
      invalidatesTags: ["User"],
    }),

    uploadAvatar: builder.mutation({
      query(body) {
        return { url: "/me/upload_avatar", method: "PUT", body };
      },
      invalidatesTags: ["User"],
    }),

    updatePassword: builder.mutation({
      query(body) {
        return { url: "/password/update", method: "PUT", body };
      },
    }),

    forgotPassword: builder.mutation({
      query(body) {
        return { url: "/password/forgot", method: "POST", body };
      },
    }),

    resetPassword: builder.mutation({
      query({ token, body }) {
        return { url: `/password/reset/${token}`, method: "PUT", body };
      },
    }),

    // ========== Admin: Users ==========
    getAdminUsers: builder.query({
      query: () => `/admin/users`,
      providesTags: ["AdminUsers"],
    }),

    getUserDetails: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminUser", id }],
    }),

    updateUser: builder.mutation({
      query({ id, body }) {
        return { url: `/admin/users/${id}`, method: "PUT", body };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminUser", id },
        "AdminUsers",
        "UnenrolledStudents",
      ],
    }),

    deleteUser: builder.mutation({
      query(id) {
        return { url: `/admin/users/${id}`, method: "DELETE" };
      },
      invalidatesTags: ["AdminUsers"],
    }),

    // ========== Users by type ==========
    getUserByType: builder.query({
      query: ({
        type,
        page = 1,
        limit = undefined,
        keyword = "",
        gender,
        status,
        dropdown = false,
        enrolled,
        contracted,
        campus,
        academicYear,
        classGroup,
        ignoreAcademicYear, // ✅ new flag
        ignoreCampus,       // ✅ new flag (optional)
      }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (keyword) params.append("keyword", keyword);
        if (limit !== undefined && limit !== null && limit !== "") {
          params.append("limit", limit);
        }
        if (dropdown) params.append("dropdown", "true");
        if (gender) params.append("gender", gender);
        if (status) params.append("accountStatus", status);
        if (enrolled !== undefined) params.append("enrolled", enrolled);
        if (contracted !== undefined) params.append("contracted", contracted);
        if (campus) params.append("campus", campus);
        if (academicYear) params.append("academicYear", academicYear);
        if (classGroup) params.append("classGroup", classGroup);
        if (ignoreAcademicYear) params.append("ignoreAcademicYear", "true"); // ✅
        if (ignoreCampus) params.append("ignoreCampus", "true");           // ✅

        return { url: `/users/${type}?${params.toString()}`, method: "GET" };
      },
      providesTags: ["AdminUsers"],
    }),

    getUsersByTypeForEnrollment: builder.query({
      query: ({
        type,
        page = 1,
        limit = undefined,
        keyword = "",
        gender,
        status,
        dropdown = false,
        enrolled,
      }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        if (keyword) params.append("keyword", keyword);
        if (limit !== undefined && limit !== null && limit !== "") {
          params.append("limit", limit);
        }
        if (dropdown) params.append("dropdown", "true");
        if (gender) params.append("gender", gender);
        if (status) params.append("accountStatus", status);
        if (enrolled !== undefined) params.append("enrolled", enrolled);
        return {
          url: `/users/enrollment/${type}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminUsers"],
    }),

    // ========== Student helpers ==========
    createStudentEnrollment: builder.mutation({
      query: (body) => ({
        url: "/admin/student-enrollments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "AdminUser", id: body?.student },
        "UnenrolledStudents",
        "EnrolledStudents",
        "AdminUsers",
      ],
    }),

    getUnenrolledStudents: builder.query({
      query: (params = {}) => {
        const queryParams = {
          academicYear: params?.academicYear,
          campus: params?.campus,
        };
        Object.keys(queryParams).forEach(
          (key) => queryParams[key] === undefined && delete queryParams[key]
        );
        return { url: "/students/unenrolled", params: queryParams };
      },
      providesTags: ["UnenrolledStudents"],
    }),

    getEnrolledStudentsWithDetails: builder.query({
      query: () => "/students/enrolled",
      providesTags: ["EnrolledStudents"],
    }),

    getYearlyCampusCounts: builder.query({
      query: (params = {}) => {
        const { academicYear, campus } = params;
        const queryParams = new URLSearchParams();
        if (academicYear) queryParams.append("academicYear", academicYear);
        if (campus) queryParams.append("campus", campus);
        return {
          url: `/stats/yearly-campus-counts?${queryParams.toString()}`,
        };
      },
      providesTags: ["YearlyCounts"],
    }),

    // ✅ Fetch all academic years
    getAcademicYears: builder.query({
      query: () => "/academic-years",
      providesTags: ["AcademicYears"],
      transformResponse: (response) => response.years,
    }),

    // 🆕 Fetch all class groups (used for the "Class" filter on Student Management)
    getClassGroups: builder.query({
      query: () => "/class-groups",
      providesTags: ["ClassGroups"],
      transformResponse: (response) => response.classGroups,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLazyLogoutQuery,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAdminUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserByTypeQuery,
  useGetUsersByTypeForEnrollmentQuery,
  useCreateStudentEnrollmentMutation,
  useGetUnenrolledStudentsQuery,
  useGetEnrolledStudentsWithDetailsQuery,
  useGetYearlyCampusCountsQuery,
  useGetAcademicYearsQuery,
  useGetClassGroupsQuery,
} = authApi;