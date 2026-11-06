const express = require('express');
const router = express.Router();
const controller = require('./backupController');

router.get('/stats', controller.getStats);
router.get('/download/sql', controller.downloadSqlBackup);
router.get('/download/json', controller.downloadJsonBackup);
router.post('/snapshot', controller.createSnapshot);
router.delete('/:id', controller.deleteBackupItem);

module.exports = router;

