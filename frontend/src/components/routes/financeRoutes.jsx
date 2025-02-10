import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import FinanceDashboard from "../dashboard/FinanceDashboard";
import NewFees from "../finance/fees/NewFees";
import ListFees from "../finance/fees/ListFees";
import NewSalary from "../finance/salary/NewSalary";


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
            <Route
                path="/finance/students/fees"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <ListFees />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance/employee/salaries"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <NewSalary />
                    </ProtectedRoute>
                }
            />
        </>


    );
};

export default financeRoutes;
