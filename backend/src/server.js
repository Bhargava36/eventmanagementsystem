const express = require('express');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

require('./config/db');

const superAdminRoute = require("./modules/superAdmin/superAdminRoute");
const eventsRoute = require("./modules/events/eventsRoute");
const adminRoute = require("./modules/admins/adminRoute");

const app = express();

app.use(express.json());

app.use('/api/super_admin', superAdminRoute);

app.use('/api/events', eventsRoute);

app.use('/api/admin', adminRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

