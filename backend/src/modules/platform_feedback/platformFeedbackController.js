const platformFeedbackService = require('./platformFeedbackService');

const createFeedback = (req, res) => {
    const { userId, userName, userEmail, rating, category, comments } = req.body;

    if (!userName?.trim() || rating === undefined || rating === null || !comments?.trim()) {
        return res.status(400).json({
            message: 'Name, rating, and feedback comments are required'
        });
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({
            message: 'Rating must be an integer between 1 and 5'
        });
    }

    const feedbackData = {
        UserId: userId ? Number(userId) : null,
        UserName: userName.trim(),
        UserEmail: userEmail?.trim() || null,
        Rating: numRating,
        Category: category?.trim() || 'General Experience',
        Comments: comments.trim()
    };

    platformFeedbackService.createPlatformFeedback(feedbackData, (err, feedback) => {
        if (err) {
            console.error('Create platform feedback error:', err);
            return res.status(500).json({
                message: 'Failed to submit platform feedback'
            });
        }
        return res.status(201).json({
            message: 'Platform feedback submitted successfully! Thank you.',
            feedback
        });
    });
};

const getAllFeedback = (req, res) => {
    platformFeedbackService.getAllPlatformFeedback((err, feedback) => {
        if (err) {
            console.error('Get platform feedback error:', err);
            return res.status(500).json({
                message: 'Failed to retrieve platform feedback'
            });
        }
        return res.status(200).json({
            message: 'Platform feedback retrieved successfully',
            count: feedback.length,
            feedback
        });
    });
};

const getTestimonials = (req, res) => {
    const limit = req.query.limit || 12;
    platformFeedbackService.getTestimonials(limit, (err, testimonials) => {
        if (err) {
            console.error('Get testimonials error:', err);
            return res.status(500).json({
                message: 'Failed to retrieve testimonials'
            });
        }
        return res.status(200).json({
            message: 'Testimonials retrieved successfully',
            count: testimonials.length,
            testimonials
        });
    });
};

const deleteFeedback = (req, res) => {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    platformFeedbackService.deletePlatformFeedback(id, (err) => {
        if (err) {
            console.error('Delete platform feedback error:', err);
            return res.status(500).json({ message: 'Failed to delete feedback' });
        }
        return res.status(200).json({ message: 'Feedback deleted successfully' });
    });
};

module.exports = {
    createFeedback,
    getAllFeedback,
    getTestimonials,
    deleteFeedback
};
