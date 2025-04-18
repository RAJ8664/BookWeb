const BookRequest = require('../models/bookRequest.model');

// Create a new book request
exports.createBookRequest = async (req, res) => {
  try {
    const newRequest = new BookRequest({
      userId: req.body.userId,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      bookTitle: req.body.bookTitle,
      authorName: req.body.authorName || 'Unknown',
      genre: req.body.genre || '',
      additionalDetails: req.body.additionalDetails || '',
      urgency: req.body.urgency || 'normal',
      status: 'pending',
      requestDate: req.body.requestDate || new Date(),
      isRead: false
    });

    const savedRequest = await newRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Book request submitted successfully',
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating book request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit book request',
      error: error.message
    });
  }
};

// Get all book requests
exports.getAllBookRequests = async (req, res) => {
  try {
    console.log('Fetching all book requests...');
    const requests = await BookRequest.find().sort({ createdAt: -1 });
    console.log(`Found ${requests.length} book requests`);
    console.log('Request details:', JSON.stringify(requests, null, 2));
    
    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching book requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book requests',
      error: error.message
    });
  }
};

// Get unread book requests count
exports.getUnreadRequestsCount = async (req, res) => {
  try {
    const count = await BookRequest.countDocuments({ isRead: false });
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error counting unread requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count unread requests',
      error: error.message
    });
  }
};

// Mark a book request as read
exports.markRequestAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedRequest = await BookRequest.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Book request marked as read',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error marking request as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark request as read',
      error: error.message
    });
  }
};

// Update book request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    
    if (!['pending', 'accepted', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const updatedRequest = await BookRequest.findByIdAndUpdate(
      id,
      { 
        status,
        adminComment: adminComment || '',
        isRead: true
      },
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Book request ${status}`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
};

// Delete a book request
exports.deleteBookRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRequest = await BookRequest.findByIdAndDelete(id);
    
    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Book request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book request',
      error: error.message
    });
  }
};

// After the last function in the file, add this temporary test function
exports.createTestRequest = async (req, res) => {
  try {
    const testRequest = new BookRequest({
      userId: "test123",
      userName: "Test User",
      userEmail: "test@example.com",
      bookTitle: "Test Book Request",
      authorName: "Test Author",
      genre: "fiction",
      additionalDetails: "This is a test book request for debugging purposes",
      urgency: "normal",
      status: "pending",
      requestDate: new Date(),
      isRead: false
    });
    
    const savedRequest = await testRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Test book request created successfully',
      request: savedRequest
    });
  } catch (error) {
    console.error('Error creating test book request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test book request',
      error: error.message
    });
  }
}; 