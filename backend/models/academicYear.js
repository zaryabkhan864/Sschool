import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Academic year name is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Academic year start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Academic year end date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "Academic year must be linked to a campus"],
    },
  },
  { timestamps: true }
);

// One academic year name per campus
academicYearSchema.index({ campus: 1, name: 1 }, { unique: true });

// Only one current year per campus at a time
academicYearSchema.index(
  { campus: 1, isCurrent: 1 },
  {
    unique: true,
    partialFilterExpression: { isCurrent: true },
  }
);

// Pre-save: unset other current years in the same campus
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

export default mongoose.model("AcademicYear", academicYearSchema);
