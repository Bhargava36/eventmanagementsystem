const express = require('express');
const router = express.Router();
const securityController = require('./securityController');
const { authenticateToken, authorizeRoles } = require('../../middleware/authmiddleware');
// 0. Public Challenges & Verification (No Auth Required)
router.get('/captcha', securityController.getCaptcha);
router.post('/2fa/verify-login', securityController.verifyLogin2FA);
// 1. Two-Factor Authentication Settings (Any Authenticated User)
router.get('/2fa/status', authenticateToken, securityController.get2FAStatus);
router.post('/2fa/request-enable', authenticateToken, securityController.requestEnable2FA);
router.post('/2fa/confirm-enable', authenticateToken, securityController.confirmEnable2FA);
router.post('/2fa/disable', authenticateToken, securityController.disable2FA);
// 2. User Session Management (Any Authenticated User)
router.get('/sessions', authenticateToken, securityController.getMySessions);
router.get('/all-sessions', authenticateToken, authorizeRoles('super_admin'), securityController.getAllSessions);
router.delete('/sessions/:sessionId', authenticateToken, securityController.revokeSession);
router.post('/logout', authenticateToken, securityController.logoutCurrentSession);
router.post('/logout-all', authenticateToken, securityController.logoutAllSessions);
// 3. Security Center (Strictly Super Admin)
router.get('/overview', authenticateToken, authorizeRoles('super_admin'), securityController.getSecurityOverview);
router.get('/alerts', authenticateToken, authorizeRoles('super_admin'), securityController.getSecurityAlerts);
router.patch('/alerts/:alertId/status', authenticateToken, authorizeRoles('super_admin'), securityController.updateAlertStatus);
router.get('/login-history', authenticateToken, authorizeRoles('super_admin'), securityController.getLoginHistory);
router.get('/locked-accounts', authenticateToken, authorizeRoles('super_admin'), securityController.getLockedAccounts);
router.post('/unlock-account', authenticateToken, authorizeRoles('super_admin'), securityController.unlockAccount);
router.post('/unlock-all-accounts', authenticateToken, authorizeRoles('super_admin'), securityController.unlockAllAccounts);
// 3. Audit Logs (Super Admin + Scoped Event Admins)
router.get('/audit-logs', authenticateToken, authorizeRoles('super_admin', 'admin'), securityController.getAuditLogs);
router.get('/audit-logs/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), securityController.getAuditLogById);
// 4. System Monitoring Telemetry (Super Admin)
router.get('/monitoring/health', authenticateToken, authorizeRoles('super_admin'), securityController.getSystemHealth);
router.get('/database-health', authenticateToken, authorizeRoles('super_admin'), securityController.getDatabaseHealth);
module.exports = router;
