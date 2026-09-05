import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Announcement from "../models/announcement.js";
import Comment from "../models/comment.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import { delete_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";

const AUTHOR_SELECT = "firstName middleName lastName role avatar";

// Resolves the ClassGroup a student is CURRENTLY, ACTIVELY enrolled in —
// this is the single source of truth for "their own class", used both
// to validate a student's posting scope and to decide what they can see.
const getStudentClassGroup = async (studentId) => {
    const enrollment = await StudentEnrollment.findOne({
        student: studentId,
        status: "active",
    }).select("classGroup");
    return enrollment?.classGroup || null;
};

// Create a new announcement => POST /api/v1/announcement
//
// Two posting modes:
//  - Whole school/campus: classGroup left out entirely.
//  - A specific class group: classGroup is that group's id.
//
// Rule (per your 4 requirements): a STUDENT may only post to their own
// class group, or to the whole school — never another class. Every
// other role (teacher, principal, admin, or anyone else) has no such
// restriction and may post to any class group or the whole school.
export const createAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { message, attachments, classGroup, postToOwnClass } = req.body;

    if (!message || !message.trim()) {
        return next(new ErrorHandler("Please enter a message", 400));
    }
    if (!campus || !academicYear) {
        return next(new ErrorHandler("Campus and academic year must be selected before posting", 400));
    }

    let finalClassGroup = classGroup || null;

    if (req.user.role === "student") {
        if (postToOwnClass) {
            // Frontend convenience path for students: they never need to
            // know their own classGroup's id, just "post to my class".
            const ownClassGroup = await getStudentClassGroup(req.user._id);
            if (!ownClassGroup) {
                return next(new ErrorHandler("You don't have an active class enrollment", 400));
            }
            finalClassGroup = ownClassGroup;
        } else if (finalClassGroup) {
            // A classGroup id was sent directly — must be their own.
            const ownClassGroup = await getStudentClassGroup(req.user._id);
            if (!ownClassGroup || ownClassGroup.toString() !== finalClassGroup.toString()) {
                return next(
                    new ErrorHandler("You can only post to your own class group or to the whole school", 403)
                );
            }
        }
        // else: no classGroup at all => whole-school post, always allowed.
    }

    const announcement = await Announcement.create({
        userId: req.user._id,
        campus,
        academicYear,
        classGroup: finalClassGroup,
        message: message.trim(),
        attachments: attachments || [],
    });

    const populated = await Announcement.findById(announcement._id)
        .populate("userId", AUTHOR_SELECT)
        .populate("classGroup", "displayName");

    res.status(200).json({
        success: true,
        announcement: populated,
    });
});

// Get announcements (the Wall feed) => GET /api/v1/announcement
//
// Scoped to the currently-selected campus + academic year. A student
// sees whole-school posts plus posts to their own class group only —
// never another class's posts. Every other role sees everything for
// this campus+year (no restriction), matching the posting rule above.
export const getAnnouncements = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { page, classGroup: classGroupFilter, keyword } = req.query;

    if (!campus || !academicYear) {
        return res.status(200).json({ success: true, resPerPage: 8, filteredCount: 0, announcements: [] });
    }

    const filter = { campus, academicYear };

    if (req.user.role === "student") {
        const ownClassGroup = await getStudentClassGroup(req.user._id);
        filter.$or = [{ classGroup: null }, ...(ownClassGroup ? [{ classGroup: ownClassGroup }] : [])];
    } else if (classGroupFilter) {
        // Optional: lets staff narrow the wall down to one class group.
        filter.classGroup = classGroupFilter;
    }

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        filter.message = { $regex: trimmedKeyword, $options: "i" };
    }

    const resPerPage = 8;
    const currentPage = Math.max(Number(page) || 1, 1);

    const filteredCount = await Announcement.countDocuments(filter);

    const announcements = await Announcement.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * resPerPage)
        .limit(resPerPage)
        .populate("userId", AUTHOR_SELECT)
        .populate("classGroup", "displayName")
        .populate({
            path: "comments",
            populate: { path: "userId", select: AUTHOR_SELECT },
        });

    res.status(200).json({
        success: true,
        resPerPage,
        filteredCount,
        announcements,
    });
});

// Update announcement => PUT /api/v1/announcement/:id
// 👇 FIX: previously had NO ownership check at all — any authenticated
// user, including an unrelated student, could edit anyone's post. Now
// only the original author (or admin/principal) can.
export const updateAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
        return next(new ErrorHandler("Announcement not found", 404));
    }

    const isOwner = announcement.userId.toString() === req.user._id.toString();
    const isPrivileged = ["admin", "principal"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
        return next(new ErrorHandler("You can only edit your own posts", 403));
    }

    // Only the message/attachments are ever editable — campus,
    // academicYear, classGroup, and userId are fixed at creation time.
    const { message, attachments } = req.body;
    if (message !== undefined) announcement.message = message;
    if (attachments !== undefined) announcement.attachments = attachments;
    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
        .populate("userId", AUTHOR_SELECT)
        .populate("classGroup", "displayName");

    res.status(200).json({ success: true, announcement: populated });
});

// Delete announcement => DELETE /api/v1/announcement/:id
// 👇 FIX: same missing-ownership-check bug as update, above.
export const deleteAnnouncement = catchAsyncErrors(async (req, res, next) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
        return next(new ErrorHandler("Announcement not found", 404));
    }

    const isOwner = announcement.userId.toString() === req.user._id.toString();
    const isPrivileged = ["admin", "principal"].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
        return next(new ErrorHandler("You can only delete your own posts", 403));
    }

    await Comment.deleteMany({ announcementId: req.params.id });

    if (announcement.attachments?.length) {
        for (const attachment of announcement.attachments) {
            const isFileDeleted = await delete_file(attachment.public_id);
            if (!isFileDeleted) {
                return next(new ErrorHandler("Error deleting attachment file", 400));
            }
        }
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
});
