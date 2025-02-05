import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import FinanceDashboard from "../dashboard/FinanceDashboard";
import NewFees from "../finance/fees/NewFees";


const financeRoutes = () => {
    return (
        <>
            <Route
                path="/finance/dashboard"
                element={
                    <ProtectedRoute finance={true}>
                        <FinanceDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance/student/fees"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <NewFees />
                    </ProtectedRoute>
                }
            />
        </>

    );
};

export default financeRoutes;
