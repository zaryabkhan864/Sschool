import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add a virtual field to the Announcement schema to fetch comments
announcementSchema.virtual('comments', {
  ref: 'Comment', // The model to use
  localField: '_id', // Field in the Announcement model
  foreignField: 'announcementId', // Field in the Comment model
});

// Enable virtuals to be included in JSON responses
announcementSchema.set('toJSON', { virtuals: true });
announcementSchema.set('toObject', { virtuals: true });

export default mongoose.model("Announcement", announcementSchema);
