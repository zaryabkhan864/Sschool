// import React, { useEffect } from "react";
// import toast from "react-hot-toast";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   useDeleteCourseMutation,
//   useGetCoursesQuery,
// } from "../../redux/api/courseApi";
// import Loader from "../layout/Loader";
// import AdminLayout from "../layout/AdminLayout";
// import MetaData from "../layout/MetaData";

// const DeleteCourse = () => {
//   const navigate = useNavigate();
//   const params = useParams();
//   const { refetch } = useGetCoursesQuery();

//   const [deleteCourse, { isLoading, error, isSuccess }] =
//     useDeleteCourseMutation();
//   const { data, loading } = useGetCoursesQuery();

//   useEffect(() => {
//     if (error) {
//       toast.error(error?.data?.message);
//     }

//     if (isSuccess) {
//       toast.success("Course deleted");
//       navigate("/admin/courses");
//       refetch();
//     }
//   }, [error, isSuccess, navigate, refetch]);

//   if (isLoading || loading) {
//     return <Loader />;
//   }

//   return (
//     <AdminLayout>
//         <MetaData title={"Delete Course"} />
//     </AdminLayout>
// );
// };

// export default DeleteCourse;
