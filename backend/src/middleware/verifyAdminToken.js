const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyAdminToken = (req, res, next) => {
    // Check for Authorization header
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        console.log("Auth failed: No authorization header");
        return res.status(401).json({message: "Unauthorized: No token provided"});
    }
    
    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];
    
    if (!token) {
        console.log("Auth failed: Token missing after Bearer");
        return res.status(401).json({message: "Unauthorized: Invalid token format"});
    }
    
    // Verify the JWT token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Auth failed: JWT verification error", err.message);
            
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({message: "Unauthorized: Token expired"});
            } else if (err.name === "JsonWebTokenError") {
                return res.status(403).json({message: "Forbidden: Invalid token"});
            }
            
            return res.status(403).json({message: "Forbidden: Token validation failed"});
        }
        
        // Check if user has admin role
        if (!decoded.isAdmin && decoded.role !== 'admin') {
            console.log("Auth failed: User is not admin", decoded);
            return res.status(403).json({message: "Forbidden: Admin access required"});
        }
        
        // Log successful admin authentication
        console.log(`Admin authenticated: ${decoded.username} (${decoded.id})`);
        
        // Set user info in request for use in subsequent middlewares/controllers
        req.user = decoded;
        next();
    });
};

module.exports = verifyAdminToken;
