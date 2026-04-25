import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: Date,
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Pre-save middleware: ensure only one current year exists
academicYearSchema.pre("save", async function (next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isCurrent: true },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

// ✅ Partial unique index (fallback safety)
academicYearSchema.index(
  { isCurrent: 1 },
  {
    unique: true,
    partialFilterExpression: { isCurrent: true },
  }
);

export default mongoose.model("AcademicYear", academicYearSchema);