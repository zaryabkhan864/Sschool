import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import ReportDashboard from "../Reports/ReportDashboard";
import QuizReport from "../Reports/Quiz/QuizReport";
import ExamReport from "../Reports/Exam/ExamReport";

const reportsRoutes = () => {
    return (
        <>
            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute admin={true}>
                        <ReportDashboard/>
                    </ProtectedRoute>
                }
            />
                 <Route
                path="/reports/quiz"
                element={
                    <ProtectedRoute admin={true}>
                        <QuizReport/>
                    </ProtectedRoute>
                }
            />
                             <Route
                path="/reports/exam"
                element={
                    <ProtectedRoute admin={true}>
                        <ExamReport/>
                    </ProtectedRoute>
                }
            />
        </>

    );
};

export default reportsRoutes;
