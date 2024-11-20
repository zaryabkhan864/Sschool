// Create token and save in the cookie
export default (user, statusCode, res) => {
    // Create JWT Token
    const token = user.getJwtToken();

    // Extract user role
    const userRole = user.role; // Replace 'role' with the actual property name in your user object

    // Options for cookie
    const tokenOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    const userRoleOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: false, // Set httpOnly to false for userRole cookie
    };

    res
        .status(statusCode)
        .cookie("token", token, tokenOptions)
        .cookie("userRole", userRole, userRoleOptions) // Set options for userRole cookie
        .json({
            token,
            userRole,
        });
};