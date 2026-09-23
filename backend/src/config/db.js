const mysql = require('mysql2');
require('dotenv').config();

 const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
});

const migrationQueries = [
    `CREATE TABLE IF NOT EXISTS superadmin (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        PhoneNumber VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS events (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventName VARCHAR(255) NOT NULL,
        Description TEXT,
        Facilities TEXT,
        Requirements TEXT,
        TeamSize VARCHAR(50),
        StartDate VARCHAR(100),
        EndDate VARCHAR(100),
        RegistrationStart VARCHAR(100),
        RegistrationEnd VARCHAR(100),
        Location VARCHAR(255),
        EventType VARCHAR(100),
        EventStatus VARCHAR(100) DEFAULT 'upcoming',
        HackathonMode VARCHAR(100),
        PrimaryColor VARCHAR(50),
        SecondaryColor VARCHAR(50),
        TertiaryColor VARCHAR(50),
        PrimaryTextColor VARCHAR(50),
        SecondaryTextColor VARCHAR(50),
        TertiaryTextColor VARCHAR(50),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE events 
        ADD COLUMN IF NOT EXISTS Facilities TEXT,
        ADD COLUMN IF NOT EXISTS Requirements TEXT,
        ADD COLUMN IF NOT EXISTS TeamSize VARCHAR(50)`,

    `CREATE TABLE IF NOT EXISTS admins (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        AdminName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Mobile VARCHAR(50),
        EventId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admins_event (EventId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS users (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        College VARCHAR(255),
        Location VARCHAR(255),
        State VARCHAR(100),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS teams (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        TeamLead VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        TeamSize VARCHAR(50),
        College VARCHAR(255),
        State VARCHAR(100),
        PhoneNumber VARCHAR(50),
        TeamName VARCHAR(255) NOT NULL,
        ProblemStatementId VARCHAR(100),
        Tech_Stack VARCHAR(255),
        EventId INT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_teams_event (EventId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_registrations (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        TeamLead VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        TeamSize INT,
        College VARCHAR(255),
        State VARCHAR(100),
        PhoneNumber VARCHAR(50),
        TeamName VARCHAR(255) NOT NULL,
        Tech_Stack VARCHAR(100),
        EventId INT,
        STATUS VARCHAR(50) DEFAULT 'pending',
        ProblemStatementId VARCHAR(100),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_reg_event (EventId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS problemstatements (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        ProblemCode VARCHAR(50) NOT NULL UNIQUE,
        ProblemStatement TEXT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS teammembers (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Role VARCHAR(100),
        PhoneNumber VARCHAR(50),
        TeamId INT,
        Gender VARCHAR(50),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_members_team (TeamId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

let isMigrating = false;

const migrate = () => {
    if (isMigrating) return Promise.resolve();
    isMigrating = true;
    return new Promise((resolve, reject) => {
        const runQuery = (index) => {
            if (index >= migrationQueries.length) {
                isMigrating = false;
                console.log('Database tables migrated successfully');
                return resolve();
            }
            db.query(migrationQueries[index], (err) => {
                if (err) {
                    isMigrating = false;
                    console.error('Migration query failed:', err.message);
                    return reject(err);
                }
                runQuery(index + 1);
            });
        };
        runQuery(0);
    });
};

db.migrate = migrate;

db.getConnection((err, connection) => {
    if (err) {
        console.log("database connection failed");
        console.log(err);
    } else {
        console.log("connected to the database successfully");
        connection.release();
        if (require.main !== module) {
            migrate().catch((error) => {
                console.error("Migration error:", error.message);
            });
        }
    }
});

if (require.main === module) {
    migrate()
        .then(() => {
            console.log("Migration complete");
            db.end();
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration failed:", err);
            db.end();
            process.exit(1);
        });
}

module.exports = db;