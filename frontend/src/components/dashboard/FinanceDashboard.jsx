import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useGetFeeStaticsQuery, useGetRevenueVsExpensesQuery } from "../../redux/api/revenueApi";

const FinanceDashboard = () => {
    const { data, isLoading, error } = useGetRevenueVsExpensesQuery();
    const { data: feesStatics, isLoading: feesStaticsLoading, error: feesStaticsError } = useGetFeeStaticsQuery();

    if (isLoading || feesStaticsLoading) return <p>Loading...</p>;
    if (error || feesStaticsError) return <p>Error loading data.</p>;

    const financialData = data?.data[0] || {};

    const barChartData = [
        { name: "Current Month", revenue: financialData.totalRevenue, expenses: financialData.totalExpenses }
    ];

    const pieChartData = [
        { name: "Revenue", value: financialData.totalRevenue },
        { name: "Expenses", value: financialData.totalExpenses },
        { name: "Net Profit", value: financialData.netProfit }
    ];

    // Available currencies
    const availableCurrencies = ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"];

    // Merge data with available currencies
    const feesData = availableCurrencies.map(currency => {
        const currencyData = feesStatics?.stats.find(stat => stat._id === currency);
        return {
            currency,
            totalAmount: currencyData ? currencyData.totalAmount : 0,
            totalFees: currencyData ? currencyData.totalFees : 0
        };
    });

    return (
        <AdminLayout>
            <MetaData title="Finance Dashboard" />
            <div className="flex flex-col h-screen p-6">
                {/* Top Section: Financial Summary and Fees by Currency */}
                <div className="flex flex-col md:flex-row ">

                    {/* Combined Box for Total Expenses, Net Profit, and Fees by Currency */}
                    <div className="w-full ">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {/* Total Revenue Box */}
                                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md text-center">
                                    <h4 className="text-sm font-bold">Total Revenue</h4>
                                    <p className="text-lg mt-2">${financialData.totalRevenue}</p>
                                </div>

                                {/* Total Expenses */}
                                <div className="bg-red-500 text-white p-4 rounded-lg shadow-md text-center">
                                    <h4 className="text-sm font-bold">Total Expenses</h4>
                                    <p className="text-lg mt-2">${financialData.totalExpenses}</p>
                                </div>

                                {/* Net Profit */}
                                <div className="bg-green-500 text-white p-4 rounded-lg shadow-md text-center">
                                    <h4 className="text-sm font-bold">Net Profit</h4>
                                    <p className="text-lg mt-2">${financialData.netProfit}</p>
                                </div>
                            </div>

                            {/* Fees by Currency */}
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Fees by Currency</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                                {feesData.map((fee, index) => (
                                    <div key={index} className="bg-gray-100 p-3 rounded-lg shadow-sm text-center">
                                        <h4 className="text-sm font-bold text-gray-800">{fee.currency}</h4>
                                        <p className="text-sm text-gray-600 mt-2">Amount: ${fee.totalAmount}</p>
                                        <p className="text-sm text-gray-600">Fees: {fee.totalFees}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="flex flex-col md:flex-row gap-6 mt-6 flex-grow">
                    {/* Bar Chart */}
                    <div className="bg-white shadow-md rounded-md p-4 w-full md:w-1/2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue vs Expenses</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
                                <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white shadow-md rounded-md p-4 w-full md:w-1/2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#2196F3" label />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FinanceDashboard;