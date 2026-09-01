const mysql = require('mysql2');
require('dotenv').config();



const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port : Number(process.env.DB_PORT)
});

db.connect((err) => {
    if (err) {
        console.log("database connection failed");
        console.log(err);
    } else {
        console.log("connected to the database successfully");
    }
});

module.exports = db;