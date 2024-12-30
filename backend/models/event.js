import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Please enter the name of the event"],
      maxLength: [200, "Event name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description for the event"],
      maxLength: [500, "Event description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: [true, "Please enter the date of the event"],
    },
    venue: {
      type: String,
      required: [true, "Please enter the venue of the event"],
      maxLength: [200, "Venue name cannot exceed 200 characters"],
    },
    image: {
      type: String, // URL or file path to the event image
      required: false,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false, // By default, events are unpaid
    },
    amount: {
      type: Number,
      required: function () {
        return this.isPaid; // Only required if the event is paid
      },
      min: [0, "Amount cannot be negative"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // Assuming a teacher organizes the event
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically handle createdAt and updatedAt
);

export default mongoose.model("Event", eventSchema);
