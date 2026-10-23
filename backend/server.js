const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
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

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use("/api/dev", devRoute);
app.use("/api/evaluators", evaluatorRoutes);
app.use("/api/problem-statements", psRoutes);
app.use("/api/project-submissions", projectSubmissionRoutes);


const http = require('http');
const { initWebSocket } = require('./src/config/websocket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});