import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // 🔒 STRICT check
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ") ||
            authHeader === "Bearer undefined"
        ) {
            return res.status(401).json({
                success: false,
                error: "Not authorized, token missing",
                statusCode: 401,
            });
        }

        const token = authHeader.split(" ")[1];

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
