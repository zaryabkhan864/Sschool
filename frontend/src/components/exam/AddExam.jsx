// components/exam/AddExam.jsx
//
// ✅ REPLACED: same story as AddQuiz.jsx — the old fixed-10-question,
// semester/quarter schema and its "examId ?? 'new'" update pattern are
// gone. Forwarding to the new two-step flow instead of leaving a broken
// form. If nothing else links to this route, this file and its
// registration can be deleted; teacherRoutes.jsx already serves the new
// flow at /teacher/exam/new.
import React from "react";
import { Navigate } from "react-router-dom";

const AddExam = () => <Navigate to="/teacher/exam/new" replace />;

export default AddExam;
