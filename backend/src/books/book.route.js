const express = require("express");
const router = express.Router();
const Book = require("./book.model");
const { PostBook, getAllBooks, getSingleBook, updateBook, deleteBook } = require("./book.controller");
const verifyAdminToken = require("../middleware/verifyAdminToken");

// Post a new book
router.post("/create-book",verifyAdminToken, PostBook);

// Get all books

router.get("/", getAllBooks);

// Get a single book
router.get("/:id", getSingleBook);

// Update a book
router.put("/edit/:id", verifyAdminToken, updateBook);

// Delete a book
router.delete("/delete/:id", verifyAdminToken, deleteBook);







module.exports = router;



