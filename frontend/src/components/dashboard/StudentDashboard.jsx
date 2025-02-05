import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const studentStats = [
    { id: 1, label: "Completed Courses", value: 5 },
    { id: 2, label: "Pending Assignments", value: 3 },
    { id: 3, label: "Attendance", value: "85%" },
    { id: 4, label: "Overall Score", value: "90%" },
];

const recentActivities = [
    { id: 1, description: "Submitted Math Assignment", date: "Feb 2, 2025" },
    { id: 2, description: "Joined Science Workshop", date: "Feb 5, 2025" },
    { id: 3, description: "Completed React Course", date: "Feb 10, 2025" },
];

const barChartData = [
    { name: "Jan", score: 75 },
    { name: "Feb", score: 80 },
    { name: "Mar", score: 85 },
    { name: "Apr", score: 90 },
];

const pieChartData = [
    { name: "Math", value: 30 },
    { name: "Science", value: 25 },
    { name: "English", value: 20 },
    { name: "History", value: 25 },
];

const StudentDashboard = () => {
    return (
        <AdminLayout>
            <MetaData title="Student Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Student Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {studentStats.map((stat) => (
                        <div key={stat.id} className="bg-green-500 text-white p-4 rounded-lg shadow-md text-center">
                            <h4 className="text-lg font-bold">{stat.label}</h4>
                            <p className="text-2xl mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Activities */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
                    <div className="bg-white shadow-md rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                            {recentActivities.map((activity) => (
                                <li key={activity.id} className="py-2 flex justify-between">
                                    <span>{activity.description}</span>
                                    <span className="text-gray-500">{activity.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Performance Chart */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="score" fill="#4CAF50" name="Score" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Distribution */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Subject Wise Distribution</h2>
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

export default StudentDashboard;