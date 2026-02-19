import React from "react";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const counsellorStats = [
    { id: 1, label: "Total Sessions", value: 120 },
    { id: 2, label: "Resolved Cases", value: 85 },
    { id: 3, label: "Pending Cases", value: 35 },
    { id: 4, label: "Feedback Score", value: "4.5/5" },
];

const recentComplaints = [
    { id: 1, student: "Ali Khan", issue: "Bullying Incident", date: "Feb 2, 2025" },
    { id: 2, student: "Sara Ahmed", issue: "Exam Stress", date: "Feb 5, 2025" },
    { id: 3, student: "Ahmed Raza", issue: "Peer Pressure", date: "Feb 10, 2025" },
];

const barChartData = [
    { name: "Jan", cases: 20 },
    { name: "Feb", cases: 25 },
    { name: "Mar", cases: 30 },
    { name: "Apr", cases: 35 },
];

const pieChartData = [
    { name: "Academic Issues", value: 40 },
    { name: "Bullying", value: 30 },
    { name: "Mental Health", value: 20 },
    { name: "Family Issues", value: 10 },
];

const CounsellorDashboard = () => {
    return (
        <AdminLayout>
            <MetaData title="Counsellor Dashboard" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Counsellor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {counsellorStats.map((stat) => (
                        <div key={stat.id} className="bg-purple-500 text-white p-4 rounded-lg shadow-md text-center">
                            <h4 className="text-lg font-bold">{stat.label}</h4>
                            <p className="text-2xl mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Complaints */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Complaints</h2>
                    <div className="bg-white shadow-md rounded-md p-4">
                        <ul className="divide-y divide-gray-200">
                            {recentComplaints.map((complaint) => (
                                <li key={complaint.id} className="py-2 flex justify-between">
                                    <span>{complaint.student} - {complaint.issue}</span>
                                    <span className="text-gray-500">{complaint.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Case Statistics */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Cases Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cases" fill="#673AB7" name="Cases" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Issue Distribution */}
                <div className="bg-white shadow-md rounded-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Issue Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#FF9800" label />
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CounsellorDashboard;
