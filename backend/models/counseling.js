import mongoose from "mongoose";

const counselingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (studentId) {
            const user = await mongoose.model("User").findById(studentId);
            return user && user.role === "student";
        },
        message: "The referenced user must be a student."
    }
    },
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    complain: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Counseling", counselingSchema);
