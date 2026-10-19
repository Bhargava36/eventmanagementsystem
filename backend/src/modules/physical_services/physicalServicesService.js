const { randomBytes } = require("crypto");
const db = require("../../config/db");

const getTeamPreference = async (teamId, userId) => {
    const [rows] = await db.promise().query(`SELECT t.Id AS TeamId, t.TeamLeadUserId, t.EventId, t.TeamName, er.ParticipationMode, er.Status AS RegistrationStatus, e.EventName, e.AccommodationEnabled, e.FoodEnabled, COALESCE(p.AccommodationRequested, 0) AS AccommodationRequested, COALESCE(p.FoodAccepted, 0) AS FoodAccepted, (p.TeamId IS NOT NULL) AS PreferencesSubmitted FROM registered_teams t INNER JOIN events e ON e.Id = t.EventId INNER JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId LEFT JOIN physical_team_preferences p ON p.EventId = t.EventId AND p.TeamId = t.Id INNER JOIN registered_team_members member ON member.TeamId = t.Id AND member.UserId = ? WHERE t.Id = ? LIMIT 1`, [userId, teamId]);
    return rows[0] || null;
};

const saveTeamPreference = async ( teamId, userId, accommodationRequested, foodAccepted) => {
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

    const [existingPreferences] = await db.promise().query(
        `SELECT TeamId
        FROM physical_team_preferences
        WHERE EventId = ? AND TeamId = ?
        LIMIT 1`,
        [team.EventId, teamId]
    );
    if (existingPreferences.length > 0) {
        const error = new Error("These team choices have already been submitted and cannot be changed.");
        error.status = 409;
        throw error;
    }
    try {
        await db.promise().query(
            `INSERT INTO physical_team_preferences
                (EventId, TeamId, AccommodationRequested, FoodAccepted)
            VALUES (?, ?, ?, ?)`,
            [
                team.EventId,
                teamId,
                unifiedRequest ? 1 : 0,
                unifiedRequest ? 1 : 0
            ]
        );
    } catch (insertError) {
        if (insertError.code === "ER_DUP_ENTRY") {
            const error = new Error("These team choices have already been submitted and cannot be changed.");
            error.status = 409;
            throw error;
        }
        throw insertError;
    }

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
            participant.UserName AS ParticipantName,
            participant.Email,
            participant.College AS ParticipantCollege,
            participant.Gender,
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
        INNER JOIN users participant ON participant.Id = member.UserId
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
        WHERE preference.EventId = ? AND (preference.FoodAccepted = 1 OR preference.AccommodationRequested = 1)
        ORDER BY t.TeamName, participant.UserName`,
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
            participant.UserName AS ParticipantName,
            participant.Email,
            participant.Gender,
            participant.College,
            participant.Mobile,
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
        INNER JOIN users participant ON participant.Id = member.UserId
        INNER JOIN users lead ON lead.Id = t.TeamLeadUserId
        LEFT JOIN accommodation_allocations allocation
            ON allocation.EventId = preference.EventId
            AND allocation.UserId = member.UserId
        LEFT JOIN Accommodation acc
            ON acc.Id = allocation.RoomId
        LEFT JOIN accommodation_blocks block
            ON block.Id = acc.BlockId
        WHERE preference.EventId = ? AND (preference.AccommodationRequested = 1 OR preference.FoodAccepted = 1)
        ORDER BY t.TeamName, participant.UserName`,
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

module.exports = {
    getTeamPreference,
    saveTeamPreference,
    getAccommodationParticipants,
    getFoodParticipants,
    getEventTeamPreferences,
    generateFoodTokens
};
