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
      minlength: [2, "Author name must be at least 2 characters"]
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
      type: String, // URL or filename depending on storage
      default: "default-book-cover.jpg"
    },
    trending: {
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
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better search performance
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

// Virtual for formatted price
bookSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

module.exports = mongoose.model("Book", bookSchema);
