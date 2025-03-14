import React, { useState, useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { MDBDataTable } from "mdbreact";
import MetaData from "../layout/MetaData";

import AdminLayout from "../layout/AdminLayout";
import {
  useDeleteReviewMutation,
  useLazyGetStudentReviewsQuery,
} from "../../redux/api/studentsApi";
const StudentReviews = () => {
  // const [studentId, setStudentId] = useState("");

  // const [getStudentReviews, { data, isLoading, error }] =
  //   useLazyGetStudentReviewsQuery();

  // const [
  //   deleteReview,
  //   { error: deleteError, isLoading: isDeleteLoading, isSuccess },
  // ] = useDeleteReviewMutation();

  // useEffect(() => {
  //   if (error) {
  //     toast.error(error?.data?.message);
  //   }

  //   if (deleteError) {
  //     toast.error(deleteError?.data?.message);
  //   }

  //   if (isSuccess) {
  //     toast.success("Review Deleted");
  //   }
  // }, [error, deleteError, isSuccess]);

  // const submitHandler = (e) => {
  //   e.preventDefault();
  //   getStudentReviews(studentId);
  // };

  // const deleteReviewHandler = (id) => {
  //   deleteReview({ studentId, id });
  // };

  // const setReviews = () => {
  //   const reviews = {
  //     columns: [
  //       {
  //         label: "Review ID",
  //         field: "id",
  //         sort: "asc",
  //       },
  //       {
  //         label: "Rating",
  //         field: "rating",
  //         sort: "asc",
  //       },
  //       {
  //         label: "Comment",
  //         field: "comment",
  //         sort: "asc",
  //       },
  //       {
  //         label: "User",
  //         field: "user",
  //         sort: "asc",
  //       },
  //       {
  //         label: "Actions",
  //         field: "actions",
  //         sort: "asc",
  //       },
  //     ],
  //     rows: [],
  //   };

  //   data?.reviews?.forEach((review) => {
  //     reviews.rows.push({
  //       id: review?._id,
  //       rating: review?.rating,
  //       comment: review?.comment,
  //       user: review?.user?.name,
  //       actions: (
  //         <>
  //           <button
  //             className="btn btn-outline-danger ms-2"
  //             onClick={() => deleteReviewHandler(review?._id)}
  //             disabled={isDeleteLoading}
  //           >
  //             <i className="fa fa-trash"></i>
  //           </button>
  //         </>
  //       ),
  //     });
  //   });

  //   return reviews;
  // };

  // if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      {/* <div className="row justify-content-center my-5">
        <div className="col-6">
          <form onSubmit={submitHandler}>
            <div className="mb-3">
              <label htmlFor="studentId_field" className="form-label">
                Enter Student ID
              </label>
              <input
                type="text"
                id="studentId_field"
                className="form-control"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <button
              id="search_button"
              type="submit"
              className="btn btn-primary w-100 py-2"
            >
              SEARCH
            </button>
          </form>
        </div>
      </div>

      {data?.reviews?.length > 0 ? (
        <MDBDataTable
          data={setReviews()}
          className="px-3"
          bordered
          striped
          hover
        />
      ) : (
        <p className="mt-5 text-center">No Reviews</p>
      )} */}
    </AdminLayout>
  );
};

export default StudentReviews;
