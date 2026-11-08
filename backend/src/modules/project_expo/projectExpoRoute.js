const express = require('express');
const router = express.Router();
const projectExpoController = require('./projectExpoController');

// Config & Lifecycle
router.get('/:eventId/config', projectExpoController.getConfig);
router.post('/:eventId/config', projectExpoController.saveConfig);
router.put('/:eventId/config', projectExpoController.saveConfig);
router.patch('/:eventId/config', projectExpoController.saveConfig);
router.put('/:eventId/status', projectExpoController.updateStatus);
router.patch('/:eventId/status', projectExpoController.updateStatus);

// Domains
router.get('/:eventId/domains', projectExpoController.getDomains);
router.post('/:eventId/domains', projectExpoController.saveDomains);

// Submissions
router.get('/:eventId/submissions', projectExpoController.getSubmissions);
router.get('/:eventId/submissions/:teamId', projectExpoController.getSubmissionByTeam);
router.post('/:eventId/submissions', projectExpoController.upsertSubmission);
router.put('/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.patch('/submissions/:submissionId/review', projectExpoController.reviewSubmission);

// Booths
router.get('/:eventId/booths', projectExpoController.getBooths);
router.post('/:eventId/booths/generate', projectExpoController.batchGenerateBooths);
router.post('/booths/:boothId/allocate', projectExpoController.allocateBooth);
router.delete('/booths/:boothId/deallocate', projectExpoController.deallocateBooth);

// Schedules
router.get('/:eventId/schedules', projectExpoController.getSchedules);
router.post('/:eventId/schedules', projectExpoController.upsertSchedule);
router.delete('/schedules/:scheduleId', projectExpoController.deleteSchedule);

// Evaluation Criteria & Scores & Judges
router.get('/:eventId/criteria', projectExpoController.getCriteria);
router.post('/:eventId/criteria', projectExpoController.saveCriteria);
router.get('/:eventId/scores', projectExpoController.getScores);
router.post('/:eventId/scores', projectExpoController.submitScore);
router.get('/:eventId/judges', projectExpoController.getJudges);

// Results & Leaderboards
router.get('/:eventId/rankings', projectExpoController.getRankings);
router.get('/:eventId/results', projectExpoController.getResults);
router.post('/:eventId/results/publish', projectExpoController.publishResults);

module.exports = router;

