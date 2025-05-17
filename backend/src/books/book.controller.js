const Book = require("./book.model");
const { deleteImage } = require('../utils/cloudinaryUtils');

const PostBook = async (req, res) => {
    try {
        // Log information about the request for debugging
        console.log("Request body:", req.body);
        console.log("File received:", req.file);
        
        // The coverImage URL should already be in req.body from the uploadMiddleware
        if (req.file) {
            console.log("Cloudinary image URL:", req.body.coverImage);
        } else {
            console.log("No image file was uploaded or processed by middleware");
        }
        
        const newBook = await Book({...req.body});
        await newBook.save();
        
        console.log("Book saved with data:", newBook);
        
        res.status(200).send({message: "Book Posted successfully", book: newBook});
    } catch (error) {
        res.status(500).send({message: "Book posting failed", error: error.message});
        console.log("Error posting book:", error);
    }
}

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({createdAt: -1});
        res.status(200).send({message: "Books fetched successfully", books: books});
    } catch (error) {
        res.status(500).send({message: "Books fetching failed", error: error.message});
        console.log(error);
    }
}

// Get a single book
const getSingleBook = async (req, res) => {
    try {
        const {id} = req.params;
        const book = await Book.findById(id);
        if(!book) {
            return res.status(404).send({message: "Book not found"});
        }
        res.status(200).send({message: "Book fetched successfully", book: book});
    } catch (error) {
        res.status(500).send({message: "Book fetching failed", error: error.message});
        console.log(error);
    }
}

// Search books by title, author, genre, or description
const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).send({ message: "Search query is required" });
        }
        
        // Create a regex pattern for case-insensitive search
        const searchRegex = new RegExp(query, 'i');
        
        // Search across multiple fields
        const books = await Book.find({
            $or: [
                { title: searchRegex },
                { author: searchRegex },
                { genre: searchRegex },
                { description: searchRegex }
            ]
        }).limit(10);
        
        res.status(200).send({ 
            message: "Search results fetched successfully", 
            results: books,
            count: books.length
        });
    } catch (error) {
        res.status(500).send({ message: "Search failed", error: error.message });
        console.log(error);
    }
}

//Update a book
const updateBook = async (req, res) => {
    try {
        const {id} = req.params;
        
        // First get the existing book to check if we need to delete any old image
        const existingBook = await Book.findById(id);
        if(!existingBook) {
            return res.status(404).send({message: "Book not found"});
        }
        
        // If there's a new image uploaded and an existing Cloudinary image, delete the old one
        if (req.body.coverImage && existingBook.coverImage && 
            existingBook.coverImage !== 'default-book-cover.jpg' && 
            existingBook.coverImage.includes('cloudinary.com')) {
            await deleteImage(existingBook.coverImage);
        }
        
        const updatedBook = await Book.findByIdAndUpdate(id, {...req.body}, {new: true});
        res.status(200).send({message: "Book updated successfully", book: updatedBook});
    }
    catch(error){
        res.status(500).send({message: "Book updating failed", error: error.message});
        console.log(error);
    }
}

//Delete a book
const deleteBook = async (req, res) => {
    try {
        const {id} = req.params;
        
        // First get the book to delete its image
        const bookToDelete = await Book.findById(id);
        if(!bookToDelete) {
            return res.status(404).send({message: "Book not found"});
        }
        
        // Delete the image from Cloudinary if it exists and is not the default
        if (bookToDelete.coverImage && 
            bookToDelete.coverImage !== 'default-book-cover.jpg' && 
            bookToDelete.coverImage.includes('cloudinary.com')) {
            await deleteImage(bookToDelete.coverImage);
        }
        
        // Now delete the book
        const deletedBook = await Book.findByIdAndDelete(id);
        res.status(200).send({message: "Book deleted successfully", book: deletedBook});
    }
    catch(error){
        res.status(500).send({message: "Book deleting failed", error: error.message});
        console.log(error);
    }
}

module.exports = {PostBook, getAllBooks, getSingleBook, updateBook, deleteBook, searchBooks};
