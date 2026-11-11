const express = require('express');
const router = express.Router();
const projectExpoController = require('./projectExpoController');
const { optionalAuth } = require('../../middleware/authmiddleware');
router.use(optionalAuth);
// 1. Config & Lifecycle
router.get('/:eventId/config', projectExpoController.getConfig);
router.post('/:eventId/config', projectExpoController.saveConfig);
router.put('/:eventId/config', projectExpoController.saveConfig);
router.patch('/:eventId/config', projectExpoController.saveConfig);
router.put('/:eventId/status', projectExpoController.updateStatus);
router.patch('/:eventId/status', projectExpoController.updateStatus);
router.post('/:eventId/status', projectExpoController.updateStatus);
// 2. Domains
router.get('/:eventId/domains', projectExpoController.getDomains);
router.post('/:eventId/domains', projectExpoController.saveDomains);
router.put('/:eventId/domains', projectExpoController.saveDomains);
router.patch('/:eventId/domains', projectExpoController.saveDomains);
// 3. Submissions
router.get('/:eventId/submissions', projectExpoController.getSubmissions);
router.get('/:eventId/submissions/:teamId', projectExpoController.getSubmissionByTeam);
router.post('/:eventId/submissions', projectExpoController.upsertSubmission);
router.put('/:eventId/submissions', projectExpoController.upsertSubmission);
router.put('/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.patch('/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.post('/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.put('/:eventId/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.patch('/:eventId/submissions/:submissionId/review', projectExpoController.reviewSubmission);
router.post('/:eventId/submissions/:submissionId/review', projectExpoController.reviewSubmission);
// 4. Booths
router.get('/:eventId/booths', projectExpoController.getBooths);
router.post('/:eventId/booths/generate', projectExpoController.batchGenerateBooths);
router.post('/:eventId/booths/batch-generate', projectExpoController.batchGenerateBooths);
router.post('/booths/:boothId/allocate', projectExpoController.allocateBooth);
router.post('/:eventId/booths/:boothId/allocate', projectExpoController.allocateBooth);
router.delete('/booths/:boothId/deallocate', projectExpoController.deallocateBooth);
router.post('/booths/:boothId/deallocate', projectExpoController.deallocateBooth);
router.delete('/:eventId/booths/:boothId/deallocate', projectExpoController.deallocateBooth);
router.post('/:eventId/booths/:boothId/deallocate', projectExpoController.deallocateBooth);
router.delete('/booths/:boothId', projectExpoController.deleteBooth);
router.delete('/:eventId/booths/:boothId', projectExpoController.deleteBooth);
// 5. Presentation Schedules
router.get('/:eventId/schedules', projectExpoController.getSchedules);
router.post('/:eventId/schedules', projectExpoController.upsertSchedule);
router.put('/:eventId/schedules', projectExpoController.upsertSchedule);
router.delete('/schedules/:scheduleId', projectExpoController.deleteSchedule);
router.post('/schedules/:scheduleId/delete', projectExpoController.deleteSchedule);
router.delete('/:eventId/schedules/:scheduleId', projectExpoController.deleteSchedule);
router.post('/:eventId/schedules/:scheduleId/delete', projectExpoController.deleteSchedule);
// 6. Evaluation Criteria, Scores & Judges
router.get('/:eventId/criteria', projectExpoController.getCriteria);
router.post('/:eventId/criteria', projectExpoController.saveCriteria);
router.put('/:eventId/criteria', projectExpoController.saveCriteria);
router.get('/:eventId/scores', projectExpoController.getScores);
router.post('/:eventId/scores', projectExpoController.submitScore);
router.put('/:eventId/scores', projectExpoController.submitScore);
router.get('/:eventId/judges', projectExpoController.getJudges);
// 7. Results & Leaderboards
router.get('/:eventId/rankings', projectExpoController.getRankings);
router.get('/:eventId/results', projectExpoController.getResults);
router.post('/:eventId/results/publish', projectExpoController.publishResults);
router.put('/:eventId/results/publish', projectExpoController.publishResults);
module.exports = router;
