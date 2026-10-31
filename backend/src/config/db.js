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
    `CREATE TABLE IF NOT EXISTS roles (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        RoleName VARCHAR(50) NOT NULL UNIQUE,
        Description VARCHAR(255),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `INSERT INTO roles (Id, RoleName, Description) VALUES
        (1, 'super_admin', 'Super Administrator'),
        (2, 'admin', 'Event Organizer / Admin'),
        (3, 'user', 'Participant / Student'),
        (4, 'evaluator', 'Evaluator / Judge')
    ON DUPLICATE KEY UPDATE RoleName = VALUES(RoleName), Description = VALUES(Description)`,

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

    `CREATE TABLE IF NOT EXISTS users (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserName VARCHAR(255) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        RoleId INT NOT NULL DEFAULT 3,
        EventId INT DEFAULT NULL,
        Mobile VARCHAR(50),
        Gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
        College VARCHAR(255),
        Location VARCHAR(255),
        State VARCHAR(100),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_role (RoleId),
        INDEX idx_users_event (EventId),
        FOREIGN KEY (RoleId) REFERENCES roles(Id),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE users ADD COLUMN IF NOT EXISTS RoleId INT NOT NULL DEFAULT 3`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS EventId INT DEFAULT NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS Photo LONGTEXT`,
    `ALTER TABLE users MODIFY COLUMN Mobile VARCHAR(25) NULL DEFAULT NULL`,
    `ALTER TABLE users MODIFY COLUMN Gender ENUM('Male', 'Female', 'Other') NULL DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS Posters LONGTEXT`,

    `CREATE TABLE IF NOT EXISTS registered_teams (
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
        FOREIGN KEY (TeamLeadUserId) REFERENCES users(Id) ON DELETE CASCADE,
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_registrations (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TeamId INT NOT NULL,
        ParticipationMode ENUM('Virtual', 'Physical') NOT NULL,
        Status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'approved',
        ProblemStatementId VARCHAR(100),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_reg_event (EventId),
        INDEX idx_reg_team (TeamId),
        UNIQUE KEY unique_team_event_mode (EventId, TeamId, ParticipationMode),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS problem_statements (
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

    `CREATE TABLE IF NOT EXISTS registered_team_members (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NULL DEFAULT NULL,
        TeamId INT NOT NULL,
        Role ENUM('TeamLead', 'TeamMember', 'teamlead', 'member') NOT NULL DEFAULT 'member',
        Gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
        MemberName VARCHAR(150) NULL DEFAULT NULL,
        MemberEmail VARCHAR(150) NULL DEFAULT NULL,
        MemberCollege VARCHAR(255) NULL DEFAULT NULL,
        MemberState VARCHAR(100) NULL DEFAULT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_team_members_user (UserId),
        INDEX idx_team_members_team (TeamId),
        FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

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
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS AccommodationEnabled TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS FoodEnabled TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS IDCardEnabled TINYINT(1) NOT NULL DEFAULT 0`,

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
    `ALTER TABLE event_prizes ADD COLUMN IF NOT EXISTS Track VARCHAR(50) DEFAULT 'Overall'`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualStatus ENUM('NOT_STARTED', 'LIVE', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED'`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualStartedAt DATETIME DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualMeetUrl VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS VirtualRegistrationOpen TINYINT(1) DEFAULT 1`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalRegistrationOpen TINYINT(1) DEFAULT 1`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS RegistrationOpen TINYINT(1) DEFAULT 1`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS AccommodationFee DECIMAL(10,2) NOT NULL DEFAULT 0.00`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS FoodFee DECIMAL(10,2) NOT NULL DEFAULT 0.00`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS FacilitiesPackageFee DECIMAL(10,2) NOT NULL DEFAULT 0.00`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS AdminUpiId VARCHAR(150) NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS AdminPaymentQr LONGTEXT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS AdminPaymentInstructions TEXT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS IdCardBackground VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS TeamCardBackground VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS PaymentRefId VARCHAR(150) NULL`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS PaymentReceiptUrl LONGTEXT NULL`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS PaymentNotes TEXT NULL`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS BookingStatus ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending'`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS AdminRemarks TEXT NULL`,
    `ALTER TABLE physical_team_preferences ADD COLUMN IF NOT EXISTS BookingCreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS event_timelines (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        Track ENUM('Virtual', 'Physical', 'General') NOT NULL DEFAULT 'General',
        TimelineDate VARCHAR(100) NOT NULL,
        Heading VARCHAR(255) NOT NULL,
        Description TEXT,
        OrderIndex INT DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_timeline_event (EventId),
        INDEX idx_timeline_track (Track),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS accommodation_blocks (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NULL,
        BlockName VARCHAR(100) NOT NULL,
        Gender ENUM('Boys', 'Girls') NOT NULL,
        Description VARCHAR(255) NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_block_gender (Gender),
        INDEX idx_block_event (EventId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS Accommodation (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BlockId INT NULL,
    room_num VARCHAR(20) NOT NULL UNIQUE,
    Type VARCHAR(50) NOT NULL,
    Gender ENUM('Girls', 'Boys') NOT NULL,
    Capacity INT NOT NULL,
    Occupied INT NOT NULL DEFAULT 0,
    UserId INT NULL,
    Status ENUM('Available', 'Occupied', 'Full', 'Maintenance')
        NOT NULL DEFAULT 'Available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_accommodation_gender (Gender),
    INDEX idx_accommodation_status (Status),
    INDEX idx_accommodation_block (BlockId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `ALTER TABLE Accommodation ADD COLUMN IF NOT EXISTS BlockId INT NULL`,

    `CREATE TABLE IF NOT EXISTS accommodation_allocations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    RoomId INT NOT NULL,
    TeamId INT NOT NULL,
    UserId INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_participant_accommodation (EventId, UserId),
    INDEX idx_accommodation_allocations_room (RoomId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoomId) REFERENCES Accommodation(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS participant_id_cards (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    UserId INT NOT NULL,
    IdCardNumber VARCHAR(50) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_participant (EventId, UserId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS physical_team_preferences (
    EventId INT NOT NULL,
    TeamId INT NOT NULL,
    AccommodationRequested TINYINT(1) NOT NULL DEFAULT 0,
    FoodAccepted TINYINT(1) NOT NULL DEFAULT 0,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (EventId, TeamId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS physical_food_tokens (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    TeamId INT NOT NULL,
    UserId INT NOT NULL,
    MealType ENUM('tiffin', 'lunch', 'dinner') NOT NULL,
    Token VARCHAR(40) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_user_meal (EventId, UserId, MealType),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
)`,
    `CREATE TABLE IF NOT EXISTS event_sponsors (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    LogoUrl LONGTEXT,
    Tier VARCHAR(100) DEFAULT 'Partner',
    WebsiteUrl VARCHAR(500) NULL,
    DisplayOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sponsor_event (EventId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS event_gallery (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    ImageUrl LONGTEXT NOT NULL,
    Caption VARCHAR(255) NULL,
    Season VARCHAR(100) DEFAULT 'Highlights',
    Year VARCHAR(50) NULL,
    DisplayOrder INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gallery_event (EventId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS evaluators (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Username VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    PlainTextPassword VARCHAR(255),
    Track ENUM('Physical', 'Virtual') NOT NULL DEFAULT 'Physical',
    College VARCHAR(255),
    Role VARCHAR(100) DEFAULT 'Technical Evaluator',
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_evaluator_event (EventId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS evaluation_rounds (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Track ENUM('Physical', 'Virtual') NOT NULL DEFAULT 'Physical',
    RoundOrder INT NOT NULL DEFAULT 1,
    RoundName VARCHAR(255) NOT NULL,
    Description TEXT,
    Status ENUM('Upcoming', 'Active', 'Completed') DEFAULT 'Active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_round_event (EventId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS evaluation_questions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    RoundId INT NOT NULL,
    QuestionText TEXT NOT NULL,
    MaxMarks INT NOT NULL DEFAULT 10,
    Description TEXT,
    QuestionOrder INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_question_round (RoundId),
    FOREIGN KEY (RoundId) REFERENCES evaluation_rounds(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS evaluation_scores (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Track ENUM('Physical', 'Virtual') NOT NULL DEFAULT 'Physical',
    RoundId INT NOT NULL,
    TeamId INT NOT NULL,
    EvaluatorId INT NOT NULL,
    ScoresData JSON,
    TotalScore DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    MaxPossibleScore DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    Feedback TEXT,
    Status ENUM('Draft', 'Submitted') NOT NULL DEFAULT 'Submitted',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_round_team_eval (RoundId, TeamId, EvaluatorId),
    INDEX idx_score_event (EventId),
    INDEX idx_score_round (RoundId),
    INDEX idx_score_team (TeamId),
    INDEX idx_score_eval (EvaluatorId),
    FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
    FOREIGN KEY (RoundId) REFERENCES evaluation_rounds(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (EvaluatorId) REFERENCES evaluators(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Problem Statement Management for Virtual Events
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS ThemePublished TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS ProblemStatementsPublished TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PSSelectionDeadline DATETIME DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PSMaxTeamsPerStatement INT NOT NULL DEFAULT 5`,

    `CREATE TABLE IF NOT EXISTS event_problem_statements (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        ProblemCode VARCHAR(100) NOT NULL,
        Title VARCHAR(500) NOT NULL,
        Description TEXT,
        Category VARCHAR(150) DEFAULT NULL,
        MaxTeams INT NOT NULL DEFAULT 5,
        DisplayOrder INT DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_eps_event (EventId),
        UNIQUE KEY unique_event_problem_code (EventId, ProblemCode),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS problem_statement_selections (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TeamId INT NOT NULL,
        ProblemStatementId INT NOT NULL,
        SelectionType ENUM('manual', 'auto') NOT NULL DEFAULT 'manual',
        SelectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event_team_ps (EventId, TeamId),
        INDEX idx_pss_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE,
        FOREIGN KEY (ProblemStatementId) REFERENCES event_problem_statements(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE event_problem_statements ADD COLUMN IF NOT EXISTS Theme VARCHAR(255) DEFAULT NULL`,

    `CREATE TABLE IF NOT EXISTS event_themes (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        ThemeName VARCHAR(255) NOT NULL,
        Description TEXT,
        DisplayOrder INT DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_et_event (EventId),
        UNIQUE KEY unique_event_theme (EventId, ThemeName),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE event_themes ADD COLUMN IF NOT EXISTS ImageUrl VARCHAR(500) DEFAULT NULL`,

    `ALTER TABLE physical_food_tokens ADD COLUMN IF NOT EXISTS IsRedeemed TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE physical_food_tokens ADD COLUMN IF NOT EXISTS RedeemedAt TIMESTAMP NULL DEFAULT NULL`,

    `CREATE TABLE IF NOT EXISTS hackathon_project_submissions (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TeamId INT NOT NULL,
        ProblemStatementId INT NULL,
        GithubRepoUrl VARCHAR(500) NULL,
        LiveDemoUrl VARCHAR(500) NULL,
        DrivePptUrl VARCHAR(500) NULL,
        TechStack VARCHAR(500) NULL,
        Description TEXT NULL,
        SubmittedByUserId INT NULL,
        SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event_team_sub (EventId, TeamId),
        INDEX idx_hps_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE,
        FOREIGN KEY (ProblemStatementId) REFERENCES event_problem_statements(Id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS password_reset_otps (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Email VARCHAR(255) NOT NULL,
        OtpHash VARCHAR(255) NOT NULL,
        ExpiresAt DATETIME NOT NULL,
        IsUsed TINYINT(1) NOT NULL DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pro_email (Email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_attendance (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        UserId INT NOT NULL,
        Status ENUM('not_checked_in', 'checked_in', 'checked_out') NOT NULL DEFAULT 'not_checked_in',
        CheckInTime DATETIME NULL,
        CheckOutTime DATETIME NULL,
        CheckedInBy VARCHAR(255) NULL,
        CheckedOutBy VARCHAR(255) NULL,
        Remarks VARCHAR(255) NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event_user_att (EventId, UserId),
        INDEX idx_att_event (EventId),
        INDEX idx_att_user (UserId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        FOREIGN KEY (UserId) REFERENCES users(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS event_broadcasts (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        SenderAdminId INT NULL,
        Subject VARCHAR(255) NOT NULL,
        Message TEXT NOT NULL,
        Category VARCHAR(50) DEFAULT 'Announcement',
        RecipientFilter VARCHAR(50) DEFAULT 'all',
        RecipientCount INT DEFAULT 0,
        SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_eb_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalPSMode VARCHAR(50) NOT NULL DEFAULT 'organizer_provided'`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalPSPublished TINYINT(1) NOT NULL DEFAULT 0`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalPSSelectionDeadline DATETIME DEFAULT NULL`,
    `ALTER TABLE events ADD COLUMN IF NOT EXISTS PhysicalPSMaxTeamsPerStatement INT NOT NULL DEFAULT 5`,

    `CREATE TABLE IF NOT EXISTS participant_problem_statements (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TeamId INT NOT NULL,
        ThemeName VARCHAR(255) NULL,
        Title VARCHAR(500) NOT NULL,
        Description TEXT,
        TechStack VARCHAR(500) NULL,
        Status ENUM('Pending', 'Approved', 'Needs_Revision') NOT NULL DEFAULT 'Approved',
        AdminRemarks TEXT NULL,
        SubmittedByUserId INT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event_team_pps (EventId, TeamId),
        INDEX idx_pps_event (EventId),
        INDEX idx_pps_team (TeamId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE,
        FOREIGN KEY (TeamId) REFERENCES registered_teams(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE participant_problem_statements ADD COLUMN IF NOT EXISTS Category VARCHAR(50) NOT NULL DEFAULT 'Software'`,
    `ALTER TABLE event_problem_statements ADD COLUMN IF NOT EXISTS Category VARCHAR(50) NOT NULL DEFAULT 'Software'`,

    `ALTER TABLE participant_id_cards ADD COLUMN IF NOT EXISTS VerificationToken VARCHAR(100) UNIQUE DEFAULT NULL`,
    `ALTER TABLE participant_id_cards ADD COLUMN IF NOT EXISTS TemplateId INT DEFAULT NULL`,
    `ALTER TABLE participant_id_cards ADD COLUMN IF NOT EXISTS FrontImageUrl VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE participant_id_cards ADD COLUMN IF NOT EXISTS BackImageUrl VARCHAR(500) DEFAULT NULL`,
    `ALTER TABLE participant_id_cards ADD COLUMN IF NOT EXISTS GeneratedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP`,

    `CREATE TABLE IF NOT EXISTS id_card_templates (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TemplateName VARCHAR(255) NOT NULL,
        Orientation ENUM('portrait', 'landscape') DEFAULT 'portrait',
        CardWidth DECIMAL(8,2) DEFAULT 85.60,
        CardHeight DECIMAL(8,2) DEFAULT 53.98,
        Unit VARCHAR(10) DEFAULT 'mm',
        FrontConfig LONGTEXT NOT NULL,
        BackConfig LONGTEXT DEFAULT NULL,
        IsDefault TINYINT(1) DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_id_templates_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS id_card_batches (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        EventId INT NOT NULL,
        TemplateId INT DEFAULT NULL,
        Status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        TotalParticipants INT DEFAULT 0,
        ProcessedCount INT DEFAULT 0,
        SuccessCount INT DEFAULT 0,
        FailedCount INT DEFAULT 0,
        SummaryText TEXT DEFAULT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_batches_event (EventId),
        FOREIGN KEY (EventId) REFERENCES events(Id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE id_card_templates ADD COLUMN IF NOT EXISTS CardType VARCHAR(50) NOT NULL DEFAULT 'id_card'`,

    `CREATE TABLE IF NOT EXISTS feedback (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserName VARCHAR(100) NOT NULL,
        EventName VARCHAR(255) NOT NULL,
        Category VARCHAR(100),
        Rating TINYINT NOT NULL,
        Comments TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS EventId INT NULL`,
    `ALTER TABLE feedback ADD COLUMN IF NOT EXISTS AdminId INT NULL`,

    `CREATE TABLE IF NOT EXISTS platform_feedback (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NULL,
        UserName VARCHAR(100) NOT NULL,
        UserEmail VARCHAR(150) NULL,
        Rating TINYINT NOT NULL,
        Category VARCHAR(100) DEFAULT 'General Experience',
        Comments TEXT NOT NULL,
        Status VARCHAR(20) DEFAULT 'approved',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                // Auto-sync missing UserIds and Genders for team members
                db.query(`
                    UPDATE registered_team_members tm
                    INNER JOIN users u ON LOWER(u.Email) = LOWER(tm.MemberEmail)
                    SET tm.UserId = u.Id
                    WHERE tm.UserId IS NULL
                `, () => {});
                db.query(`
                    UPDATE users u
                    INNER JOIN registered_team_members tm ON tm.UserId = u.Id
                    SET u.Gender = COALESCE(NULLIF(u.Gender, ''), tm.Gender),
                        u.College = COALESCE(NULLIF(u.College, ''), tm.MemberCollege)
                    WHERE u.Gender IS NULL OR u.Gender = '' OR u.College IS NULL OR u.College = ''
                `, () => {});
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