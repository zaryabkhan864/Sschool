import mongoose from "mongoose";

const TeacherLeaveSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (teacherId) {
          const user = await mongoose.model("User").findById(teacherId);
          return user && user.role === "teacher";
        },
        message: "The referenced user must be a teacher.",
      },
    },
    leaveType: {
      type: String,
      enum: ["Full Day", "Half Day"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Only needed for full day leaves
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (userId) {
          if (!userId) return true; // If not yet approved, skip validation
          const user = await mongoose.model("User").findById(userId);
          return user && (user.role === "admin" || user.role === "principle");
        },
        message: "Only admin or principle can approve leave.",
      },
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    // 👇 FIX: was `type: Number`, but every caller (newTeacherLeave,
    // updateTeacherLeave, getTeachersLeave, getLeaveBalanceForTeacher) was
    // already passing it `req.cookies.academicYear` — an AcademicYear
    // ObjectId string, not a plain number — so every create/query threw
    // "Cast to Number failed". Changed to match the same
    // `academicYear: ObjectId ref AcademicYear` pattern used by Course,
    // SessionTemplate, Announcement, and StudentEnrollment elsewhere in
    // this codebase.
    year: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic year is required"],
    },
  },
  { timestamps: false }
);

export default mongoose.model("TeacherLeave", TeacherLeaveSchema);