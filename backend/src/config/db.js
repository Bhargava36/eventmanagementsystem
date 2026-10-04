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
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
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
        VirtualStartDate VARCHAR(100),
        VirtualEndDate VARCHAR(100),
        PhysicalStartDate VARCHAR(100),
        PhysicalEndDate VARCHAR(100),
        VirtualFacilities TEXT,
        VirtualRequirements TEXT,
        PhysicalFacilities TEXT,
        PhysicalRequirements TEXT,
        PrimaryColor VARCHAR(50),
        SecondaryColor VARCHAR(50),
        TertiaryColor VARCHAR(50),
        PrimaryTextColor VARCHAR(50),
        SecondaryTextColor VARCHAR(50),
        TertiaryTextColor VARCHAR(50),
        Posters LONGTEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

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
    Mobile VARCHAR(50),
    College VARCHAR(255),
    Location VARCHAR(255),
    State VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE users ADD COLUMN if not exists Gender ENUM('Male', 'Female', 'Other') NOT NULL `,

    `ALTER TABLE events ADD COLUMN if not exists Posters LONGTEXT`,

    `CREATE TABLE IF NOT EXISTS teams (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(255) NOT NULL,
    TeamLeadUserId INT NOT NULL,
    TeamSize INT NOT NULL,
    College VARCHAR(255),
    State VARCHAR(100),
    ProblemStatementId VARCHAR(100),
    Tech_Stack VARCHAR(255),
    EventId INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_teams_lead (TeamLeadUserId),
    INDEX idx_teams_event (EventId),
    FOREIGN KEY (TeamLeadUserId) REFERENCES users(Id) ON DELETE RESTRICT,
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_registrations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    TeamId INT NOT NULL,
    ParticipationMode ENUM('Virtual', 'Physical') NOT NULL,
    Status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    ProblemStatementId VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reg_event (EventId),
    INDEX idx_reg_team (TeamId),
    UNIQUE KEY unique_team_event_mode (EventId, TeamId, ParticipationMode),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES teams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS problemstatements (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        ProblemCode VARCHAR(50) NOT NULL UNIQUE,
        ProblemStatement TEXT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_prizes (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        PrizeRank INT NOT NULL,
        Prize VARCHAR(500) NOT NULL,
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        UNIQUE (EventId, PrizeRank)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS team_members (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NOT NULL,
        TeamId INT NOT NULL,
        Role ENUM('TeamLead', 'TeamMember') NOT NULL DEFAULT 'TeamMember',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_team (UserId, TeamId),
        INDEX idx_team_members_user (UserId),
        INDEX idx_team_members_team (TeamId),
        FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES teams(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE team_members ADD COLUMN if not exists Gender ENUM('Male', 'Female', 'Other') NOT NULL `,

    `CREATE TABLE IF NOT EXISTS event_core_team (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Role VARCHAR(100) NOT NULL,
    Name VARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Department VARCHAR(100) NOT NULL,
    Type ENUM('faculty', 'student') NOT NULL,
    StudentCoordinators INT NOT NULL DEFAULT 0,
    FacultyCoordinators INT NOT NULL DEFAULT 0,
    Volunteers INT NOT NULL DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualStartDate VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualEndDate VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalStartDate VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalEndDate VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualRegistrationStart VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualRegistrationEnd VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalRegistrationStart VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalRegistrationEnd VARCHAR(100)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualFacilities TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualRequirements TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalFacilities TEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalRequirements TEXT`,

    `CREATE TABLE IF NOT EXISTS event_descriptions (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        Description TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event_desc (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_facilities (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        Phase ENUM('Virtual', 'Physical', 'General') DEFAULT 'General',
        Facility TEXT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fac_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_requirements (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        Phase ENUM('Virtual', 'Physical', 'General') DEFAULT 'General',
        Requirement TEXT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_req_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE event_core_team ADD COLUMN IF NOT EXISTS Photo LONGTEXT`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PrizeMoney VARCHAR(255)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualPrizeMoney VARCHAR(255)`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalPrizeMoney VARCHAR(255)`,
    `ALTER TABLE event_prizes ADD COLUMN IF NOT EXISTS Track VARCHAR(50) DEFAULT 'Overall'`
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