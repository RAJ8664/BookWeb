const Book = require("./book.model");
const PostBook = async (req, res) => {

    try {
        const newBook = await Book({...req.body});
        await newBook.save();
        res.status(200).send({message: "Book Posted successfully", book: newBook});
    } catch (error) {
        res.status(500).send({message: "Book posting failed", error: error.message});
        console.log(error);
        
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
//Update a book
const updateBook = async (req, res) => {
    try {
        const {id} = req.params;
        const updatedBook = await Book.findByIdAndUpdate(id, {...req.body}, {new: true});
        if(!updatedBook) {
            return res.status(404).send({message: "Book not found"});
        }
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
        const deletedBook = await Book.findByIdAndDelete(id);
        if(!deletedBook) {
            return res.status(404).send({message: "Book not found"});
        }
        res.status(200).send({message: "Book deleted successfully", book: deletedBook});
    }
    catch(error){
        res.status(500).send({message: "Book deleting failed", error: error.message});
        console.log(error);
    }
}
module.exports = {PostBook, getAllBooks, getSingleBook, updateBook, deleteBook};
