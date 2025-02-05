import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const financeStats = [
    { id: 1, label: "Revenue", amount: 50000 },
    { id: 2, label: "Expenses", amount: 20000 },
    { id: 3, label: "Profit", amount: 30000 },
    { id: 4, label: "Investments", amount: 15000 },
];

const transactions = [
    { id: 1, description: "Client Payment", amount: 5000 },
    { id: 2, description: "Office Rent", amount: -2000 },
    { id: 3, description: "Software Purchase", amount: -1500 },
    { id: 4, description: "New Investment", amount: 3000 },
];

const barChartData = [
    { name: "Jan", revenue: 4000, expenses: 2000 },
    { name: "Feb", revenue: 5000, expenses: 2500 },
    { name: "Mar", revenue: 7000, expenses: 3000 },
    { name: "Apr", revenue: 6000, expenses: 3500 },
];

const pieChartData = [
    { name: "Revenue", value: 50000 },
    { name: "Expenses", value: 20000 },
    { name: "Profit", value: 30000 },
];

const FinanceDashboard = () => {
    return (
        <AdminLayout>
            <MetaData title="Finance Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {financeStats.map((stat) => (
                        <div key={stat.id} className="bg-blue-500 text-white p-4 rounded-lg shadow-md text-center">
                            <h4 className="text-lg font-bold">{stat.label}</h4>
                            <p className="text-2xl mt-2">${stat.amount}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
                    <div className="bg-white shadow-md rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                            {transactions.map((txn) => (
                                <li key={txn.id} className="py-2 flex justify-between">
                                    <span>{txn.description}</span>
                                    <span className={`font-bold ${txn.amount < 0 ? "text-red-500" : "text-green-500"}`}>${txn.amount}</span>
                                </li>
                            ))}
                        </ul>
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