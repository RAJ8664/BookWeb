const express = require("express");
const router = express.Router();
const Book = require("./book.model");
const { PostBook, getAllBooks, getSingleBook, updateBook, deleteBook } = require("./book.controller");

// Post a new book
router.post("/create-book", PostBook);

// Get all books

router.get("/", getAllBooks);

// Get a single book
router.get("/:id", getSingleBook);

// Update a book
router.put("/edit/:id", updateBook);

// Delete a book
router.delete("/delete/:id", deleteBook);







module.exports = router;



