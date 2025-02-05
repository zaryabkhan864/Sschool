import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import StudentDashboard from "../dashboard/StudentDashboard";


const financeRoutes = () => {
    return (
        <>
            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute student={true}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />

        </>

    );
};

export default financeRoutes;
