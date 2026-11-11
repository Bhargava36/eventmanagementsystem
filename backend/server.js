const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./src/config/db');
const superAdminRoute = require("./src/modules/superAdmin/superAdminRoute");
const eventsRoute = require("./src/modules/events/eventsRoute");
const adminRoute = require("./src/modules/admins/adminRoute");
const teamRoute = require("./src/modules/teams/teamsRoute");
const memRoute = require("./src/modules/team_members/memRoute");
const userRoute = require("./src/modules/users/usersRoute");
const eventRegRoute = require("./src/modules/event_registrations/e_resRoutes");
const prizesRoute = require("./src/modules/prize_money/prizeRoute");
const coreTeamRoute = require("./src/modules/core_team/coreRoutes");
const uploadRoute = require("./src/modules/upload/uploadRoute");
const rolesRoute = require("./src/modules/roles/rolesRoute");
const timelineRoutes = require("./src/modules/event_timelines/timelineRoutes");
const accRoutes = require( "./src/modules/accommodation/accRoute");
const idCardRoutes = require("./src/modules/id_cards/idRoutes");
const physicalServicesRoutes = require("./src/modules/physical_services/physicalServicesRoute");
const sponsorRoutes = require("./src/modules/sponsors/sponsorRoutes");
const galleryRoutes = require("./src/modules/gallery/galleryRoutes");
const devRoute = require("./src/modules/dev/devRoute");
const evaluatorRoutes = require("./src/modules/evaluators/evaluatorRoutes");
const psRoutes = require("./src/modules/problem_statements/psRoutes");
const projectSubmissionRoutes = require("./src/modules/project_submissions/projectSubmissionRoute");
const feedbackRoutes = require("./src/modules/feedback/feedbackRoute");
const platformFeedbackRoutes = require("./src/modules/platform_feedback/platformFeedbackRoute");
const workshopRoutes = require("./src/modules/workshops/workshopRoute");
const webinarRoutes = require("./src/modules/webinars/webinarRoute");
const seminarRoutes = require("./src/modules/seminars/seminarRoute");
const alumniRoutes = require("./src/modules/alumni/alumniRoute");
const projectExpoRoute = require("./src/modules/project_expo/projectExpoRoute");
const logsRoute = require("./src/modules/logs/logsRoute");
const auditMiddleware = require("./src/middleware/auditMiddleware");
const emailDispatchRoute = require("./src/modules/email_dispatch/emailDispatchRoute");
const backupRoute = require("./src/modules/backup/backupRoute");
const webhookRoute = require("./src/modules/webhooks/webhookRoute");
const notificationRoutes = require("./src/modules/notifications/notificationRoute");
const securityRoute = require("./src/modules/security/securityRoute");
const securityHeaders = require("./src/middleware/securityHeaders");
const { globalLimiter } = require("./src/middleware/rateLimiter");
const dbCircuitBreaker = require("./src/modules/security/dbCircuitBreaker");
const app = express();
app.use(cors());
app.use(securityHeaders);
app.use('/api', globalLimiter);
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/security/monitoring') || req.path.startsWith('/security/health') || req.path.startsWith('/security/database-health')) {
        return next();
    }
    dbCircuitBreaker.middleware()(req, res, next);
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(auditMiddleware);
// Serve uploaded files statically with explicit CORS (e.g. http://localhost:3000/uploads/images/...)
app.use('/uploads', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
}, express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoute);
app.use('/api/super_admin', superAdminRoute);
app.use('/api/events', eventsRoute);
app.use('/api/admin', adminRoute);
app.use('/api/teams', teamRoute);
app.use('/api/members', memRoute);
app.use('/api/users', userRoute);
app.use('/api/event_reg', eventRegRoute);
app.use("/api/event_prizes", prizesRoute);
app.use("/api/core_team", coreTeamRoute);
app.use("/api/roles", rolesRoute);
app.use("/api/event_timelines", timelineRoutes);
app.use("/api/accommodation", accRoutes);
app.use("/api/id-cards", idCardRoutes);
app.use("/api/physical-services", physicalServicesRoutes);
app.use("/api/sponsors", sponsorRoutes);
app.use("/api/gallery", galleryRoutes);
if (process.env.NODE_ENV !== 'production') {
    app.use("/api/dev", devRoute);
}
app.use("/api/evaluators", evaluatorRoutes);
app.use("/api/problem-statements", psRoutes);
app.use("/api/project-submissions", projectSubmissionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/platform-feedback', platformFeedbackRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/seminars', seminarRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/project-expo', projectExpoRoute);
app.use('/api/logs', logsRoute);
app.use('/api/super_admin/logs', logsRoute);
app.use('/api/email-dispatch', emailDispatchRoute);
app.use('/api/database-backups', backupRoute);
app.use('/api/webhooks', webhookRoute);
app.use('/api/notifications', notificationRoutes);
app.use('/api/security', securityRoute);
const http = require('http');
const { initWebSocket } = require('./src/config/websocket');
const db = require('./src/config/db');
const { flushLogs } = require('./src/modules/logs/loggerService');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initWebSocket(server);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Graceful process termination & connection pool cleanup
const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    // 1. Flush any pending buffered audit logs
    try {
        await flushLogs();
        console.log('[Server] Pending audit logs flushed.');
    } catch (e) {
        console.error('[Server] Error flushing audit logs:', e.message);
    }
    // 2. Stop accepting new HTTP requests
    server.close((err) => {
        if (err) {
            console.error('[Server] Error closing HTTP server:', err.message);
        } else {
            console.log('[Server] HTTP/WebSocket server closed.');
        }
        // 3. Close MySQL Connection Pool
        db.end((dbErr) => {
            if (dbErr) {
                console.error('[Server] Error closing MySQL pool:', dbErr.message);
            } else {
                console.log('[Server] MySQL connection pool drained and closed.');
            }
            process.exit(0);
        });
    });
    // Force exit if shutdown hangs beyond 10s
    setTimeout(() => {
        console.error('[Server] Graceful shutdown timed out. Forcing process exit.');
        process.exit(1);
    }, 10000).unref();
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
