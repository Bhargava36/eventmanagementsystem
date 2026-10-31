const express = require('express');
const router = express.Router();
const evaluatorController = require('./evaluatorController');

// Evaluators routes
router.get('/event/:eventId', evaluatorController.getEvaluatorsByEvent);
router.post('/', evaluatorController.createEvaluator);
router.put('/:id', evaluatorController.updateEvaluator);
router.delete('/:id', evaluatorController.deleteEvaluator);
router.post('/login', evaluatorController.evaluatorLogin);
router.get("/", evaluatorController.getAllEvaluators);

// Rounds routes
router.get('/event/:eventId/rounds', evaluatorController.getEvaluationRounds);
router.post('/rounds', evaluatorController.createEvaluationRound);
router.put('/rounds/:id', evaluatorController.updateEvaluationRound);
router.delete('/rounds/:id', evaluatorController.deleteEvaluationRound);

// Questions routes
router.post('/rounds/:roundId/questions', evaluatorController.createEvaluationQuestion);
router.put('/questions/:id', evaluatorController.updateEvaluationQuestion);
router.delete('/questions/:id', evaluatorController.deleteEvaluationQuestion);

// Scoring & Team Evaluation routes
router.get('/event/:eventId/teams', evaluatorController.getTeamsForEvaluation);
router.get('/rounds/:roundId/scores', evaluatorController.getScoresForRound);
router.post('/scores', evaluatorController.saveEvaluationScore);
router.get('/event/:eventId/results', evaluatorController.getEventResults);

// Publishing Results routes
router.put('/rounds/:roundId/publish', evaluatorController.publishRoundResults);
router.put('/event/:eventId/publish-overall', evaluatorController.publishOverallResults);
router.get('/teams/:teamId/published-results', evaluatorController.getTeamPublishedResults);

module.exports = router;
