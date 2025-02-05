import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const principalStats = [
    { id: 1, label: "Total Students", value: 1200 },
    { id: 2, label: "Total Teachers", value: 80 },
    { id: 3, label: "Pending Complaints", value: 5 },
    { id: 4, label: "Overall Attendance", value: "92%" },
];

const recentNotices = [
    { id: 1, title: "Annual Sports Day", date: "Feb 15, 2025" },
    { id: 2, title: "Parent-Teacher Meeting", date: "Feb 20, 2025" },
    { id: 3, title: "Exam Schedule Released", date: "Feb 25, 2025" },
];

const barChartData = [
    { name: "Jan", students: 1150 },
    { name: "Feb", students: 1180 },
    { name: "Mar", students: 1200 },
    { name: "Apr", students: 1220 },
];

const pieChartData = [
    { name: "Primary", value: 400 },
    { name: "Middle", value: 500 },
    { name: "High School", value: 300 },
];

const PrincipalDashboard = () => {
    return (
        <AdminLayout>
            <MetaData title="Principal Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Principal Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {principalStats.map((stat) => (
                        <div key={stat.id} className="bg-indigo-500 text-white p-4 rounded-lg shadow-md text-center">
                            <h4 className="text-lg font-bold">{stat.label}</h4>
                            <p className="text-2xl mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Notices */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Notices</h2>
                    <div className="bg-white shadow-md rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                            {recentNotices.map((notice) => (
                                <li key={notice.id} className="py-2 flex justify-between">
                                    <span>{notice.title}</span>
                                    <span className="text-gray-500">{notice.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Student Enrollment Chart */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Student Enrollment Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="students" fill="#4CAF50" name="Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Student Distribution */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Student Distribution by Level</h2>
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

export default PrincipalDashboard;
