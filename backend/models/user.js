// Models
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
      maxLength: [25, "First name cannot exceed 25 characters"],
    },
    middleName: {
      type: String,
      trim: true,
      maxLength: [25, "Middle name cannot exceed 25 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    // ---------- 👨‍👩‍👧 NEW PARENT NAME FIELDS ----------
    fatherName: {
      type: String,
      trim: true,
      maxLength: [50, "Father name cannot exceed 50 characters"],
      default: "",
    },
    motherName: {
      type: String,
      trim: true,
      maxLength: [50, "Mother name cannot exceed 50 characters"],
      default: "",
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },

    role: {
      type: String,
      enum: [
        "student",
        "teacher",
        "coordinator",
        "principle",
        "vice_principal",
        "finance",
        "admin",
        "registrar",
        "manager",
        "assistant",
        "librarian",
        "counselor",
        "it_support",
        "security",
        "maintenance",
        "superadmin",
        "parent",
        "receptionist",
        "transport_manager",
        "driver",
        "cleaner",
      ],
      default: "student",
    },

    // ---------- 🟢 APPLICATION ACCESS STATUS ----------
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
      required: true,
    },

    // ---------- 🔵 ORGANIZATIONAL LIFECYCLE STATUS ----------
    lifecycleStatus: {
      type: String,
      enum: [
        "pending",        // Admission applied but not approved
        "enrolled",       // Currently studying
        "unenrolled",     // Not currently enrolled
        "uncontracted",   // Contract not signed/renewed
        "contracted",     // Contract active
        "probation",      // Academic/disciplinary probation
        "suspended",      // Temporarily suspended
        "leave",          // Leave of absence
        "transferred",    // Transferred to another school
        "graduated",      // Successfully completed program
        "passout",        // (If you prefer this term instead of graduated)
        "alumni",         // Graduate and alumni
        "expelled",       // Permanently removed
        "withdrawn",      // Student voluntarily withdrew
        "dropped",        // Dropped out before completion
        "inactive",       // Temporarily inactive
        "deferred",       // Admission deferred
        "resigned",       // Left voluntarily (optional)
        "terminated",     // Enrollment terminated by institution
      ],
      default: "pending",
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Please enter date of birth"],
    },
    gender: {
      type: String,
      required: [true, "Please enter gender"],
      enum: ["male", "female", "other"],
    },
    nationality: {
      type: String,
      required: [true, "Please enter nationality"],
    },
    passportNumber: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxLength: [20, "Passport number cannot exceed 20 characters"],
    },
    nationalID: {
      type: String,
      trim: true,
      minlength: 11,
      maxlength: 20,
    },

    phoneNumber: {
      type: String,
      required: [true, "Please enter phone number"],
      maxLength: [13, "Phone number cannot exceed 13 digits"],
    },
    secondaryPhoneNumber: {
      type: String,
      maxLength: [13, "Secondary phone number cannot exceed 13 digits"],
    },
    address: {
      type: String,
      trim: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },
    currentContract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeContract",
      default: null,
    },

    // ---------- 🟣 CURRENT ACTIVE STUDENT ENROLLMENT ----------
    currentEnrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentEnrollment",
      default: null,
    },

    siblings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: async function (studentId) {
            const user = await mongoose.model("User").findById(studentId);
            return user && user.role === "student";
          },
          message: "Each sibling reference must point to a student",
        },
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ====================== INDEXES ======================
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ role: 1, lifecycleStatus: 1 });
userSchema.index({ campus: 1, role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

// Returns true if this user currently has employee-level access.
userSchema.methods.hasActiveEmployment = function () {
  return !!this.currentContract;
};

userSchema.statics.findExistingStudent = async function ({ email, nationalID }) {
  if (email) {
    const byEmail = await this.findOne({ email: email.toLowerCase(), role: "student" });
    if (byEmail) return byEmail;
  }
  if (nationalID && nationalID.trim().length >= 11) {
    const byNationalID = await this.findOne({ nationalID: nationalID.trim(), role: "student" });
    if (byNationalID) return byNationalID;
  }
  return null;
};

export default mongoose.model("User", userSchema);