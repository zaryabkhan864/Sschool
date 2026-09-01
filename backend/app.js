import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";           
import cron from "node-cron";                
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
const app = express();

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ EmployeeContract model import (path adjust karein agar zaroorat ho)
import EmployeeContract from "./models/employeeContract.js";

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

// ✅ Jab database connection ready ho jaaye, cron job start karein
mongoose.connection.once("open", () => {
  console.log("Database connected – Starting cron job for contract expiry.");

  // Har roz raat 12:00 baje chale
  cron.schedule("0 0 * * *", async () => {
    try {
      const expiredCount = await EmployeeContract.expireOverdueContracts();
      console.log(`Cron: ${expiredCount} contracts auto-expired`);
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });
});

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
import schoolRoutes from "./routes/school.js"
import announcementRoutes from "./routes/announcement.js";
import commentRoutes from "./routes/comment.js";
import feesRoutes from "./routes/fees.js";
import salariesRoutes from "./routes/salaries.js";
import auditRoutes from "./routes/audit.js";
import expense from "./routes/expenses.js";
import financeDashboardRoutes from "./routes/financeDashboard.js"; // 👈 NEW: dashboard recent-activity feed

import counselingRoutes from "./routes/counseling.js";
import courseRoutes from "./routes/course.js";
import eventRoutes from "./routes/event.js";
import examRoutes from "./routes/exam.js";
import attendanceRoutes from "./routes/attendance.js";
import gradeRoutes from "./routes/grade.js";
import quizRoutes from "./routes/quiz.js";
import teacherLeaveRoutes from "./routes/teacherLeave.js";
import fileRoutes from "./routes/file.js";
import campusRoutes from "./routes/campus.js";

/* 🔥 TIMETABLE MODULE ROUTES */
import academicLevelRoutes from "./routes/academicLevelRoutes.js";
import classGroupRoutes from "./routes/classGroupRoutes.js";
import weekDayRoutes from "./routes/weekDayRoutes.js";
import sessionTemplateRoutes from "./routes/sessionTemplateRoutes.js";
import daySessionConfigRoutes from "./routes/daySessionConfigRoutes.js";
import timeTableSlotRoutes from "./routes/timeTableSlotRoutes.js";

import academicYearRoutes from "./routes/academicYear.js";
import studentEnrollment from "./routes/studentEnrollment.js";
import employeeContract from "./routes/employeeContract.js";
import positionHistoryRoutes from "./routes/positionHistoryRoutes.js"
import scholarshipRoutes from './routes/scholarship.js'

import homeworkRoutes from './routes/homeworkRoutes.js'
// ✅ NEW — Project module (mirrors homeworkRoutes)
import projectRoutes from './routes/projectRoutes.js'

app.use("/api/v1", authRoutes);
app.use("/api/v1",schoolRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", gradeRoutes);
app.use("/api/v1", campusRoutes);

app.use("/api/v1", eventRoutes);
app.use("/api/v1", quizRoutes);
app.use("/api/v1", examRoutes);
app.use("/api/v1", attendanceRoutes);
app.use("/api/v1", counselingRoutes);
app.use("/api/v1", announcementRoutes);
app.use("/api/v1", commentRoutes);

// finances
app.use("/api/v1", feesRoutes);
app.use("/api/v1", salariesRoutes);
app.use("/api/v1", auditRoutes);
app.use("/api/v1", expense);
app.use("/api/v1", financeDashboardRoutes); 
app.use("/api/v1", teacherLeaveRoutes);
app.use("/api/v1", fileRoutes);

/* 🧠 TIMETABLE MODULE */
app.use("/api/v1", academicLevelRoutes);
app.use("/api/v1", classGroupRoutes);
app.use("/api/v1", weekDayRoutes);
app.use("/api/v1", sessionTemplateRoutes);
app.use("/api/v1", daySessionConfigRoutes);
app.use("/api/v1", timeTableSlotRoutes);
app.use("/api/v1", academicYearRoutes);
app.use("/api/v1", studentEnrollment);
app.use("/api/v1",scholarshipRoutes)
app.use("/api/v1", employeeContract);
app.use('/api/v1',positionHistoryRoutes)

app.use('/api/v1',homeworkRoutes)
// ✅ NEW — Project module
app.use('/api/v1',projectRoutes)

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

// Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});