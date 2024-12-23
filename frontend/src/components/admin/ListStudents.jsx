import React, { useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import {
    useDeleteStudentMutation,
    useGetStudentsQuery,
} from "../../redux/api/studentsApi";
import AdminLayout from "../layout/AdminLayout";

const ListStudents = () => {
    const { data, isLoading, error } = useGetStudentsQuery();

    const [
        deleteStudent,
        { isLoading: isDeleteLoading, error: deleteError, isSuccess },
    ] = useDeleteStudentMutation();

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }

        if (deleteError) {
            toast.error(deleteError?.data?.message);
        }

        if (isSuccess) {
            toast.success("Student Deleted");
        }
    }, [error, deleteError, isSuccess]);

    const deleteStudentHandler = (id) => {
        deleteStudent(id);
    };

    const setStudents = () => {
        return data?.students?.map((student) => (
            <tr key={student?._id} className="text-sm border-b hover:bg-gray-100">
                <td className="px-4 py-2">{student?._id}</td>
                <td className="px-4 py-2">{`${student?.studentName?.substring(0, 20)}...`}</td>
                <td className="px-4 py-2">{student?.age}</td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                    <Link
                        to={`/admin/students/${student?._id}`}
                        className="text-blue-500 hover:underline"
                    >
                        <i className="fas fa-pencil-alt"></i>
                    </Link>
                    <Link
                        to={`/admin/students/${student?._id}/details`}
                        className="text-green-500 hover:underline"
                    >
                        <i className="fas fa-eye"></i>
                    </Link>
                    <button
                        className="text-red-500 hover:underline"
                        onClick={() => deleteStudentHandler(student?._id)}
                        disabled={isDeleteLoading}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        ));
    };

    if (isLoading) return <Loader />;

    return (
        <AdminLayout>
            <MetaData title={"All Students"} />

            <h1 className="text-2xl font-bold my-5 text-center">
                {data?.students?.length} Students
            </h1>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Age</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>{setStudents()}</tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default ListStudents;