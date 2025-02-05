import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateFeeMutation } from "../../../redux/api/feesApi";
import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { useGetStudentsWithGradesQuery } from "../../../redux/api/studentsApi";

const NewFees = () => {
    const navigate = useNavigate();
    const [createFees, { isLoading, error, isSuccess }] = useCreateFeeMutation();
    const { data: studentsData, isLoading: studentLoading } = useGetStudentsWithGradesQuery();
    const students = studentsData?.students || [];

    const [feesData, setFeesData] = useState({
        student: "",
        amount: "",
        feeType: "",
        currency: "USD",
        dueDate: "",
        status: "Unpaid",
        paymentDate: "",
        paymentMethod: "",
    });

    const { student, amount, feeType, currency, dueDate, status, paymentDate, paymentMethod } = feesData;

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "Something went wrong!");
        }

        if (isSuccess) {
            toast.success("Fees record created successfully");
            navigate("/finance/students/fees");
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
                            <select
                                id="student_field"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="student"
                                value={student}
                                onChange={onChange}
                            >
                                <option value="" disabled>
                                    Select Student
                                </option>
                                {!studentLoading &&
                                    students?.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.studentName} - {s?.grade?.gradeName}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                <select
                                    name="currency"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={currency}
                                    onChange={onChange}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="TL">TL</option>
                                    <option value="AUD">AUD</option>
                                    <option value="CAD">CAD</option>
                                    <option value="AED">AED</option>
                                </select>
                            </div>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Fee Type</label>
                                <select
                                    name="feeType"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={feeType}
                                    onChange={onChange}
                                >
                                    <option value="" disabled>Select Fee Type</option>
                                    <option value="Admission">Admission</option>
                                    <option value="Tuition">Tuition</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Hostel">Hostel</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={paymentMethod}
                                    onChange={onChange}
                                >
                                    <option value="" disabled>Select Payment Method</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Status Field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="status"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={status}
                                    onChange={onChange}
                                >
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            {/* Payment Date Field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={paymentDate}
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

export default NewFees;
