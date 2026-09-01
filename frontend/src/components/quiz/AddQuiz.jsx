// components/quiz/AddQuiz.jsx
//
// ✅ REPLACED: this used to be a standalone form built against the old
// Quiz schema (fixed 5 questions, semester/quarter fields, cookie
// parsing on the frontend). That schema is gone — quizzes now have a
// teacher-configurable number of questions, and campus/academicYear are
// resolved on the backend from cookies, not read here.
//
// Rather than leave a half-working form, this now just forwards to the
// new two-step flow: NewOrFetchQuiz (pick class/course/quiz number) ->
// QuizMarksEditor (fill in marks). If nothing else in the app still
// links to /admin/quiz/new, this file — and the route pointing to it —
// can be deleted; teacherRoutes.jsx already registers the new flow at
// /teacher/quiz/new.
import React from "react";
import { Navigate } from "react-router-dom";

const AddQuiz = () => <Navigate to="/teacher/quiz/new" replace />;

export default AddQuiz;
