import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";

import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useCreateGradeMutation } from "../../redux/api/gradesApi";

const NewGrade = () => {
    const navigate = useNavigate();

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
        }
    }, [error, isSuccess, navigate]);

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
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-lg p-6 bg-white shadow-md rounded-lg">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center">New Grade</h2>

                        <div>
                            <label htmlFor="gradeName_field" className="block text-sm font-medium text-gray-700">
                                Grade Name
                            </label>
                            <input
                                type="text"
                                id="gradeName_field"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                name="gradeName"
                                value={gradeName}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="description_field" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description_field"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                name="description"
                                value={description}
                                onChange={onChange}
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="yearFrom_field" className="block text-sm font-medium text-gray-700">
                                Year From
                            </label>
                            <input
                                type="number"
                                id="yearFrom_field"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                name="yearFrom"
                                value={yearFrom}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="yearTo_field" className="block text-sm font-medium text-gray-700">
                                Year To
                            </label>
                            <input
                                type="number"
                                id="yearTo_field"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                name="yearTo"
                                value={yearTo}
                                onChange={onChange}
                            />
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
