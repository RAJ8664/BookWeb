const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [2, "Author name must be at least 2 characters"],
      maxlength: [100, "Author name cannot exceed 100 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true
    },
    categories: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: "No description available"
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    coverImage: {
      type: String,
      default: "default-book-cover.jpg"
    },
    trending: {
      type: Boolean,
      default: false
    },
    recommended: {
      type: Boolean,
      default: false
    },
    newArrival: {
      type: Boolean,
      default: false
    },
    bestSeller: {
      type: Boolean,
      default: false
    },
    inStock: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    publishedDate: {
      type: Date,
      default: Date.now
    },

    language: {
      type: String,
      default: "English",
      trim: true
    },

  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add comprehensive indexes for better search performance
bookSchema.index({ 
  title: 'text', 
  author: 'text', 
  category: 'text',
  description: 'text',
  isbn: 'text'
});

// Index for filtering by categories and status
bookSchema.index({ category: 1, trending: 1, bestSeller: 1, newArrival: 1 });

// Virtual for formatted price
bookSchema.virtual('formattedPrice').get(function() {
  return `Rs.${this.price.toFixed(2)}`;
});

// Virtual for book age in days
bookSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if book is on sale
bookSchema.methods.isOnSale = function() {
  // This is just an example condition - it doesn't actually modify the price
  return this.price < 2000; 
};

module.exports = mongoose.model("Book", bookSchema);
