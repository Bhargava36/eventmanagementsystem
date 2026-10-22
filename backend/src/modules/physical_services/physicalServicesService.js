const { randomBytes } = require("crypto");
const db = require("../../config/db");

const getTeamPreference = async (teamId, userId) => {
    const [rows] = await db.promise().query(
        `SELECT 
            t.Id AS TeamId, 
            t.TeamLeadUserId, 
            t.EventId, 
            t.TeamName, 
            er.ParticipationMode, 
            er.Status AS RegistrationStatus, 
            e.EventName, 
            e.AccommodationEnabled, 
            e.FoodEnabled,
            e.AccommodationFee,
            e.FoodFee,
            e.FacilitiesPackageFee,
            e.AdminUpiId,
            e.AdminPaymentQr,
            e.AdminPaymentInstructions,
            (SELECT COUNT(*) FROM registered_team_members tm WHERE tm.TeamId = t.Id) AS MemberCount,
            COALESCE(p.AccommodationRequested, 0) AS AccommodationRequested, 
            COALESCE(p.FoodAccepted, 0) AS FoodAccepted, 
            (p.TeamId IS NOT NULL) AS PreferencesSubmitted,
            p.TotalAmount,
            p.PaymentRefId,
            p.PaymentReceiptUrl,
            p.PaymentNotes,
            COALESCE(p.BookingStatus, 'Pending') AS BookingStatus,
            p.AdminRemarks,
            p.BookingCreatedAt
        FROM registered_teams t 
        INNER JOIN events e ON e.Id = t.EventId 
        INNER JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId 
        LEFT JOIN physical_team_preferences p ON p.EventId = t.EventId AND p.TeamId = t.Id 
        INNER JOIN registered_team_members member ON member.TeamId = t.Id AND member.UserId = ? 
        WHERE t.Id = ? 
        LIMIT 1`, 
        [userId, teamId]
    );
    return rows[0] || null;
};

const saveTeamPreference = async (teamId, userId, accommodationRequested, foodAccepted, bookingDetails = {}) => {
    const [teams] = await db.promise().query(
        `SELECT
            t.EventId,
            t.TeamLeadUserId,
            er.ParticipationMode,
            er.Status AS RegistrationStatus,
            e.AccommodationEnabled,
            e.FoodEnabled
        FROM registered_teams t
        INNER JOIN events e ON e.Id = t.EventId
        INNER JOIN event_registrations er
            ON er.TeamId = t.Id AND er.EventId = t.EventId
        WHERE t.Id = ?
        LIMIT 1`,
        [teamId]
    );
    const team = teams[0];
    if (!team) {
        const error = new Error("Team registration was not found.");
        error.status = 404;
        throw error;
    }
    if (Number(team.TeamLeadUserId) !== Number(userId)) {
        const error = new Error("Only the team lead can update these choices.");
        error.status = 403;
        throw error;
    }

    if (
        String(team.ParticipationMode).toLowerCase() !== "physical" ||
        String(team.RegistrationStatus).toLowerCase() !== "approved"
    ) {
        const error = new Error(
            "Only approved physical registrations can select these services."
        );
        error.status = 403;
        throw error;
    }
    // Unified Food & Accommodation preference: they are requested together
    const unifiedRequest = Boolean(accommodationRequested || foodAccepted);

    if (unifiedRequest && Number(team.AccommodationEnabled) !== 1 && Number(team.FoodEnabled) !== 1) {
        const error = new Error("Food & Accommodation selection is not enabled for this event.");
        error.status = 403;
        throw error;
    }

    const {
        totalAmount = 0,
        paymentRefId = '',
        paymentReceiptUrl = '',
        paymentNotes = ''
    } = bookingDetails;

    await db.promise().query(
        `INSERT INTO physical_team_preferences
            (EventId, TeamId, AccommodationRequested, FoodAccepted, TotalAmount, PaymentRefId, PaymentReceiptUrl, PaymentNotes, BookingStatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        ON DUPLICATE KEY UPDATE
            AccommodationRequested = VALUES(AccommodationRequested),
            FoodAccepted = VALUES(FoodAccepted),
            TotalAmount = VALUES(TotalAmount),
            PaymentRefId = VALUES(PaymentRefId),
            PaymentReceiptUrl = VALUES(PaymentReceiptUrl),
            PaymentNotes = VALUES(PaymentNotes),
            BookingStatus = 'Pending'`,
        [
            team.EventId,
            teamId,
            unifiedRequest ? 1 : 0,
            unifiedRequest ? 1 : 0,
            Number(totalAmount) || 0,
            paymentRefId ? String(paymentRefId).trim() : null,
            paymentReceiptUrl ? String(paymentReceiptUrl).trim() : null,
            paymentNotes ? String(paymentNotes).trim() : null
        ]
    );

    return getTeamPreference(teamId, userId);
};

const getFoodParticipants = async (eventId) => {
    const [events] = await db.promise().query(
        "SELECT FoodEnabled, AccommodationEnabled FROM events WHERE Id = ?",
        [eventId]
    );
    if (!events[0]) {
        const error = new Error("Event was not found.");
        error.status = 404;
        throw error;
    }
    if (Number(events[0].FoodEnabled) !== 1 && Number(events[0].AccommodationEnabled) !== 1) {
        const error = new Error("Food selection is not enabled for this event.");
        error.status = 403;
        throw error;
    }

    const [participants] = await db.promise().query(
        `SELECT DISTINCT
            t.Id AS TeamId,
            t.TeamName,
            t.College,
            t.State,
            lead.UserName AS TeamLeadName,
            lead.Email AS TeamLeadEmail,
            member.UserId,
            member.Id AS TeamMemberId,
            COALESCE(NULLIF(member.MemberName, ''), participant.UserName, 'Member') AS ParticipantName,
            COALESCE(NULLIF(member.MemberEmail, ''), participant.Email, '') AS Email,
            COALESCE(NULLIF(member.MemberCollege, ''), participant.College, t.College, '') AS ParticipantCollege,
            COALESCE(NULLIF(member.Gender, ''), participant.Gender, 'Male') AS Gender,
            tiffin.Token AS TiffinToken,
            lunch.Token AS LunchToken,
            dinner.Token AS DinnerToken
        FROM physical_team_preferences preference
        INNER JOIN registered_teams t ON t.Id = preference.TeamId
        INNER JOIN event_registrations registration
            ON registration.EventId = preference.EventId
            AND registration.TeamId = preference.TeamId
            AND registration.ParticipationMode = 'Physical'
            AND registration.Status = 'approved'
        INNER JOIN registered_team_members member ON member.TeamId = t.Id
        LEFT JOIN users participant ON participant.Id = member.UserId
        INNER JOIN users lead ON lead.Id = t.TeamLeadUserId
        LEFT JOIN physical_food_tokens tiffin
            ON tiffin.EventId = preference.EventId
            AND tiffin.UserId = member.UserId
            AND tiffin.MealType = 'tiffin'
        LEFT JOIN physical_food_tokens lunch
            ON lunch.EventId = preference.EventId
            AND lunch.UserId = member.UserId
            AND lunch.MealType = 'lunch'
        LEFT JOIN physical_food_tokens dinner
            ON dinner.EventId = preference.EventId
            AND dinner.UserId = member.UserId
            AND dinner.MealType = 'dinner'
        WHERE preference.EventId = ? AND (preference.FoodAccepted = 1 OR preference.AccommodationRequested = 1) AND preference.BookingStatus = 'Approved'
        ORDER BY t.TeamName, ParticipantName`,
        [eventId]
    );

    return participants;
};

const getAccommodationParticipants = async (eventId) => {
    const [events] = await db.promise().query(
        "SELECT AccommodationEnabled, FoodEnabled FROM events WHERE Id = ?",
        [eventId]
    );
    if (!events[0]) {
        const error = new Error("Event was not found.");
        error.status = 404;
        throw error;
    }
    if (Number(events[0].AccommodationEnabled) !== 1 && Number(events[0].FoodEnabled) !== 1) {
        const error = new Error("Accommodation requests are not enabled for this event.");
        error.status = 403;
        throw error;
    }

    const [participants] = await db.promise().query(
        `SELECT DISTINCT
            t.Id AS TeamId,
            t.TeamName,
            t.College AS TeamCollege,
            lead.UserName AS TeamLeadName,
            lead.Email AS TeamLeadEmail,
            member.UserId,
            member.Id AS TeamMemberId,
            COALESCE(NULLIF(member.MemberName, ''), participant.UserName, 'Member') AS ParticipantName,
            COALESCE(NULLIF(member.MemberEmail, ''), participant.Email, '') AS Email,
            COALESCE(NULLIF(member.Gender, ''), participant.Gender, 'Male') AS Gender,
            COALESCE(NULLIF(member.MemberCollege, ''), participant.College, t.College, '') AS College,
            COALESCE(participant.Mobile, '') AS Mobile,
            allocation.RoomId AS AccommodationId,
            allocation.CreatedAt AS AllocatedAt,
            acc.room_num AS RoomNumber,
            acc.BlockId,
            block.BlockName,
            block.Gender AS BlockGender,
            (allocation.RoomId IS NOT NULL) AS AccommodationAllocated
        FROM physical_team_preferences preference
        INNER JOIN registered_teams t ON t.Id = preference.TeamId
        INNER JOIN event_registrations registration
            ON registration.EventId = preference.EventId
            AND registration.TeamId = preference.TeamId
            AND registration.ParticipationMode = 'Physical'
            AND registration.Status = 'approved'
        INNER JOIN registered_team_members member ON member.TeamId = t.Id
        LEFT JOIN users participant ON participant.Id = member.UserId
        INNER JOIN users lead ON lead.Id = t.TeamLeadUserId
        LEFT JOIN accommodation_allocations allocation
            ON allocation.EventId = preference.EventId
            AND allocation.UserId = member.UserId
        LEFT JOIN Accommodation acc
            ON acc.Id = allocation.RoomId
        LEFT JOIN accommodation_blocks block
            ON block.Id = acc.BlockId
        WHERE preference.EventId = ? AND (preference.AccommodationRequested = 1 OR preference.FoodAccepted = 1) AND preference.BookingStatus = 'Approved'
        ORDER BY t.TeamName, ParticipantName`,
        [eventId]
    );

    return participants;
};

const getEventTeamPreferences = async (eventId) => {
    const [rows] = await db.promise().query(
        `SELECT
            t.Id AS TeamId,
            COUNT(DISTINCT member.UserId) AS MemberCount,
            COALESCE(MAX(preference.AccommodationRequested), 0) AS AccommodationRequested,
            COALESCE(MAX(preference.FoodAccepted), 0) AS FoodAccepted,
            (MAX(preference.TeamId) IS NOT NULL) AS PreferencesSubmitted
        FROM registered_teams t
        INNER JOIN event_registrations registration
            ON registration.TeamId = t.Id
            AND registration.EventId = t.EventId
            AND registration.ParticipationMode = 'Physical'
            AND registration.Status = 'approved'
        LEFT JOIN registered_team_members member ON member.TeamId = t.Id
        LEFT JOIN physical_team_preferences preference
            ON preference.EventId = t.EventId AND preference.TeamId = t.Id
        WHERE t.EventId = ?
        GROUP BY t.Id
        ORDER BY t.Id`,
        [eventId]
    );
    return rows;
};

const generateFoodTokens = async (eventId, mealType) => {
    const [events] = await db.promise().query(
        "SELECT FoodEnabled FROM events WHERE Id = ?",
        [eventId]
    );
    if (!events[0]) {
        const error = new Error("Event was not found.");
        error.status = 404;
        throw error;
    }
    if (Number(events[0].FoodEnabled) !== 1) {
        const error = new Error("Food selection is not enabled for this event.");
        error.status = 403;
        throw error;
    }

    const [participants] = await db.promise().query(
        `SELECT preference.TeamId, member.UserId
        FROM physical_team_preferences preference
        INNER JOIN event_registrations registration
            ON registration.EventId = preference.EventId
            AND registration.TeamId = preference.TeamId
            AND registration.ParticipationMode = 'Physical'
            AND registration.Status = 'approved'
        INNER JOIN registered_team_members member
            ON member.TeamId = preference.TeamId
        LEFT JOIN physical_food_tokens token
            ON token.EventId = preference.EventId
            AND token.UserId = member.UserId
            AND token.MealType = ?
        WHERE preference.EventId = ?
            AND preference.FoodAccepted = 1
            AND preference.BookingStatus = 'Approved'
            AND token.Id IS NULL`,
        [mealType, eventId]
    );

    if (participants.length === 0) {
        return { generated: 0 };
    }

    const values = participants.map(({ TeamId, UserId }) => [
        eventId,
        TeamId,
        UserId,
        mealType,
        `FD-${eventId}-${randomBytes(8).toString("hex").toUpperCase()}`
    ]);
    const [result] = await db.promise().query(
        `INSERT IGNORE INTO physical_food_tokens
            (EventId, TeamId, UserId, MealType, Token)
        VALUES ?`,
        [values]
    );

    return { generated: result.affectedRows };
};

const getFacilityBookings = async (eventId) => {
    const [rows] = await db.promise().query(
        `SELECT 
            p.EventId,
            p.TeamId,
            t.TeamName,
            t.TeamLeadUserId,
            u.UserName AS TeamLeadName,
            u.Email AS TeamLeadEmail,
            (SELECT COUNT(*) FROM registered_team_members tm WHERE tm.TeamId = t.Id) AS MemberCount,
            p.AccommodationRequested,
            p.FoodAccepted,
            p.TotalAmount,
            p.PaymentRefId,
            p.PaymentReceiptUrl,
            p.PaymentNotes,
            COALESCE(p.BookingStatus, 'Pending') AS BookingStatus,
            p.AdminRemarks,
            p.BookingCreatedAt,
            p.UpdatedAt
        FROM physical_team_preferences p
        INNER JOIN registered_teams t ON t.Id = p.TeamId
        LEFT JOIN users u ON u.Id = t.TeamLeadUserId
        WHERE p.EventId = ?
        ORDER BY p.UpdatedAt DESC`,
        [eventId]
    );
    return rows;
};

const updateBookingStatus = async (eventId, teamId, bookingStatus, adminRemarks = '') => {
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    const status = validStatuses.includes(bookingStatus) ? bookingStatus : 'Pending';

    await db.promise().query(
        `UPDATE physical_team_preferences 
         SET BookingStatus = ?, AdminRemarks = ?
         WHERE EventId = ? AND TeamId = ?`,
        [status, adminRemarks || null, eventId, teamId]
    );

    return { success: true, bookingStatus: status, adminRemarks };
};

module.exports = {
    getTeamPreference,
    saveTeamPreference,
    getAccommodationParticipants,
    getFoodParticipants,
    getEventTeamPreferences,
    generateFoodTokens,
    getFacilityBookings,
    updateBookingStatus
};
