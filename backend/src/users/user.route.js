const express = require("express");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

router.post("/admin", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        console.log("Admin login attempt for username:", username);
        
        // Find the admin user
        const admin = await User.findOne({ username });
        
        if (!admin) {
            console.log("Admin login failed: user not found");
            return res.status(404).json({ message: "Admin not found" });
        }
        
        // Check if the user has admin role
        if (admin.role !== 'admin') {
            console.log("Login attempt with non-admin account:", username);
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }
        
        // Compare passwords - use bcrypt if passwords are hashed, otherwise use direct comparison
        let passwordMatch = false;
        
        if (admin.password.startsWith('$2')) {
            // Hashed password with bcrypt
            passwordMatch = await bcrypt.compare(password, admin.password);
        } else {
            // Plain text password (not recommended for production)
            passwordMatch = admin.password === password;
        }
        
        if (!passwordMatch) {
            console.log("Admin login failed: password mismatch");
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate JWT token with admin info
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role,
                isAdmin: true // Explicitly mark as admin
            }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        console.log("Admin login successful for:", username);

        return res.status(200).json({
            message: "Authenticated successfully",
            token: token,
            user: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Failed to login as admin", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
