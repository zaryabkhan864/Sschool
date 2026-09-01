import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import StudentDashboard from "../dashboard/StudentDashboard";

// ✅ NEW — Homework & Assignment (student side)
import ListHomeworkStudent from "../homework/ListHomeworkStudent";
import HomeworkDetailsStudent from "../homework/HomeworkDetailsStudent";

// ✅ NEW — Project (student side)
import ListProjectsStudent from "../project/ListProjectsStudent";
import ProjectDetailsStudent from "../project/ProjectDetailsStudent";

// NOTE: kept the existing export/function name (financeRoutes) as-is so
// nothing importing it elsewhere breaks — this file actually holds the
// student routes, not finance ones.
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

            {/* ✅ NEW — Homework & Assignment routes */}
            {/* ✅ admin={true} added — admin can access every student-side
                module below except the dashboard itself, same pattern as
                financeRoutes.jsx (e.g. <ProtectedRoute finance={true} admin={true}>) */}
            <Route
                path="/student/homework"
                element={
                    <ProtectedRoute student={true} admin={true}>
                        <ListHomeworkStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/homework/:id"
                element={
                    <ProtectedRoute student={true} admin={true}>
                        <HomeworkDetailsStudent />
                    </ProtectedRoute>
                }
            />

            {/* ✅ NEW — Project routes (these were missing before — this is
                why /student/projects wasn't working) */}
            <Route
                path="/student/projects"
                element={
                    <ProtectedRoute student={true} admin={true}>
                        <ListProjectsStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/projects/:id"
                element={
                    <ProtectedRoute student={true} admin={true}>
                        <ProjectDetailsStudent />
                    </ProtectedRoute>
                }
            />

        </>

    );
};

export default financeRoutes;