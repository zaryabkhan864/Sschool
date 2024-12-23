import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";

import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { studentApi } from "./api/studentsApi";
import { gradeApi } from "./api/gradesApi";

export const store = configureStore({
  reducer: {
    auth: userReducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [gradeApi.reducerPath]: gradeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      studentApi.middleware,
      gradeApi.middleware,
      authApi.middleware,
      userApi.middleware,
    ]),
});
