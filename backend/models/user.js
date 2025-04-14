import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [50, "Your name cannot exceed 50 characters"],
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    age: {
      type: Number,
      required: [true, "Please enter age of student"],
      maxLength: [2, "Student age cannot exceed 2 digits"],
    },
    gender: {
      type: String,
      required: [true, "Please enter the gender"],
    },
    nationality: {
      type: String,
      required: [true, "Please enter the nationality of student"],
    },
    passportNumber: {
      type: String,
      required: [false, "Please enter the passport number of student"],
      maxLength: [14, "Passport number cannot exceed 14 digits"],
    },
    siblings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referencing other students
        validate: {
          validator: async function (studentId) {
              const user = await mongoose.model("User").findById(studentId);
              return user && user.role === "student";
          },
          message: "The referenced user must be a student."
      }
      },
    ],
    phoneNumber: {
      type: Number,
      required: [true, "Please enter the phone number"],
      maxLength: [10, "Contact number should be 10 digits"],
    },
    secondaryPhoneNumber: {
      type: Number,
      required: [true, "Please enter the phone number"],
      maxLength: [10, "Contact number should be 10 digits"],
    },
    address: {
      type: String,
    },
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: false,
    },
    grade: [
      {
        gradeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Grade'
        },
        yearFrom: {
          type: Number,
        },
        yearTo: {
          type: Number,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypting password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Gernerate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);
