import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import FinanceDashboard from "../dashboard/FinanceDashboard";
import NewSalary from "../finance/salary/NewSalary";
import ListSalaries from "../finance/salary/ListSalaries";
import NewExpenses from "../finance/expenses/NewExpenses";
import ListExpenses from "../finance/expenses/ListExpenses";
import PaymentFees from "../finance/fees/PaymentFees";
import PaidFeesList from "../finance/fees/PaidFeesList";
import PaidFeesOrDueList from "../finance/fees/PaidFeesOrDueList";
import PaidFeesStudentDetails from "../finance/fees/PaidFeesStudentDetails";

// 👇 NEW: the fees-collection module built alongside the finance dashboard
import ListFees from "../finance/fees/ListFees";
import ListDues from "../finance/fees/ListDues";
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
      {/* ============== NEW: Fees Payment System ============== */}
      {/* Step 1: enrolled students who still owe fee installments */}

      {/* Step 2: collect a physical/parent payment and record it.
          Optional query params: ?studentId=... and/or &feeId=... */}
      <Route
        path="/admin/finance/fees/payment"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <PaymentFees />
          </ProtectedRoute>
        }
      />
      {/* Step 3: payment history — one row per student */}
      <Route
        path="/admin/finance/fees/paid"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <PaidFeesList />
          </ProtectedRoute>
        }
      />
      {/* Drill-down: one student's full paid/receipt history */}
      <Route
        path="/admin/finance/fees/paid/:studentId"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <PaidFeesStudentDetails />
          </ProtectedRoute>
        }
      />
      {/* Upcoming dues: Monthly/Quarterly/Half Yearly/Annually installments
          coming due within the next 10 days */}
      <Route
        path="/admin/finance/fees/due"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <PaidFeesOrDueList />
          </ProtectedRoute>
        }
      />

      {/* ============== NEW: Fees Collection module ============== */}
      {/* Student-wise pending dues list (one row per student who owes something) */}
      <Route
        path="/finance/students/fees"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <ListFees />
          </ProtectedRoute>
        }
      />
      {/* Front-desk payment collection screen — walk-in student/parent search,
          or arrives pre-filled via ?studentId=... from ListFees/ListDues */}

      {/* Enrolled students whose dues are fully clear */}
      <Route
        path="/finance/students/fees/dues-cleared"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <ListDues />
          </ProtectedRoute>
        }
      />
      {/* Ad-hoc one-off fee entry (fines, uniform charges, manual corrections —
          not the normal enrollment feePlan flow) */}
      <Route
        path="/finance/fees/new"
        element={
          <ProtectedRoute admin={true} finance={true}>
            <NewFees />
          </ProtectedRoute>
        }
      />
        </>


    );
};

export default financeRoutes;
