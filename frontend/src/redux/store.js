import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";

import { authApi } from "./api/authApi";
import { courseApi } from "./api/courseApi";
import { gradeApi } from "./api/gradesApi";
import { studentApi } from "./api/studentsApi";
import { userApi } from "./api/userApi";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      studentApi.middleware,
      gradeApi.middleware,
      courseApi.middleware,
      authApi.middleware,
      userApi.middleware,
    ]),
});
