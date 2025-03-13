// Utility function to set Campus ID in the cookie and send response
export default (campusID, statusCode, res) => {
  // Remove old campus cookie (Set expiry to past date)
  res.cookie("campus", "", {
    expires: new Date(0),
    httpOnly: false,
  });

  // Add new campus cookie with updated campus ID
  res.cookie("campus", String(campusID._id), {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
  });

  // Send response with campusID in the body
  res.status(statusCode).json({
    success: true,
    message: "Campus ID updated in cookie",
    campusID: campusID._id, // Campus ID is already included here
  });
};