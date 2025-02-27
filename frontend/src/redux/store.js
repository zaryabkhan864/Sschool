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
import { userApi } from "./api/userApi";
import { commentApi } from "./api/commentApi";
import { fileApi } from "./api/fileApi";
import { revenueApi } from "./api/revenueApi";
import { attendanceApi } from "./api/attendanceApi";


export const store = configureStore({
  reducer: {
    auth: userReducer,
    [feesApi.reducerPath]: feesApi.reducer,
    [salariesApi.reducerPath]: salariesApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [counselingApi.reducerPath]: counselingApi.reducer,
    [postingApi.reducerPath]: postingApi.reducer,
    [teacherLeaveApi.reducerPath]: teacherLeaveApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      feesApi.middleware,
      salariesApi.middleware,
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
      userApi.middleware,
      counselingApi.middleware,
      postingApi.middleware,
      teacherLeaveApi.middleware,
      commentApi.middleware,
      fileApi.middleware,
    ]),
});
