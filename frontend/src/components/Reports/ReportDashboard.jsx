import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const reports = [
  { id: 1, name: "Quiz Report", path: "/reports/quiz" },
  { id: 2, name: "Exam Report", path: "/reports/exam" },
  { id: 3, name: "Fees Report", path: "/reports/fees" },
  { id: 4, name: "Teacher Leave Report", path: "/reports/teacher_leave" },
  { id: 5, name: "Student Consuelling Report", path: "/reports/student_consulling_report" },
  { id: 6, name: "Employee Salary Report", path: "/reports/employees_salary" },
  { id: 7, name: "Profit & Loss Report", path: "/reports/profit-loss" },
  { id: 8, name: "Tax Report", path: "/reports/tax" },
];

const ReportDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <MetaData title={t("All Reports")} />
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(report.path)}
              className="bg-blue-600 text-white text-center py-6 px-4 rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition"
            >
              <span className="text-lg font-medium">{t(report.name)}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportDashboard;
