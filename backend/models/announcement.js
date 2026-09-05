import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    // 👇 NEW: was missing entirely — announcements weren't scoped by
    // academic year at all before, only by campus.
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    // 👇 CHANGED: was `gradeId` (required, tied to Grade, and never
    // actually populated by createAnnouncement — every post would have
    // failed schema validation). Replaced with `classGroup` (optional,
    // tied to ClassGroup — the actual day-to-day unit students and
    // teachers belong to). Left null/absent means "posted to the whole
    // school/campus" — the second posting mode you asked for.
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      default: null,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ campus: 1, academicYear: 1, classGroup: 1, createdAt: -1 });

// Add a virtual field to the Announcement schema to fetch comments
announcementSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "announcementId",
});

// Enable virtuals to be included in JSON responses
announcementSchema.set("toJSON", { virtuals: true });
announcementSchema.set("toObject", { virtuals: true });

export default mongoose.model("Announcement", announcementSchema);
