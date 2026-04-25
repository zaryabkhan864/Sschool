import mongoose from "mongoose";

const studentEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: true,
    },

    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },

    // ✅ Duration tracking
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null, // null = active
    },

    status: {
      type: String,
      enum: ["active", "transferred", "completed", "left"],
      default: "active",
    },

    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


// 🔥 INDEXES

// Fast queries
studentEnrollmentSchema.index({ student: 1 });
studentEnrollmentSchema.index({ campus: 1 });
studentEnrollmentSchema.index({ academicYear: 1 });

// Sorting + history
studentEnrollmentSchema.index({
  student: 1,
  academicYear: 1,
  startDate: 1,
});


// ❗ IMPORTANT VALIDATION: No overlapping enrollments

studentEnrollmentSchema.pre("save", async function (next) {
  try {
    const Enrollment = mongoose.model("StudentEnrollment");

    // If endDate is null, treat as ongoing
    const thisEndDate = this.endDate || new Date("9999-12-31");

    const overlapping = await Enrollment.findOne({
      student: this.student,
      academicYear: this.academicYear,
      _id: { $ne: this._id },

      $or: [
        {
          startDate: { $lte: thisEndDate },
          endDate: { $gte: this.startDate },
        },
        {
          startDate: { $lte: thisEndDate },
          endDate: null,
        },
      ],
    });

    if (overlapping) {
      return next(
        new Error(
          "Student already has an overlapping enrollment in this academic year."
        )
      );
    }

    // ✅ Ensure active record has no endDate
    if (this.status === "active" && this.endDate !== null) {
      return next(
        new Error("Active enrollment cannot have an endDate.")
      );
    }

    // ✅ If transferred/completed/left → must have endDate
    if (
      ["transferred", "completed", "left"].includes(this.status) &&
      !this.endDate
    ) {
      return next(
        new Error(
          "Non-active enrollment must have an endDate."
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});


// 🔥 STATIC METHOD: Transfer Student

studentEnrollmentSchema.statics.transferStudent = async function ({
  studentId,
  newCampusId,
  newClassGroupId,
  academicYearId,
  transferDate,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Enrollment = this;

    // 1️⃣ Find current active enrollment
    const current = await Enrollment.findOne({
      student: studentId,
      academicYear: academicYearId,
      status: "active",
    }).session(session);

    if (!current) {
      throw new Error("No active enrollment found to transfer.");
    }

    // 2️⃣ Close old enrollment
    current.endDate = transferDate;
    current.status = "transferred";
    current.transferredTo = newCampusId;

    await current.save({ session });

    // 3️⃣ Create new enrollment
    const newEnrollment = await Enrollment.create(
      [
        {
          student: studentId,
          academicYear: academicYearId,
          campus: newCampusId,
          classGroup: newClassGroupId,
          startDate: new Date(
            new Date(transferDate).getTime() + 86400000 // next day
          ),
          status: "active",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return newEnrollment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


// 🔥 STATIC METHOD: Get Active Enrollment

studentEnrollmentSchema.statics.getActiveEnrollment = function (studentId) {
  return this.findOne({
    student: studentId,
    status: "active",
  });
};


// 🔥 STATIC METHOD: Get Full Year History

studentEnrollmentSchema.statics.getYearHistory = function (
  studentId,
  academicYearId
) {
  return this.find({
    student: studentId,
    academicYear: academicYearId,
  }).sort({ startDate: 1 });
};


export default mongoose.model(
  "StudentEnrollment",
  studentEnrollmentSchema
);