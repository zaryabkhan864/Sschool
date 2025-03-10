import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import mongoose  from "mongoose";
import Announcement from "../models/announcement.js";
import Comment from "../models/comment.js"
import Grade from "../models/grade.js"
import { delete_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";


export const createAnnouncement = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies

   // Extract data from request body
  const { message, attachments, userId } = req.body;

  const announcement = await Announcement.create({
    message,
    attachments,
    userId, 
    campus
  });

  res.status(200).json({
      success: true,
      announcement,
  });
});

/* get all announcements */
export const getAnnouncements = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies
  
  const {role:userRole, grade: userGrade, campus: userCampus} = req.user
  if(userRole === 'student'){
    const result = await Grade.aggregate([
      // 1. Match the grade by ID
      { $match: { _id: new mongoose.Types.ObjectId(userGrade), } },
      // 2. Lookup courses in the grade where campus matches req.user campus
      {
        $lookup: {
          from: "courses",
          let: { campusId:  new mongoose.Types.ObjectId(campus) },
          pipeline: [
            { $match: { $expr: { $eq: ["$campus", "$$campusId"] } } },
          ],
          as: "courseDetails"
        }
      },
      
      // 3. Unwind courses to process individually
      { $unwind: "$courseDetails" },      
      // 5. Group unique teacher IDs
      {
        $group: {
          _id: null,
          teacherIds: { $addToSet: "$courseDetails.teacher" }
        }
      },
      
      // 6. Project to clean up output
      { $project: { _id: 0, teacherIds: 1 } }
    ]); 

    req.query.userId = result[0].teacherIds
  }
  req.query.campus = campus

  const resPerPage = 8;
  const apiFilters = new APIFilters(Announcement, req.query).search().filters().sort("createdAt" , -1);

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
      for (const attachment of announcement.attachments) {
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