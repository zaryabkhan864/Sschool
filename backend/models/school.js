import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter school name"],
      trim: true,
    },
    logo: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("School", schoolSchema);
