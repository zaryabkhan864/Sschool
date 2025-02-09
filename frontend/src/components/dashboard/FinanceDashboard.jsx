import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useGetRevenueVsExpensesQuery } from "../../redux/api/revenueApi";

const FinanceDashboard = () => {
    const { data, isLoading, error } = useGetRevenueVsExpensesQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data.</p>;

    const financialData = data?.data[0] || {};

    const barChartData = [
        { name: "Current Month", revenue: financialData.totalRevenue, expenses: financialData.totalExpenses }
    ];

    const pieChartData = [
        { name: "Revenue", value: financialData.totalRevenue },
        { name: "Expenses", value: financialData.totalExpenses },
        { name: "Net Profit", value: financialData.netProfit }
    ];

    return (
        <AdminLayout>
            <MetaData title="Finance Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md text-center">
                        <h4 className="text-lg font-bold">Total Revenue</h4>
                        <p className="text-2xl mt-2">${financialData.totalRevenue}</p>
                    </div>
                    <div className="bg-red-500 text-white p-4 rounded-lg shadow-md text-center">
                        <h4 className="text-lg font-bold">Total Expenses</h4>
                        <p className="text-2xl mt-2">${financialData.totalExpenses}</p>
                    </div>
                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-md text-center">
                        <h4 className="text-lg font-bold">Net Profit</h4>
                        <p className="text-2xl mt-2">${financialData.netProfit}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Bar Chart */}
                <div className="bg-white shadow-md rounded-md p-4">
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
                <div className="bg-white shadow-md rounded-md p-4">
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
        </AdminLayout>
    );
};

export default FinanceDashboard;
