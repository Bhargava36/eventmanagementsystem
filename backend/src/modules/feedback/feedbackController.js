const feedbackService = require('../feedback/feedbackService');

const createFeedback = (req, res) => {
    const { name, eventName, category, rating, comments } = req.body;
    if (!name?.trim() || !eventName?.trim() || !category?.trim() || rating === undefined || rating === null ) {
        return res.status(400).json({
            message: 'Please provide all required feedback fields'
        });
    }
    const numericRating = Number(rating);
    if ( !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 ) {
        return res.status(400).json({
            message: 'Rating must be an integer between 1 and 5'
        });
    }
    const feedbackData = {
        UserName: name.trim(),
        EventName: eventName.trim(),
        Category: category.trim(),
        Rating: numericRating,
        Comments: comments?.trim() || null
    };
    feedbackService.createFeedback(feedbackData, (err, feedback) => {
        if (err) {
            console.error('Create feedback error:', err);
            if (err.message.includes('Event not found')) {
                return res.status(404).json({
                    message: err.message
                });
            }
            return res.status(500).json({
                message: 'Failed to submit feedback'
            });
        }
        return res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });
    });
};

const getAllFeedback = (req, res) => {
    feedbackService.getAllFeedback((err, feedback) => {
        if (err) {
            console.error('Get feedback error:', err);
            return res.status(500).json({
                message: 'Failed to retrieve feedback'
            });
        }
        return res.status(200).json({
            message: 'Feedback retrieved successfully',
            count: feedback.length,
            feedback
        });
    });
};

const getFeedbackByAdmin = (req, res) => {
    const adminId = Number(req.params.adminId);
    if (!Number.isInteger(adminId) || adminId <= 0) {
        return res.status(400).json({
            message: 'Invalid admin ID'
        });
    }
    feedbackService.getFeedbackByAdmin(adminId, (err, feedback) => {
        if (err) {
            console.error('Get admin feedback error:', err);
            return res.status(500).json({
                message: 'Failed to retrieve admin feedback'
            });
        }
        return res.status(200).json({
            message: 'Admin feedback retrieved successfully',
            count: feedback.length,
            feedback
        });
    });
};

const getFeedbackById = (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid feedback ID'
        });
    }
    feedbackService.getFeedbackById(id, (err, feedback) => {
        if (err) {
            console.error('Get feedback by ID error:', err);
            return res.status(500).json({
                message: 'Failed to retrieve feedback'
            });
        }
        if (!feedback) {
            return res.status(404).json({
                message: 'Feedback not found'
            });
        }
        return res.status(200).json({
            message: 'Feedback retrieved successfully',
            feedback
        });
    });
};


module.exports = {
    createFeedback,
    getAllFeedback,
    getFeedbackByAdmin,
    getFeedbackById
};