import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";

import { authApi } from "./api/authApi";
import { counselingApi } from "./api/counselingApi";
import { courseApi } from "./api/courseApi";
import { eventApi } from "./api/eventApi";
import { examApi } from "./api/examApi";
import { gradeApi } from "./api/gradesApi";
import { postingApi } from "./api/postingApi";
import { feesApi } from "./api/feesApi";
import { salariesApi } from "./api/salaryApi";
import { expensesApi } from "./api/expensesApi";
import { quizApi } from "./api/quizApi";
import { studentApi } from "./api/studentsApi";
import { teacherApi } from "./api/teacherApi";
import { teacherLeaveApi } from "./api/teacherLeaveApi";

import { commentApi } from "./api/commentApi";
import { fileApi } from "./api/fileApi";
import { revenueApi } from "./api/revenueApi";
import { auditApi } from "./api/auditApi";
import { attendanceApi } from "./api/attendanceApi";
import { campusApi } from "./api/campusApi";
import { financeDashboardApi } from "./api/financeDashboardApi"; // 👈 NEW



import { academicLevelApi } from "./api/academicLevelApi";
import { classGroupApi } from "./api/classGroupApi";
import { weekDayApi } from "./api/weekDayApi";
import { sessionTemplateApi } from "./api/sessionTemplateApi";
import { daySessionConfigApi } from "./api/daySessionConfigApi";
import { timeTableSlotApi } from "./api/timeTableSlotApi";

import { academicYearApi } from "./api/academicYearApi"
import { studentEnrollmentApi } from "./api/studentEnrollment";
import { employeeContractApi } from "./api/employeeContractApi";
import { scholarshipApi } from "./api/scholarshipApi";
import { schoolApi } from "./api/schoolApi";

import { homeworkApi } from "./api/homeworkApi";
import { projectApi } from "./api/projectApi"; // ✅ NEW

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [schoolApi.reducerPath]: schoolApi.reducer,
    [feesApi.reducerPath]: feesApi.reducer,
    [salariesApi.reducerPath]: salariesApi.reducer,
    [scholarshipApi.reducerPath]: scholarshipApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [counselingApi.reducerPath]: counselingApi.reducer,
    [postingApi.reducerPath]: postingApi.reducer,
    [teacherLeaveApi.reducerPath]: teacherLeaveApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
    [campusApi.reducerPath]: campusApi.reducer,
    [financeDashboardApi.reducerPath]: financeDashboardApi.reducer, // 👈 NEW


    // 🔥 Timetable system reducers
    [academicLevelApi.reducerPath]: academicLevelApi.reducer,
    [classGroupApi.reducerPath]: classGroupApi.reducer,
    [weekDayApi.reducerPath]: weekDayApi.reducer,
    [sessionTemplateApi.reducerPath]: sessionTemplateApi.reducer,
    [daySessionConfigApi.reducerPath]: daySessionConfigApi.reducer,
    [timeTableSlotApi.reducerPath]: timeTableSlotApi.reducer,
    [academicYearApi.reducerPath]: academicYearApi.reducer,
    [studentEnrollmentApi.reducerPath]: studentEnrollmentApi.reducer,
    [employeeContractApi.reducerPath]: employeeContractApi.reducer,
    [homeworkApi.reducerPath]:homeworkApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer, // ✅ NEW
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      schoolApi.middleware,
      feesApi.middleware,
      salariesApi.middleware,
      scholarshipApi.middleware,
      expensesApi.middleware,
      revenueApi.middleware,
      quizApi.middleware,
      examApi.middleware,
      attendanceApi.middleware,
      studentApi.middleware,
      gradeApi.middleware,
      courseApi.middleware,
      teacherApi.middleware,
      eventApi.middleware,
      authApi.middleware,
      counselingApi.middleware,
      postingApi.middleware,
      teacherLeaveApi.middleware,
      commentApi.middleware,
      fileApi.middleware,
      campusApi.middleware,
      financeDashboardApi.middleware, // 👈 NEW

      // 🔥 Timetable system middleware
      academicLevelApi.middleware,
      classGroupApi.middleware,
      weekDayApi.middleware,
      sessionTemplateApi.middleware,
      daySessionConfigApi.middleware,
      timeTableSlotApi.middleware,
      academicYearApi.middleware,
      studentEnrollmentApi.middleware,
      employeeContractApi.middleware,
      homeworkApi.middleware,
      projectApi.middleware, // ✅ NEW
    ]),
});