const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided"
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
       message: "Invalid token format"
    });
    } 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
     console.log("AUTH ERROR:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;