import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";

import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useCreateGradeMutation, useGetGradesQuery } from "../../redux/api/gradesApi";

const NewGrade = () => {
    const navigate = useNavigate();
    const { refetch } = useGetGradesQuery();

    const [grade, setGrade] = useState({
        gradeName: "",
        description: "",
        yearFrom: "",
        yearTo: "",
    });

    const { gradeName, description, yearFrom, yearTo } = grade;

    const [createGrade, { isLoading, error, isSuccess }] = useCreateGradeMutation();

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            toast.success("Grade created");
            navigate("/admin/grades");
            refetch();
        }
    }, [error, isSuccess, navigate, refetch]);

    const onChange = (e) => {
        setGrade({ ...grade, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        createGrade(grade);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Grade"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">New Grade</h2>
                    <form onSubmit={submitHandler} >

                        <div className="mb-4">
                            <label htmlFor="gradeName_field" className="block text-sm font-medium text-gray-700">
                                Grade Name
                            </label>
                            <input
                                type="text"
                                id="gradeName_field"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="gradeName"
                                value={gradeName}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description_field" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description_field"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="description"
                                rows="4"
                                value={description}
                                onChange={onChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label htmlFor="yearFrom_field" className="block text-sm font-medium text-gray-700">
                                    Year From
                                </label>
                                <input
                                    type="number"
                                    id="yearFrom_field"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    name="yearFrom"
                                    value={yearFrom}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="yearTo_field" className="block text-sm font-medium text-gray-700">
                                    Year To
                                </label>
                                <input
                                    type="number"
                                    id="yearTo_field"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    name="yearTo"
                                    value={yearTo}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 text-white font-semibold rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring focus:ring-blue-300`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "CREATE"}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default NewGrade;
