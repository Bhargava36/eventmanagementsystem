const express = require('express');
const cors = require('cors');

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

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use('/api/super_admin', superAdminRoute);
app.use('/api/events', eventsRoute);
app.use('/api/admin', adminRoute);
app.use('/api/teams', teamRoute);
app.use('/api/members', memRoute);
app.use('/api/users', userRoute);
app.use('/api/event_reg', eventRegRoute);
app.use("/api/event_prizes", prizesRoute);
app.use("/api/core_team", coreTeamRoute);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});