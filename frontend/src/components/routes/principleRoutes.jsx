import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import PrincipleDashboard from "../dashboard/PrincipleDashboard";

const financeRoutes = () => {
    return (
        <>
            <Route
                path="/principle/dashboard"
                element={
                    <ProtectedRoute principle={true}>
                        <PrincipleDashboard />
                    </ProtectedRoute>
                }
            />
        </>

    );
};

export default financeRoutes;
