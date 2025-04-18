const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const {
  createBookRequest,
  getAllBookRequests,
  getUnreadRequestsCount,
  markRequestAsRead,
  updateRequestStatus,
  deleteBookRequest,
  createTestRequest
} = require('../controllers/bookRequest.controller');

// Create a new book request - requires user to be logged in
router.post('/', verifyToken, createBookRequest);

// Get all book requests - TEMPORARY: removed admin verification for testing
router.get('/', getAllBookRequests);

// Get unread requests count - TEMPORARY: removed admin verification for testing
router.get('/unread-count', getUnreadRequestsCount);

// Mark a request as read - admin only
router.patch('/:id/read', verifyAdminToken, markRequestAsRead);

// Update request status - admin only
router.patch('/:id/status', verifyAdminToken, updateRequestStatus);

// Delete a book request - admin only
router.delete('/:id', verifyAdminToken, deleteBookRequest);

// TEMPORARY - Create a test book request for debugging
router.get('/create-test', createTestRequest);

module.exports = router; 