import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  let error = {
    statusCode: err?.statusCode || 500,
    message: err?.message || "Internal Server Error",
  };

  // Handle Invalid Mongoose ID Error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err?.path}`;
    error = new ErrorHandler(message, 404);
  }

  // Handle Validation Error
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    error = new ErrorHandler(message, 400);
  }

  // Handle Mongoose Duplicate Key Error
  // (also covers bulk insertMany errors, whose shape differs from single-doc errors)
  if (err.code === 11000 || err.name === "MongoBulkWriteError") {
    const keyValue =
      err.keyValue ||
      err.writeErrors?.[0]?.err?.keyValue ||
      err.writeErrors?.[0]?.keyValue ||
      err.result?.result?.writeErrors?.[0]?.err?.keyValue;

    const message = keyValue
      ? `Duplicate ${Object.keys(keyValue).join(", ")} entered.`
      : "Duplicate value entered.";

    error = new ErrorHandler(message, 400);
  }

  // Handle wrong JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Try Again!!!`;
    error = new ErrorHandler(message, 400);
  }

  // Handle expired JWT Error
  if (err.name === "TokenExpiredError") {
    const message = `JSON Web Token is expired. Try Again!!!`;
    error = new ErrorHandler(message, 400);
  }

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(error.statusCode).json({
      message: error.message,
      error: err,
      stack: err?.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(error.statusCode).json({
      message: error.message,
    });
  }
};