const { upload } = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

// Middleware for single file upload (book cover image)
const uploadBookCover = upload.single('coverImage');

// Error handling wrapper for the upload middleware
const handleUpload = asyncHandler(async (req, res, next) => {
  console.log('Upload middleware started');
  console.log('Request has file?', !!req.file);
  console.log('Request files:', req.files);
  console.log('Content-Type:', req.headers['content-type']);
  
  try {
    // The actual multer middleware is executed
    uploadBookCover(req, res, function (err) {
      if (err) {
        console.error('Multer upload error:', err);
        return res.status(400).json({
          message: "Image upload failed",
          error: err.message
        });
      }
      
      // If there's a file uploaded, add the Cloudinary URL to the request body
      if (req.file) {
        console.log('File uploaded successfully:', req.file);
        console.log('Cloudinary URL:', req.file.path);
        req.body.coverImage = req.file.path;
      } else {
        console.log('No file was uploaded');
      }
      
      next();
    });
  } catch (error) {
    console.error('Upload middleware error:', error);
    res.status(500).json({
      message: "Server error during file upload",
      error: error.message
    });
  }
});

module.exports = { handleUpload }; 