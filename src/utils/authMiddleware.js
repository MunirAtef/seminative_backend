const jwt = require("jsonwebtoken");
const responses = require("../features/responses");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1]; // Extract token from `Bearer <token>`

        if (!token) {
            const result = responses.unauthorized("Access denied. No token provided.")
            return res.status(result.status).json(result);
        }

        // Verify token
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;

        next();
    } catch (error) {
        const result = responses.unauthorized("Invalid or expired token.")
        return res.status(result.status).json(result);
    }
};

module.exports = authMiddleware;
