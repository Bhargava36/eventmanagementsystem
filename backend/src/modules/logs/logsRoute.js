const express = require('express');
const router = express.Router();
const logsController = require('./logsController');
// Retrieve paginated & filtered logs
router.get('/', logsController.getLogsController);
// Export logs to CSV or JSON
router.get('/export', logsController.exportLogsController);
// Retention cleanup
router.delete('/cleanup', logsController.cleanupLogsController);
module.exports = router;
