const webinarServices = require('./webinarServices');

// Sessions
const getSessions = (req, res) => {
    const { eventId } = req.params;
    webinarServices.getSessions(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching webinar sessions', error: err.message });
        res.status(200).json({ sessions: results || [] });
    });
};

const createSession = (req, res) => {
    const { eventId } = req.params;
    const { SessionTitle } = req.body;
    if (!SessionTitle || !SessionTitle.trim()) {
        return res.status(400).json({ message: 'Session Title is required' });
    }

    webinarServices.createSession({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating webinar session', error: err.message });
        res.status(201).json({ message: 'Webinar session created successfully', session: result });
    });
};

const updateSession = (req, res) => {
    const { sessionId } = req.params;
    webinarServices.updateSession(sessionId, req.body, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating webinar session', error: err.message });
        res.status(200).json({ message: 'Webinar session updated successfully' });
    });
};

const deleteSession = (req, res) => {
    const { sessionId } = req.params;
    webinarServices.deleteSession(sessionId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting webinar session', error: err.message });
        res.status(200).json({ message: 'Webinar session deleted successfully' });
    });
};

// Resources
const getResources = (req, res) => {
    const { eventId } = req.params;
    webinarServices.getResources(eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching webinar resources', error: err.message });
        res.status(200).json({ resources: results || [] });
    });
};

const createResource = (req, res) => {
    const { eventId } = req.params;
    const { Title, ResourceUrl } = req.body;
    if (!Title || !ResourceUrl) {
        return res.status(400).json({ message: 'Title and Resource URL are required' });
    }

    webinarServices.createResource({ ...req.body, EventId: eventId }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating webinar resource', error: err.message });
        res.status(201).json({ message: 'Webinar resource created successfully', resource: result });
    });
};

const deleteResource = (req, res) => {
    const { resourceId } = req.params;
    webinarServices.deleteResource(resourceId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting webinar resource', error: err.message });
        res.status(200).json({ message: 'Webinar resource deleted successfully' });
    });
};

// Attendance
const getAttendance = (req, res) => {
    const { eventId } = req.params;
    const dayNumber = Number(req.query.day || 1);
    const sessionSlot = req.query.slot || 'Morning';

    webinarServices.getAttendance(eventId, dayNumber, sessionSlot, (err, results, allRecords) => {
        if (err) return res.status(500).json({ message: 'Error fetching webinar attendance', error: err.message });
        res.status(200).json({ 
            attendees: results || [],
            allRecords: allRecords || [],
            dayNumber,
            sessionSlot
        });
    });
};

const markAttendance = (req, res) => {
    const { eventId } = req.params;
    const { UserId, Status, MarkedBy, DayNumber, SessionSlot, AttendanceDate } = req.body;
    if (!UserId || !Status) {
        return res.status(400).json({ message: 'UserId and Status are required' });
    }

    const dayNum = Number(DayNumber || 1);
    const slot = SessionSlot || 'Morning';

    webinarServices.markAttendance(eventId, UserId, Status, MarkedBy || 'Admin', dayNum, slot, AttendanceDate, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error marking webinar attendance', error: err.message });
        res.status(200).json({ 
            message: 'Webinar attendance marked successfully',
            dayNumber: dayNum,
            sessionSlot: slot
        });
    });
};

const getUserAttendance = (req, res) => {
    const { eventId, userId } = req.params;
    webinarServices.getUserAttendance(eventId, userId, (err, records) => {
        if (err) return res.status(500).json({ message: 'Error fetching user attendance', error: err.message });
        res.status(200).json({
            records: records || []
        });
    });
};

// Delegate Feedback
const submitFeedback = (req, res) => {
    const eventId = req.params.eventId || req.body.EventId;
    const {
        UserId,
        UserName,
        UserEmail,
        UserPhoto,
        KeynoteRating,
        AudioVideoRating,
        ContentQuality,
        OverallRating,
        FavoriteSpeaker,
        Comments,
        Suggestions
    } = req.body;

    if (!eventId) {
        return res.status(400).json({ message: 'EventId is required' });
    }
    if (!UserName || !UserName.trim()) {
        return res.status(400).json({ message: 'UserName is required' });
    }
    if (!Comments || !Comments.trim()) {
        return res.status(400).json({ message: 'Feedback comments are required' });
    }

    const payload = {
        EventId: Number(eventId),
        UserId: UserId || null,
        UserName: UserName.trim(),
        UserEmail: UserEmail || null,
        UserPhoto: UserPhoto || null,
        KeynoteRating: Number(KeynoteRating || 5),
        AudioVideoRating: Number(AudioVideoRating || 5),
        ContentQuality: Number(ContentQuality || 5),
        OverallRating: Number(OverallRating || 5),
        FavoriteSpeaker: FavoriteSpeaker ? FavoriteSpeaker.trim() : null,
        Comments: Comments.trim(),
        Suggestions: Suggestions ? Suggestions.trim() : null
    };

    webinarServices.submitWebinarFeedback(payload, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error submitting webinar feedback', error: err.message });
        res.status(201).json({ message: 'Webinar feedback submitted successfully', feedback: result });
    });
};

const getEventFeedback = (req, res) => {
    const { eventId } = req.params;
    webinarServices.getEventFeedback(eventId, (err, feedbacks, stats) => {
        if (err) return res.status(500).json({ message: 'Error fetching webinar feedback', error: err.message });
        res.status(200).json({ 
            feedbacks: feedbacks || [],
            stats: stats || { TotalFeedbacks: 0, AvgOverall: 0, AvgKeynote: 0, AvgAudioVideo: 0, AvgContent: 0 }
        });
    });
};

const getAllWebinarFeedback = (req, res) => {
    webinarServices.getAllWebinarFeedback((err, feedbacks) => {
        if (err) return res.status(500).json({ message: 'Error fetching all webinar feedback', error: err.message });
        res.status(200).json({ feedbacks: feedbacks || [] });
    });
};

const deleteFeedback = (req, res) => {
    const { id } = req.params;
    webinarServices.deleteWebinarFeedback(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting webinar feedback', error: err.message });
        res.status(200).json({ message: 'Webinar feedback deleted successfully' });
    });
};

// Webinar Q&A Controllers
const getQuestions = (req, res) => {
    const { eventId } = req.params;
    const userId = req.query.userId || req.user?.id || null;
    webinarServices.getWebinarQuestions(eventId, userId, (err, questions) => {
        if (err) return res.status(500).json({ message: 'Error fetching webinar questions', error: err.message });
        res.status(200).json({ questions: questions || [] });
    });
};

const createQuestion = (req, res) => {
    const { eventId } = req.params;
    const { AuthorName, TargetSpeaker, QuestionText, UserId } = req.body;
    if (!QuestionText || !QuestionText.trim()) {
        return res.status(400).json({ message: 'Question text is required' });
    }
    webinarServices.createWebinarQuestion(
        {
            EventId: eventId,
            UserId: UserId || req.user?.id || null,
            AuthorName: AuthorName || 'Webinar Delegate',
            TargetSpeaker: TargetSpeaker || 'All Speakers & Panel',
            QuestionText: QuestionText.trim()
        },
        (err, created) => {
            if (err) return res.status(500).json({ message: 'Error posting question', error: err.message });
            res.status(201).json({ message: 'Question submitted successfully', question: created });
        }
    );
};

const upvoteQuestion = (req, res) => {
    const { questionId } = req.params;
    const { userId } = req.body;
    webinarServices.upvoteWebinarQuestion(questionId, userId || req.user?.id || null, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error upvoting question', error: err.message });
        res.status(200).json({ message: 'Upvote updated', ...result });
    });
};

const updateQuestionStatus = (req, res) => {
    const { questionId } = req.params;
    const { Status, Answer, AnsweredBy } = req.body;
    if (!Status || !['open', 'answered', 'pinned', 'dismissed'].includes(Status)) {
        return res.status(400).json({ message: 'Valid status is required (open, answered, pinned, dismissed)' });
    }
    webinarServices.updateWebinarQuestionStatus(questionId, { Status, Answer, AnsweredBy }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating question status', error: err.message });
        res.status(200).json({ message: 'Question status updated successfully' });
    });
};

const deleteQuestion = (req, res) => {
    const { questionId } = req.params;
    webinarServices.deleteWebinarQuestion(questionId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting question', error: err.message });
        res.status(200).json({ message: 'Question deleted successfully' });
    });
};

module.exports = {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getResources,
    createResource,
    deleteResource,
    getAttendance,
    markAttendance,
    getUserAttendance,
    submitFeedback,
    getEventFeedback,
    getAllWebinarFeedback,
    deleteFeedback,
    getQuestions,
    createQuestion,
    upvoteQuestion,
    updateQuestionStatus,
    deleteQuestion
};

