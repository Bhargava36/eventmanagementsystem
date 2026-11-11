const projectExpoService = require('./projectExpoService');
// CONFIG & STATUS
const getConfig = async (req, res) => {
    try {
        const { eventId } = req.params;
        const config = await projectExpoService.getConfig(eventId);
        return res.status(200).json({ success: true, config });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const saveConfig = async (req, res) => {
    try {
        const { eventId } = req.params;
        const config = await projectExpoService.saveConfig(eventId, req.body);
        return res.status(200).json({ success: true, message: 'Project Expo configuration saved.', config });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const updateStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });
        const result = await projectExpoService.updateStatus(eventId, status, req);
        return res.status(200).json({ success: true, message: `Status updated to ${status}.`, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// DOMAINS
const getDomains = async (req, res) => {
    try {
        const { eventId } = req.params;
        const domains = await projectExpoService.getDomains(eventId);
        return res.status(200).json({ success: true, domains });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const saveDomains = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { domains } = req.body;
        if (!Array.isArray(domains)) return res.status(400).json({ success: false, message: 'Domains array is required.' });
        const result = await projectExpoService.saveDomains(eventId, domains);
        return res.status(200).json({ success: true, message: 'Domains updated successfully.', domains: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// SUBMISSIONS
const getSubmissions = async (req, res) => {
    try {
        const { eventId } = req.params;
        const filters = {
            domainId: req.query.domainId,
            status: req.query.status,
            search: req.query.search
        };
        const submissions = await projectExpoService.getSubmissions(eventId, filters);
        return res.status(200).json({ success: true, submissions });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getSubmissionByTeam = async (req, res) => {
    try {
        const { eventId, teamId } = req.params;
        const submission = await projectExpoService.getSubmissionByTeam(eventId, teamId);
        return res.status(200).json({ success: true, submission });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const upsertSubmission = async (req, res) => {
    try {
        const { eventId } = req.params;
        const submissionData = {
            ...req.body,
            EventId: eventId,
            SubmittedByUserId: req.user?.id || req.user?.Id || req.body.SubmittedByUserId
        };
        const submission = await projectExpoService.upsertSubmission(submissionData);
        return res.status(200).json({ success: true, message: 'Project submitted successfully.', submission });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const reviewSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, adminFeedback } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Review status is required.' });
        const result = await projectExpoService.reviewSubmission(submissionId, { status, adminFeedback }, req);
        return res.status(200).json({ success: true, message: `Submission reviewed as ${status}.`, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// BOOTHS
const getBooths = async (req, res) => {
    try {
        const { eventId } = req.params;
        const booths = await projectExpoService.getBooths(eventId);
        return res.status(200).json({ success: true, booths });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const batchGenerateBooths = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { count, prefix, locationZone } = req.body;
        const booths = await projectExpoService.batchGenerateBooths(eventId, { count, prefix, locationZone });
        return res.status(200).json({ success: true, message: 'Booths generated successfully.', booths });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const allocateBooth = async (req, res) => {
    try {
        const { boothId } = req.params;
        const { teamId } = req.body;
        if (!teamId) return res.status(400).json({ success: false, message: 'TeamId is required for allocation.' });
        const result = await projectExpoService.allocateBooth(boothId, teamId, req);
        return res.status(200).json({ success: true, message: 'Booth allocated successfully.', result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deallocateBooth = async (req, res) => {
    try {
        const { boothId } = req.params;
        const result = await projectExpoService.deallocateBooth(boothId, req);
        return res.status(200).json({ success: true, message: 'Booth deallocated successfully.', result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteBooth = async (req, res) => {
    try {
        const { boothId } = req.params;
        const result = await projectExpoService.deleteBooth(boothId, req);
        return res.status(200).json({ success: true, message: 'Stall deleted successfully.', result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
// SCHEDULES
const getSchedules = async (req, res) => {
    try {
        const { eventId } = req.params;
        const schedules = await projectExpoService.getSchedules(eventId);
        return res.status(200).json({ success: true, schedules });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const upsertSchedule = async (req, res) => {
    try {
        const { eventId } = req.params;
        const data = { ...req.body, EventId: eventId };
        const result = await projectExpoService.upsertSchedule(data);
        return res.status(200).json({ success: true, message: 'Presentation schedule saved.', result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteSchedule = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const result = await projectExpoService.deleteSchedule(scheduleId);
        return res.status(200).json({ success: true, message: 'Schedule removed.', result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// CRITERIA & SCORES
const getCriteria = async (req, res) => {
    try {
        const { eventId } = req.params;
        const criteria = await projectExpoService.getCriteria(eventId);
        return res.status(200).json({ success: true, criteria });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const saveCriteria = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { criteria } = req.body;
        if (!Array.isArray(criteria)) return res.status(400).json({ success: false, message: 'Criteria list is required.' });
        const result = await projectExpoService.saveCriteria(eventId, criteria);
        return res.status(200).json({ success: true, message: 'Criteria saved successfully.', criteria: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getScores = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { teamId, judgeId } = req.query;
        const scores = await projectExpoService.getScores(eventId, teamId, judgeId);
        return res.status(200).json({ success: true, scores });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const submitScore = async (req, res) => {
    try {
        const { eventId } = req.params;
        const data = { ...req.body, EventId: eventId };
        const result = await projectExpoService.submitScore(data);
        return res.status(200).json({ success: true, message: 'Evaluation score recorded.', result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getJudges = async (req, res) => {
    try {
        const { eventId } = req.params;
        const judges = await projectExpoService.getJudges(eventId);
        return res.status(200).json({ success: true, judges, data: judges });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// RESULTS
const getRankings = async (req, res) => {
    try {
        const { eventId } = req.params;
        const rankings = await projectExpoService.getRankings(eventId);
        return res.status(200).json({ success: true, rankings });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getResults = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userRole = (req.user?.role || req.user?.Role || '').toLowerCase();
        const isAdmin = ['admin', 'superadmin', 'evaluator'].includes(userRole);
        const onlyPublished = req.query.all === 'true' && isAdmin ? false : !isAdmin;
        const results = await projectExpoService.getResults(eventId, onlyPublished);
        return res.status(200).json({ success: true, results });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const publishResults = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { winners } = req.body;
        if (!Array.isArray(winners)) return res.status(400).json({ success: false, message: 'Winners list is required.' });
        const results = await projectExpoService.publishResults(eventId, winners, req);
        return res.status(200).json({ success: true, message: 'Results published successfully.', results });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = {
    getConfig,
    saveConfig,
    updateStatus,
    getDomains,
    saveDomains,
    getSubmissions,
    getSubmissionByTeam,
    upsertSubmission,
    reviewSubmission,
    getBooths,
    batchGenerateBooths,
    allocateBooth,
    deallocateBooth,
    deleteBooth,
    getSchedules,
    upsertSchedule,
    deleteSchedule,
    getCriteria,
    saveCriteria,
    getScores,
    submitScore,
    getJudges,
    getRankings,
    getResults,
    publishResults
};
