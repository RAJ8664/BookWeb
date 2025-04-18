const express = require("express");
const router = express.Router();
const Book = require("./book.model");
const { PostBook, getAllBooks, getSingleBook, updateBook, deleteBook, searchBooks } = require("./book.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const { handleUpload } = require("../middleware/uploadMiddleware");

// Post a new book with image upload
router.post("/create-book", verifyAdminToken, handleUpload, PostBook);

// Get all books
router.get("/", getAllBooks);

// Search books
router.get("/search", searchBooks);

// Get a single book
router.get("/:id", getSingleBook);

// Update a book with optional image upload
router.put("/edit/:id", verifyAdminToken, handleUpload, updateBook);

// Delete a book
router.delete("/delete/:id", verifyAdminToken, deleteBook);

module.exports = router;



