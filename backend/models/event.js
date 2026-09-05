import mongoose from "mongoose";

export const EVENT_CURRENCIES = ["USD", "CAD", "AUD", "EUR", "GBP", "TRY"];

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Please enter the name of the event"],
      maxLength: [200, "Event name cannot exceed 200 characters"],
      trim: true,
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
      trim: true,
    },
    // 👇 FIX: was a bare String (URL only) — switched to the same
    // { public_id, url } shape used by User.avatar, so the Cloudinary
    // image can actually be replaced/deleted later (delete_file needs
    // the public_id, which a plain URL string doesn't carry).
    image: {
      public_id: String,
      url: String,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    amount: {
      type: Number,
      required: function () {
        return this.isPaid;
      },
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      required: function () {
        return this.isPaid;
      },
      // 👇 FIX: was "GPB" (typo) — the frontend currency dropdown has
      // always said "GBP", so selecting British Pound failed model
      // validation every time. Corrected to "GBP".
      enum: EVENT_CURRENCIES,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
  },
  { timestamps: true }
);

eventSchema.index({ campus: 1, date: -1 });
eventSchema.index({ date: -1 });

export default mongoose.model("Event", eventSchema);
