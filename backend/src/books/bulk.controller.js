const Book = require('./book.model');
const { processCsvBuffer, processBookImports } = require('../utils/csvProcessor');
const { generateBookCsvTemplate } = require('../utils/csvTemplates');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

/**
 * Download a CSV template for book imports
 */
const downloadBookTemplate = (req, res) => {
  try {
    console.log("Template download requested by:", req.user);
    
    // Try/catch around the template generation specifically
    let csvContent;
    try {
      csvContent = generateBookCsvTemplate();
      console.log("CSV template generated successfully");
    } catch (templateError) {
      console.error("Failed to generate CSV template:", templateError);
      return res.status(500).json({
        message: "Failed to generate CSV template",
        error: templateError.message
      });
    }
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=book-import-template.csv');
    
    // Send the CSV content
    res.status(200).send(csvContent);
    console.log("Template download successful");
  } catch (error) {
    console.error('Error in downloadBookTemplate:', error);
    res.status(500).json({ 
      message: 'Server error while generating template', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

/**
 * Import books from a CSV file
 */
const importBooksFromCsv = async (req, res) => {
  try {
    // Check if CSV file was uploaded
    if (!req.file) {
      return res.status(400).send({ message: 'No CSV file uploaded' });
    }
    
    // Parse the CSV data
    const booksData = await processCsvBuffer(req.file.buffer);
    
    // Validate required fields
    const invalidBooks = booksData.filter(book => !book.title || !book.author || !book.category || !book.price);
    
    if (invalidBooks.length > 0) {
      return res.status(400).send({ 
        message: 'Some books are missing required fields (title, author, category, price)',
        invalidBooks
      });
    }
    
    // Process books for import
    const { processed, failed } = await processBookImports(booksData);
    
    // Save the processed books to the database
    const savedBooks = [];
    const saveErrors = [];
    
    for (const bookData of processed) {
      try {
        const newBook = new Book(bookData);
        const savedBook = await newBook.save();
        savedBooks.push(savedBook);
      } catch (error) {
        saveErrors.push({
          book: bookData,
          error: error.message
        });
      }
    }
    
    // Generate result summary
    const result = {
      total: booksData.length,
      processed: processed.length,
      saved: savedBooks.length,
      failed: failed.length + saveErrors.length,
      details: {
        savedBooks,
        processingFailures: failed,
        saveFailures: saveErrors
      }
    };
    
    res.status(200).send({
      message: `Imported ${savedBooks.length} of ${booksData.length} books successfully`,
      result
    });
  } catch (error) {
    console.error('Error importing books:', error);
    res.status(500).send({ message: 'Failed to import books', error: error.message });
  }
};

/**
 * Export books to CSV file
 */
const exportBooksToCsv = async (req, res) => {
  try {
    // Get books from database (can add filtering options here)
    const books = await Book.find();
    
    // Convert books to CSV-friendly format
    const booksForCsv = books.map(book => ({
      title: book.title,
      author: book.author,
      category: book.category,
      categories: book.categories || '',
      description: book.description || '',
      price: book.price,
      imageUrl: book.coverImage,
      language: book.language || 'English',
      publishedDate: book.publishedDate ? book.publishedDate.toISOString().split('T')[0] : '',
      rating: book.rating || 0,
      trending: book.trending || false,
      recommended: book.recommended || false,
      newArrival: book.newArrival || false,
      bestSeller: book.bestSeller || false,
      awardWinner: book.awardWinner || false,
      inStock: book.inStock !== undefined ? book.inStock : true
    }));
    
    // Add a header comment to the export
    const headerComment = "# BookWeb CSV Export - You can edit this file and re-import it\n";
    
    // Generate CSV string with header and comment
    const csvContent = headerComment + stringify(booksForCsv, { header: true });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=books-export.csv');
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting books:', error);
    res.status(500).send({ message: 'Failed to export books', error: error.message });
  }
};

module.exports = {
  downloadBookTemplate,
  importBooksFromCsv,
  exportBooksToCsv
}; 