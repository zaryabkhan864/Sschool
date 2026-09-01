import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import CounsellorDashboard from "../dashboard/CounsellorDashboard";

const financeRoutes = () => {
    return (
        <>
            <Route
                path="/counselor/dashboard"
                element={
                    <ProtectedRoute counselor={true}>
                        <CounsellorDashboard/>
                    </ProtectedRoute>
                }
            />
        </>

    );
};

export default financeRoutes;
