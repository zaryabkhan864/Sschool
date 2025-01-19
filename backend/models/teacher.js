import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: [true, "Please enter teacher name"],
      maxLength: [200, "Teacher name cannot exceed 200 characters"],
    },
    age: {
      type: Number,
      required: [true, "Please enter age of teacher"],
      maxLength: [2, "Teacher age cannot exceed 2 digits"],
    },
    gender: {
      type: String,
      required: [true, "Please enter the gender of teacher"],
    },
    nationality: {
      type: String,
      required: [true, "Please enter the Nationality of teacher"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    teacherPhoneNumber: {
      type: Number,
      required: [true, "Please enter teacher number"],
      maxLength: [10, "Contact number should be 10 digits"],
    },
    teacherSecondPhoneNumber: {
      type: Number,
      required: [true, "Please enter the teacher whatsapp number"],
      maxLength: [10, "Contact number should be 10 digits"],
    },
    // expertise: [
    //   {
    //     type: String,
    //   },
    // ], // List of subjects they can teach
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: false }
);

export default mongoose.model("Teacher", teacherSchema);
