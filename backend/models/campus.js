import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campus name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Campus code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Campus location is required"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      maxLength: [13, "Contact number cannot exceed 13 digits"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Campus", campusSchema);
