import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Announcement from "../models/announcement.js";
import { upload_file, delete_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";


export const createAnnouncement = catchAsyncErrors(async (req, res) => {
    // Extract data from request body
    const { message, attachments, userId } = req.body;
    let uploadedAttachments = []

    // Upload all attachments if provided
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
          const uploadedFile = await upload_file(attachment, "announcements/attachments");
          uploadedAttachments.push(uploadedFile);
      }
    }

  const announcement = await Announcement.create({
    message,
    attachments: uploadedAttachments,
    userId
  });

  res.status(200).json({
      success: true,
      announcement,
  });
});

/* get all announcements */
export const getAnnouncements = catchAsyncErrors(async (req, res) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Announcement, req.query).search().filters();

  apiFilters.populate('userId');
  apiFilters.nestedPopulate('comments','userId');

  let announcements = await apiFilters.query;
  let filteredCount = announcements.length;
  apiFilters.pagination(resPerPage);
  announcements = await apiFilters.query.clone();
  res.status(200).json({
    resPerPage,
    filteredCount,
    announcements,
  });
})

/* update announcement details */
export const updateAnnouncement = catchAsyncErrors(async (req, res, next) => {
  let announcement = await Announcement.findById(req?.params?.id);
  if (!announcement) {
    return next(new ErrorHandler("Announcement not found", 404));
  }
  
  announcement = await Announcement.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({
    announcement,
  });
});

/* delete an announcement */
export const deleteAnnouncement = catchAsyncErrors(async (req, res, next) => {
  const announcement = await Announcement.findById(req?.params?.id);
  if (!announcement) {
    return next(new ErrorHandler("Announcement not found", 404));
  }

  const result = await Comment.deleteMany({ announcementId: req?.params?.id });

  if(result){
    // delete all provided attachments
    if (announcement.attachments && announcement.attachments.length > 0) {
      for (const attachment of attachments) {
        const isFileDeleted = await delete_file(attachment?.public_id);
        if(!isFileDeleted){
          return next(new ErrorHandler("Error deleting attchment file", 400));
        }
      }
    }
    await announcement.deleteOne();
  }
  
  res.status(200).json({
    message: "Announcement deleted successfully",
  });
});