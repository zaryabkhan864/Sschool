import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
const app = express();

import path from "path";
// import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());
// Cache Control Middleware
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Import all routes

import authRoutes from "./routes/auth.js";

import announcementRoutes from "./routes/announcement.js";
import commentRoutes from "./routes/comment.js";
import feesRoutes from "./routes/fees.js";
import salariesRoutes from "./routes/salaries.js";
import expense from "./routes/expenses.js";

import counselingRoutes from "./routes/counseling.js";
import courseRoutes from "./routes/course.js";
import eventRoutes from "./routes/event.js";
import examRoutes from "./routes/exam.js";
import attendanceRoutes from "./routes/attendance.js"
import gradeRoutes from "./routes/grade.js";
import quizRoutes from "./routes/quiz.js";
import studentRoutes from "./routes/students.js";
import teacherLeaveRoutes from "./routes/teacherLeave.js";
import teacherRoutes from "./routes/teachers.js";
import attendanceRoute from "./routes/attendance.js"
import fileRoutes from "./routes/file.js";

import { fileURLToPath } from "url";

app.use("/api/v1", courseRoutes);
app.use("/api/v1", studentRoutes);
app.use("/api/v1", teacherRoutes);
app.use("/api/v1", gradeRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", eventRoutes);
app.use("/api/v1", quizRoutes);
app.use("/api/v1", examRoutes);
app.use("/api/v1",attendanceRoutes);
app.use("/api/v1", counselingRoutes);
app.use("/api/v1", announcementRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1",attendanceRoute)
// finances routes
app.use("/api/v1", feesRoutes);
app.use("/api/v1", salariesRoutes);
app.use("/api/v1", expense);
app.use("/api/v1", teacherLeaveRoutes);
app.use("/api/v1", fileRoutes);

if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}

// Using error middleware
app.use(errorMiddleware);

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
