const express = require('express');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

require('./config/db');

const superAdminRoute = require("./modules/superAdmin/superAdminRoute");

const app = express();

app.use(express.json());

app.use('/api/super_admin', superAdminRoute);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

