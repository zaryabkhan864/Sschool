import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateSalaryMutation } from "../../../redux/api/salaryApi";
import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { useGetUserByTypeQuery } from "../../../redux/api/userApi";
import { useTranslation } from "react-i18next";

const NewSalary = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [createSalary, { isLoading, error, isSuccess }] = useCreateSalaryMutation();
    const { data: employeesData, isLoading: employeesLoading } = useGetUserByTypeQuery("employee");
    const employees = employeesData?.users || [];

    const [salaryData, setSalaryData] = useState({
        employeeId: "",
        amount: "",
        month: "",
        status: "Unpaid",
        paymentDate: "",
        deductions: "",
        netSalary: "",
    });

    const { employeeId, amount, month, status, paymentDate, deductions, netSalary } = salaryData;

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "Something went wrong!");
        }
        if (isSuccess) {
            toast.success("Salary record created successfully");
            navigate("/finance/employees/salaries");
        }
    }, [error, isSuccess, navigate]);

    const onChange = (e) => {
        setSalaryData({ ...salaryData, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        console.log("from form salaryData", salaryData)
        createSalary(salaryData);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Salary"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">{t('New Salary')}</h2>
                    <form onSubmit={submitHandler}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Employee Name')}</label>
                            <select
                                name="employeeId" // Change name to employeeId
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={employeeId} // Set value to employeeId
                                onChange={onChange}
                            >
                                <option value="" disabled>{t('Select Employee')}</option>
                                {!employeesLoading && employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Amount')}</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={amount}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Month')}</label>
                                <input
                                    type="month"
                                    name="month"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={month}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Deductions')}</label>
                                <input
                                    type="number"
                                    name="deductions"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={deductions}
                                    onChange={onChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Net Salary')}</label>
                                <input
                                    type="number"
                                    name="netSalary"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={netSalary}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Status')}</label>
                                <select
                                    name="status"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={status}
                                    onChange={onChange}
                                >
                                    <option value="Unpaid">{t('Unpaid')}</option>
                                    <option value="Paid">{t('Paid')}</option>
                                    <option value="Pending">{t('Pending')}</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">{t('Payment Date')}</label>
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

export default NewSalary;