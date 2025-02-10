import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        employeeName: {
            type: String,
            required: [true, "Please enter employee name"],
            maxLength: [200, "Employee name cannot exceed 200 characters"],
        },
        age: {
            type: Number,
            required: [true, "Please enter age of employee"],
            maxLength: [2, "Employee age cannot exceed 2 digits"],
        },
        gender: {
            type: String,
            required: [true, "Please enter the gender of employee"],
        },
        nationality: {
            type: String,
            required: [true, "Please enter the Nationality of employee"],
        },
        avatar: {
            public_id: String,
            url: String,
        },
        employeePhoneNumber: {
            type: Number,
            required: [true, "Please enter employee number"],
            maxLength: [10, "Contact number should be 10 digits"],
        },
        employeeSecondPhoneNumber: {
            type: Number,
            required: [true, "Please enter the employee whatsapp number"],
            maxLength: [10, "Contact number should be 10 digits"],
        },
        designation: {
            type: String,
            required: [true, "Please enter the designation of employee"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    { timestamps: false }
);

export default mongoose.model("Employee", employeeSchema);
