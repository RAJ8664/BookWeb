const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  bookTitle: {
    type: String,
    required: true,
    trim: true
  },
  authorName: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  additionalDetails: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['not urgent', 'normal', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  adminComment: {
    type: String,
    trim: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const BookRequest = mongoose.model('BookRequest', bookRequestSchema);

module.exports = BookRequest; 