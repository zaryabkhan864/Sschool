import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";

import { authApi } from "./api/authApi";
import { counselingApi } from "./api/counselingApi";
import { courseApi } from "./api/courseApi";
import { eventApi } from "./api/eventApi";
import { gradeApi } from "./api/gradesApi";
import { quizApi } from "./api/quizApi";
import { studentApi } from "./api/studentsApi";
import { teacherApi } from "./api/teacherApi";
import { userApi } from "./api/userApi";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [counselingApi.reducerPath]: counselingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      quizApi.middleware,
      studentApi.middleware,
      gradeApi.middleware,
      courseApi.middleware,
      teacherApi.middleware,
      eventApi.middleware,
      authApi.middleware,
      userApi.middleware,
      counselingApi.middleware,
    ]),
});
