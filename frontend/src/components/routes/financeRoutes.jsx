import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import FinanceDashboard from "../dashboard/FinanceDashboard";
import NewFees from "../finance/fees/NewFees";
import ListFees from "../finance/fees/ListFees";
import NewSalary from "../finance/salary/NewSalary";
import ListSalaries from "../finance/salary/ListSalaries";
import NewExpenses from "../finance/expenses/NewExpenses";
import ListExpenses from "../finance/expenses/ListExpenses";


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
      
            <Route
                path="/finance/employees/salaries"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <ListSalaries />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance/expenses"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <NewExpenses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/finance/expense/List"
                element={
                    <ProtectedRoute finance={true} admin={true}>
                        <ListExpenses />
                    </ProtectedRoute>
                }
            />
        </>


    );
};

export default financeRoutes;
