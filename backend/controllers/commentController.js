import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Comment from "../models/comment.js";
import Announcement from "../models/announcement.js";
import ErrorHandler from "../utils/errorHandler.js";

export const addComment = catchAsyncErrors(async (req, res, next) => {
  const {announcementId,message,userId} = req.body

  if (req?.body?.announcementId) {
    let announcement = await Announcement.findById(req?.body?.announcementId);
    if (!announcement) {
      return next(new ErrorHandler("Announcement not found", 404));
    }
  }
  const comment = await Comment.create({
    announcementId,
    message,
    userId
  });

  res.status(200).json({
    success: true,
    comment,
  });

});

export const updateComment = catchAsyncErrors(async (req, res, next) => {
  let comment = await Comment.findById(req?.params?.id);
  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  comment = await Comment.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({
    comment,
  });
});

export const deleteComment = catchAsyncErrors(async (req, res, next) => {
  const comment = await Comment.findById(req?.params?.id);
  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }
  await comment.deleteOne();
  res.status(200).json({
    message: "Comment deleted successfully",
  });
});
