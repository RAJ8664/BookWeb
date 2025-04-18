/**
 * Utility functions for generating and processing CSV templates
 */

const { stringify } = require('csv-stringify/sync');

// Generate a CSV template string for book uploads
const generateBookCsvTemplate = () => {
  try {
    console.log("Generating CSV template");
    
    const headers = [
      'title',
      'author',
      'category', 
      'categories',
      'description',
      'price',
      'imageUrl',
      'language',
      'publishedDate',
      'rating',
      'trending',
      'recommended',
      'newArrival',
      'bestSeller',
      'awardWinner',
      'inStock'
    ];
    
    const exampleData = [{
      title: 'The Great Novel',
      author: 'Jane Author',
      category: 'fiction',
      categories: 'adventure, mystery',
      description: 'A description of the book',
      price: '299',
      imageUrl: 'https://example.com/book-cover.jpg',
      language: 'English',
      publishedDate: '2023-06-15',
      rating: '4.5',
      trending: 'true',
      recommended: 'false',
      newArrival: 'true',
      bestSeller: 'false',
      awardWinner: 'false',
      inStock: 'true'
    }];
    
    // Use csv-stringify to properly format the CSV
    const csvRows = stringify(exampleData, { 
      header: true,
      columns: headers
    });
    
    console.log("CSV template generated successfully, length:", csvRows.length);
    
    return csvRows;
  } catch (error) {
    console.error("Error in generateBookCsvTemplate:", error);
    throw error; // Re-throw so caller can handle it
  }
};

module.exports = {
  generateBookCsvTemplate
}; 