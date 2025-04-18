const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');
const { cloudinary } = require('../config/cloudinary');

/**
 * Process a CSV file and convert it to book records
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of processed book records
 */
const processCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    // Skip lines that start with # (comments)
    const transformStream = csv({
      mapHeaders: ({ header }) => header.trim(),
      mapValues: ({ value }) => value.trim(),
      skipComments: true,
      comment: '#'
    });
    
    fs.createReadStream(filePath)
      .pipe(transformStream)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Process a CSV buffer and convert it to book records
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} - Array of processed book records
 */
const processCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    
    // Skip lines that start with # (comments)
    const transformStream = csv({
      mapHeaders: ({ header }) => header.trim(),
      mapValues: ({ value }) => value.trim(),
      skipComments: true,
      comment: '#'
    });
    
    readableStream
      .pipe(transformStream)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Process book data from CSV format to database format
 * @param {Array} booksData - Array of book objects from CSV
 * @returns {Promise<{processed: Array, failed: Array}>} - Processed books and failures
 */
const processBookImports = async (booksData) => {
  const processed = [];
  const failed = [];
  
  for (const bookData of booksData) {
    try {
      // First, do basic validation
      if (!bookData.title || !bookData.author || !bookData.category || !bookData.price) {
        throw new Error('Missing required fields (title, author, category, or price)');
      }
      
      // Process boolean fields
      const processedBook = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        category: bookData.category.trim(),
        categories: bookData.categories ? bookData.categories.trim() : '',
        description: bookData.description ? bookData.description.trim() : 'No description available',
        price: parseFloat(bookData.price),
        language: bookData.language ? bookData.language.trim() : 'English',
        publishedDate: bookData.publishedDate ? new Date(bookData.publishedDate) : new Date(),
        rating: bookData.rating ? parseFloat(bookData.rating) : 0,
        trending: parseBoolean(bookData.trending),
        recommended: parseBoolean(bookData.recommended),
        newArrival: parseBoolean(bookData.newArrival),
        bestSeller: parseBoolean(bookData.bestSeller),
        awardWinner: parseBoolean(bookData.awardWinner),
        inStock: bookData.inStock === undefined ? true : parseBoolean(bookData.inStock)
      };
      
      // Process image URL if provided
      if (bookData.imageUrl) {
        try {
          // Check if cloudinary is properly configured before trying to use it
          if (!process.env.CLOUDINARY_CLOUD_NAME || !cloudinary) {
            console.warn("Cloudinary not properly configured, using default image");
            processedBook.coverImage = 'default-book-cover.jpg';
            processedBook._imageError = "Cloudinary configuration missing";
          } 
          // If it's already a Cloudinary URL, use it directly
          else if (bookData.imageUrl.includes('cloudinary.com') && 
              bookData.imageUrl.includes(process.env.CLOUDINARY_CLOUD_NAME)) {
            console.log(`Using existing Cloudinary URL for ${bookData.title}`);
            processedBook.coverImage = bookData.imageUrl;
          } else {
            // Otherwise, upload the image from the URL to Cloudinary
            console.log(`Uploading image for book "${bookData.title}" from URL: ${bookData.imageUrl.substring(0, 50)}...`);
            try {
              const uploadResult = await cloudinary.uploader.upload(bookData.imageUrl, {
                folder: 'bookweb/books',
                transformation: [{ width: 500, height: 600, crop: 'limit' }]
              });
              processedBook.coverImage = uploadResult.secure_url;
              console.log(`Successfully uploaded image for "${bookData.title}": ${uploadResult.secure_url}`);
            } catch (uploadError) {
              console.error(`Cloudinary upload failed for book "${bookData.title}":`, uploadError.message);
              processedBook.coverImage = 'default-book-cover.jpg';
              processedBook._imageError = `Cloudinary upload failed: ${uploadError.message}`;
            }
          }
        } catch (imageError) {
          // If image processing fails, use default and note the error
          console.error(`Image processing error for book "${bookData.title}":`, imageError);
          processedBook.coverImage = 'default-book-cover.jpg';
          processedBook._imageError = imageError.message;
        }
      } else {
        processedBook.coverImage = 'default-book-cover.jpg';
      }
      
      processed.push(processedBook);
    } catch (error) {
      failed.push({
        originalData: bookData,
        error: error.message
      });
    }
  }
  
  return { processed, failed };
};

/**
 * Helper function to parse boolean values from various formats
 * @param {string|boolean} value - The value to parse
 * @returns {boolean} - Parsed boolean value
 */
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase().trim();
    return lowercaseValue === 'true' || lowercaseValue === 'yes' || lowercaseValue === '1';
  }
  return Boolean(value);
};

module.exports = {
  processCsvFile,
  processCsvBuffer,
  processBookImports
}; 