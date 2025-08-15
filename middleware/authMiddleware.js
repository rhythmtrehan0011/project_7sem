const jwt = require("jsonwebtoken");

const protectedRoute = async (res, req, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    req.id = decoded.userId;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};
