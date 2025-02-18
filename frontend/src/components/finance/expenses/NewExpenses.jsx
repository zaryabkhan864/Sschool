import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateExpenseMutation } from "../../../redux/api/expensesApi";
import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { useTranslation } from "react-i18next";

const NewExpenses = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [createExpense, { isLoading, error, isSuccess }] = useCreateExpenseMutation();

    const [expenseData, setExpenseData] = useState({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0], // Default to today's date
        description: "",
        vendor: "",
    });

    const { category, amount, date, description, vendor } = expenseData;

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "Something went wrong!");
        }

        if (isSuccess) {
            toast.success("Expense record created successfully");
            navigate("/finance/expenses");
        }
    }, [error, isSuccess, navigate]);

    const onChange = (e) => {
        setExpenseData({ ...expenseData, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        createExpense(expenseData);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Expense"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">{t('New Expense')}</h2>
                    <form onSubmit={submitHandler}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Category')}</label>
                            <select
                                name="category"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={category}
                                onChange={onChange}
                                required
                            >
                                <option value="" disabled>{t('Select Category')}</option>
                                <option value="Electricity">{t('Electricity')}</option>
                                <option value="Maintenance">{t('Maintenance')}</option>
                                <option value="Books">{t('Books')}</option>
                                <option value="Furniture">{t('Furniture')}</option>
                                <option value="Events">{t('Events')}</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Amount')}</label>
                            <input
                                type="number"
                                name="amount"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={amount}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Date')}</label>
                            <input
                                type="date"
                                name="date"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={date}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Description')}</label>
                            <textarea
                                name="description"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={description}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">{t('Vendor')}</label>
                            <input
                                type="text"
                                name="vendor"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={vendor}
                                onChange={onChange}
                                required
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

export default NewExpenses;