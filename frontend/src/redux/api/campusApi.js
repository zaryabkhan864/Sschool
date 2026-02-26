import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const campusApi = createApi({
  reducerPath: "campusApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  tagTypes: ["Campus", "AdminCampus"], // Campus = individual campus + LIST tag ke liye

  endpoints: (builder) => ({
    // -----------------------------------------------------------------
    // GET all campuses (with filters, pagination, search, counts)
    // -----------------------------------------------------------------
    getCampus: builder.query({
      query: (params = {}) => {
        // Saare supported query params jo controller expect karta hai
        const queryParams = {
          page: params?.page,
          limit: params?.limit,           // pagination ke liye
          keyword: params?.keyword,        // search term
          status: params?.status,          // "active" ya "inactive"
          paginate: params?.paginate,      // 'false' for dropdown (all records)
          // Agar aur filters chahiye (jaise location, sort), to yahan add karo
        };

        // Remove undefined values taake URL clean rahe
        Object.keys(queryParams).forEach(key =>
          queryParams[key] === undefined && delete queryParams[key]
        );

        return {
          url: "/campus",
          params: queryParams,
        };
      },
      // Transform response to easily access data in components
      transformResponse: (response) => response,
      
      // Cache tags: har campus ko individually tag karo + LIST tag
      providesTags: (result) =>
        result?.campuses
          ? [
              ...result.campuses.map(({ _id }) => ({ type: "Campus", id: _id })),
              { type: "Campus", id: "LIST" },
            ]
          : [{ type: "Campus", id: "LIST" }],
    }),

    // -----------------------------------------------------------------
    // GET single campus by ID (details page ke liye)
    // -----------------------------------------------------------------
    getCampusDetails: builder.query({
      query: (id) => `/campus/${id}`,
      providesTags: (result, error, id) => [{ type: "Campus", id }], // specific ID ke saath
    }),

    // -----------------------------------------------------------------
    // CREATE new campus
    // -----------------------------------------------------------------
    createCampus: builder.mutation({
      query(body) {
        return {
          url: "/admin/campus",
          method: "POST",
          body,
        };
      },
      // Naya campus add hone se LIST invalidate hona chahiye
      invalidatesTags: [
        { type: "Campus", id: "LIST" },
        { type: "AdminCampus" }
      ],
    }),

    // -----------------------------------------------------------------
    // UPDATE existing campus
    // -----------------------------------------------------------------
    updateCampus: builder.mutation({
      query({ id, ...body }) {  // body ko spread kiya taake { id, body } na dena pade
        return {
          url: `/admin/campus/${id}`,
          method: "PUT",
          body,
        };
      },
      // Specific campus update hone se uska individual tag + LIST dono invalidate honge
      invalidatesTags: (result, error, { id }) => [
        { type: "Campus", id },           // specific campus
        { type: "Campus", id: "LIST" },   // poori list bhi (agar list me bhi changes dikhne chahiye)
        { type: "AdminCampus" }
      ],
    }),

    // -----------------------------------------------------------------
    // SET campus token (special endpoint - GET request)
    // -----------------------------------------------------------------
    setCampusToken: builder.mutation({
      query: (id) => ({
        url: `/campus/token/${id}`,
        method: "GET", // GET method but mutation is used because it changes state
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Campus", id },           // token change se campus data refresh
        { type: "Campus", id: "LIST" }    // agar list me bhi token dikhta ho to
      ],
    }),

    // -----------------------------------------------------------------
    // DELETE campus
    // -----------------------------------------------------------------
    deleteCampus: builder.mutation({
      query: (id) => ({
        url: `/admin/campus/${id}`,        // /admin/campus/ consistent rakha
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Campus", id: "LIST" },    // campus delete hone se list change
        { type: "AdminCampus" }
      ],
    }),
  }),
});

export const {
  useGetCampusQuery,
  useGetCampusDetailsQuery,
  useCreateCampusMutation,
  useUpdateCampusMutation,
  useSetCampusTokenMutation,
  useDeleteCampusMutation,
} = campusApi;