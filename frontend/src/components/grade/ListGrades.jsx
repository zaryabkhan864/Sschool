import React, { useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import {
    useDeleteGradeMutation,
    useGetGradesQuery,
} from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";

const ListGrades = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetGradesQuery();

    const [
        deleteGrade,
        { isLoading: isDeleteLoading, error: deleteError, isSuccess },
    ] = useDeleteGradeMutation();

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }

        if (deleteError) {
            toast.error(deleteError?.data?.message);
        }

        if (isSuccess) {
            toast.success("Grade Deleted");
            navigate("/admin/grades");
        }
    }, [error, deleteError, isSuccess, navigate]);

    const deleteGradeHandler = (id) => {
        deleteGrade(id);
    };

    const setGrades = () => {
        const grades = {
            columns: [
                {
                    label: "ID",
                    field: "id",
                    sort: "asc",
                },
                {
                    label: "Grade Name",
                    field: "gradeName",
                    sort: "asc",
                },
                {
                    label: "Year From",
                    field: "yearFrom",
                    sort: "asc",
                },
                {
                    label: "Year To",
                    field: "yearTo",
                    sort: "asc",
                },
                {
                    label: "Actions",
                    field: "actions",
                    sort: "asc",
                },
            ],
            rows: [],
        };

        data?.grades?.forEach((grade) => {
            grades.rows.push({
                id: grade?._id,
                gradeName: `${grade?.gradeName?.substring(0, 20)}...`,
                yearFrom: grade?.yearFrom,
                yearTo: grade?.yearTo,
                actions: (
                    <div className="flex space-x-2">
                        <Link
                            to={`/admin/grades/${grade?._id}`}
                            className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                        >
                            <i className="fa fa-pencil"></i>
                        </Link>
                        <Link
                            to={`/admin/grades/${grade?._id}/details`}
                            className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                        >
                            <i className="fa fa-eye"></i>
                        </Link>
                        <button
                            className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                            onClick={() => deleteGradeHandler(grade?._id)}
                            disabled={isDeleteLoading}
                        >
                            <i className="fa fa-trash"></i>
                        </button>
                    </div>
                ),
            });
        });

        return grades;
    };

    if (isLoading) return <Loader />;

    return (
        <AdminLayout>
            <MetaData title={"All Grades"} />

            <h1 className="text-2xl font-bold my-5 text-center">{data?.grades?.length} Grades</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            {setGrades().columns.map((col) => (
                                <th
                                    key={col.field}
                                    className="px-4 py-2 text-left text-gray-600 border-b border-gray-200"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {setGrades().rows.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {Object.keys(row).map((key, i) => (
                                    <td
                                        key={i}
                                        className="px-4 py-2 text-gray-700 border-b border-gray-200"
                                    >
                                        {row[key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default ListGrades;