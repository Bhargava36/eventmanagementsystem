const express = require('express');
const cors  = require('cors');
require('dotenv').config();

// const path = require('path');
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

require('./src/config/db');

const superAdminRoute = require("./src/modules/superAdmin/superAdminRoute");
const eventsRoute = require("./src/modules/events/eventsRoute");
const adminRoute = require("./src/modules/admins/adminRoute");
const teamRoute = require("./src/modules/teams/teamsRoute");
const memRoute = require("./src/modules/teammembers/memRoute");

const app = express();

app.use(express.json());

app.use(cors());

app.use('/api/super_admin', superAdminRoute);

app.use('/api/events', eventsRoute);

app.use('/api/admin', adminRoute);

app.use('/api/teams', teamRoute);

app.use('/api/members', memRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

