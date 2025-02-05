import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateFeeMutation } from "../../../redux/api/feesApi";
import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";

const NewFees = () => {
    const navigate = useNavigate();
    const [createFees, { isLoading, error, isSuccess }] = useCreateFeeMutation();

    const [feesData, setFeesData] = useState({
        studentName: "",
        amount: "",
        dueDate: "",
        status: "pending",
    });

    const { studentName, amount, dueDate, status } = feesData;

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "Something went wrong!");
        }

        if (isSuccess) {
            toast.success("Fees record created successfully");
            navigate("/admin/fees");
        }
    }, [error, isSuccess, navigate]);

    const onChange = (e) => {
        setFeesData({ ...feesData, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        createFees(feesData);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Fees"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">New Fees</h2>
                    <form onSubmit={submitHandler}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={studentName}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={amount}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={dueDate}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={status}
                                onChange={onChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
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

export default NewFees;