const express = require("express");
const router = express.Router();
const Book = require("./book.model");

// Post a new book
router.post("/create-book", async (req, res) => {

    try {
        const newBook = await Book({...req.body});
        await newBook.save();
        res.status(200).send({message: "Book Posted successfully", book: newBook});
    } catch (error) {
        res.status(500).send({message: "Book posting failed", error: error.message});
        console.log(error);
        
    }

})

module.exports = router;



