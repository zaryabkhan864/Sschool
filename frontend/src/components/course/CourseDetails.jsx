import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useParams } from "react-router-dom";
import { useGetCourseDetailsQuery } from "../../redux/api/courseApi";

const CourseDetails = () => {
    const params = useParams();
    const { data, loading, error } = useGetCourseDetailsQuery(params?.id);
    const [course, setCourse] = useState({
        courseeName: "",
        description: "",
        code: "",
        year: "",
    });

    useEffect(() => {
        if (data?.course) {
            setCourse({
                courseName: data?.grade?.courseName,
                description: data?.grade?.description,
                code: data?.grade?.code,
                year: data?.grade?.year,
            });
        }

        if (error) {
            toast.error(error?.data?.message);
        }
    }, [data, error]);

    if (loading) {
        return <Loader />;
    }

    return (
        <AdminLayout>
            <MetaData title={"Course Details"} />
            <div className="flex justify-center items-center py-10">
                <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6">Course Details</h2>
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Course Name:</p>
                        <p className="text-lg text-gray-900">{course.courseName}</p>
                    </div>
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Description:</p>
                        <p className="text-lg text-gray-900">{course.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Code:</p>
                            <p className="text-lg text-gray-900">{course.yearFrom}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Year:</p>
                            <p className="text-lg text-gray-900">{course.yearTo}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CourseDetails;
