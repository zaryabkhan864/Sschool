import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: Date,
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Compound unique index for name per campus
academicYearSchema.index({ campus: 1, name: 1 }, { unique: true });

// ✅ Partial unique index: only one current year per campus
academicYearSchema.index(
  { campus: 1, isCurrent: 1 },
  {
    unique: true,
    partialFilterExpression: { isCurrent: true },
  }
);

// ✅ Pre-save hook: unset other current years within the same campus
academicYearSchema.pre("save", async function (next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      {
        _id: { $ne: this._id },
        campus: this.campus,
        isCurrent: true,
      },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);
export default AcademicYear;