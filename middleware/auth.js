import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    console.log("DEBUG: req.cookies:", req.cookies);
    console.log("DEBUG: req.headers.authorization:", req.headers.authorization);

    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("DEBUG: Resolved token:", token);

    if (!token || token === "undefined") {
      return res.status(401).json({
        success: false,
        error: "Not authorized, invalid token",
        statusCode: 401,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      statusCode: 401,
    });
  }
};

export default protect;
