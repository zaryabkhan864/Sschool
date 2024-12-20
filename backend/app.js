import express from "express";
const app = express();

//Middleware to handle JSON payload
app.use(express.json());

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "backend/config/config.env" });
}

// Connecting to database
connectDatabase();

// environment variables callings
dotenv.config({ path: "backend/config/config.env" });

// using cookie parser
app.use(cookieParser());
app.use(express.json());
// import all routes here
import courseRoutes from "./routes/course.js";
import auth from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import teacherRoutes from "./routes/teachers.js";
import gradeRoutes from "./routes/grade.js";

// calling routes here
app.use("/api/v1", courseRoutes);
app.use("/api/v1", auth);
app.use("/api/v1", studentRoutes);
app.use("/api/v1", gradeRoutes);
app.use("/api/v1", teacherRoutes);
// Using error middleware
app.use(errorMiddleware);

// server running function
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

//Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
