const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const { 
  downloadBookTemplate, 
  importBooksFromCsv, 
  exportBooksToCsv 
} = require("./bulk.controller");

// Configure multer for CSV file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get CSV template for book imports
router.get("/template", verifyAdminToken, downloadBookTemplate);

// Import books from CSV
router.post("/import", verifyAdminToken, upload.single('csvFile'), importBooksFromCsv);

// Export books to CSV
router.get("/export", verifyAdminToken, exportBooksToCsv);

module.exports = router; 