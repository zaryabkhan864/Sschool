import mongoose from "mongoose";
import Teacher from "./teacher.js";
import Grade from "./grade.js";

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "please enter course name"],
      maxLength: [200, "Course name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter description of course"],
      maxLength: [200, "Course description cannot exceed 200 characters"],
    },
    code: {
      type: String,
      required: [true, "Please enter the code of course"],
    },
    year: {
      type: Number,
      required: [true, "Please enter the year of course offer"],
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    }, // Associated grade
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    }, //Assigned teacher
  },
  { timestamps: false }
);

//middlewares to add course to grade and teacher
courseSchema.post("save", async function (doc, text) {
  try {
    //add course to courses array inside grade
    await Grade.findByIdAndUpdate(
      doc.grade,
      { $addToSet: { courses: doc._id } },
      { new: true }
    );
    //add course to assignedCourses array inside teacher
    await Teacher.findByIdAndUpdate(
      doc.teacher,
      { $addToSet: { assignedCourses: doc._id } },
      { new: true }
    );
    next();
  } catch (error) {
    console.error("Error updating Grade and Teacher", error.message);
    next(error);
  }
});

//middleware to delete course from assignedcourses in Teachers and courses in Grade
courseSchema.pre("findOneAndDelete", async function (next) {
  const courseId = this.getQuery()._id;
  //find  all teachers that has this course
  await Teacher.updateMany(
    { assignedCourses: courseId },
    { $pull: { assignedCourses: courseId } }
  );
  await grade.updateMany(
    { courses: courseId },
    { $pull: { courses: courseId } }
  );
  next();
});
export default mongoose.model("Course", courseSchema);
