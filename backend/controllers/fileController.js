import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { upload_file, delete_file } from "../utils/cloudinary.js";


export const uploadFile = catchAsyncErrors(async (req, res, next) => {
  const {files} = req.body

  if (!files) {
    return next(new ErrorHandler("File not found", 404));
  }
  const uploadedAttachments =[]
  // Upload all attachments if provided
  if (files && files.length > 0) {
    for (const attachment of files) {
        const uploadedFile = await upload_file(attachment, "announcements/attachments");
        if(uploadedFile?.url){
          uploadedAttachments.push(uploadedFile);
        }
        else{
          return next(new ErrorHandler("Error uploading file.", 400));
        }
    }
  }

  res.status(200).json({
    success: true,
    uploadedAttachments,
  });
});

export const deleteFile = catchAsyncErrors(async (req, res, next) => {

  if (!req.body.file) {
    return next(new ErrorHandler("File not found", 404));
  }

  const isFileDeleted = await delete_file(req?.body?.file?.public_id);
  if(!isFileDeleted){
    return next(new ErrorHandler("Error deleting attchment file", 400));
  }
  res.status(200).json({
    success: true,
  });
});