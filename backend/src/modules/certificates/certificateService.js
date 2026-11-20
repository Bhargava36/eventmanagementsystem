const db = require("../../config/db");

// Default A4 Landscape Certificate Configuration (Canvas coordinates 1000 x 707)
const getDefaultCertificateTemplateConfig = (orientation = "landscape") => {
    const isLandscape = orientation === "landscape";
    const width = isLandscape ? 1000 : 707;
    const height = isLandscape ? 707 : 1000;

    const elements = isLandscape ? [
        // Outer decorative gold border
        {
            id: "outer-frame",
            type: "shape",
            shapeType: "rectangle",
            x: 24,
            y: 24,
            width: width - 48,
            height: height - 48,
            fill: "rgba(3, 7, 18, 0.98)",
            stroke: "#d4af37",
            strokeWidth: 3,
            borderRadius: 16,
            zIndex: 1,
            locked: true,
            hidden: false
        },
        // Inner delicate accent border
        {
            id: "inner-frame",
            type: "shape",
            shapeType: "rectangle",
            x: 38,
            y: 38,
            width: width - 76,
            height: height - 76,
            fill: "transparent",
            stroke: "rgba(212, 175, 55, 0.35)",
            strokeWidth: 1.5,
            borderRadius: 12,
            zIndex: 1,
            locked: true,
            hidden: false
        },
        // Corner decorative accents
        {
            id: "corner-tl",
            type: "shape",
            shapeType: "rectangle",
            x: 32,
            y: 32,
            width: 20,
            height: 20,
            fill: "#10b981",
            stroke: "transparent",
            strokeWidth: 0,
            borderRadius: 2,
            zIndex: 2,
            locked: true,
            hidden: false
        },
        {
            id: "corner-tr",
            type: "shape",
            shapeType: "rectangle",
            x: width - 52,
            y: 32,
            width: 20,
            height: 20,
            fill: "#10b981",
            stroke: "transparent",
            strokeWidth: 0,
            borderRadius: 2,
            zIndex: 2,
            locked: true,
            hidden: false
        },
        {
            id: "corner-bl",
            type: "shape",
            shapeType: "rectangle",
            x: 32,
            y: height - 52,
            width: 20,
            height: 20,
            fill: "#10b981",
            stroke: "transparent",
            strokeWidth: 0,
            borderRadius: 2,
            zIndex: 2,
            locked: true,
            hidden: false
        },
        {
            id: "corner-br",
            type: "shape",
            shapeType: "rectangle",
            x: width - 52,
            y: height - 52,
            width: 20,
            height: 20,
            fill: "#10b981",
            stroke: "transparent",
            strokeWidth: 0,
            borderRadius: 2,
            zIndex: 2,
            locked: true,
            hidden: false
        },
        // Institution Header
        {
            id: "inst-name",
            type: "text",
            text: "ADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (AITAM)",
            dynamicField: null,
            x: 80,
            y: 60,
            width: width - 160,
            height: 24,
            fontSize: 14,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#e2e8f0",
            letterSpacing: 2.5,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "inst-sub",
            type: "text",
            text: "An Autonomous Institution • Approved by AICTE • Accredited by NAAC A+",
            dynamicField: null,
            x: 80,
            y: 86,
            width: width - 160,
            height: 18,
            fontSize: 9.5,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            letterSpacing: 1.5,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Certificate Main Title
        {
            id: "cert-title",
            type: "text",
            text: "CERTIFICATE OF PARTICIPATION",
            dynamicField: null,
            x: 80,
            y: 122,
            width: width - 160,
            height: 44,
            fontSize: 28,
            fontWeight: "900",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            color: "#d4af37",
            letterSpacing: 4,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Subtitle
        {
            id: "cert-sub",
            type: "text",
            text: "THIS IS PROUDLY PRESENTED TO",
            dynamicField: null,
            x: 80,
            y: 170,
            width: width - 160,
            height: 18,
            fontSize: 10.5,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            letterSpacing: 3,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Recipient Name (Individual Member)
        {
            id: "recipient-name",
            type: "text",
            text: "{{recipient_name}}",
            dynamicField: "recipient_name",
            x: 80,
            y: 200,
            width: width - 160,
            height: 48,
            fontSize: 32,
            fontWeight: "900",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            color: "#ffffff",
            letterSpacing: 1.5,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        // Underline accent
        {
            id: "name-underline",
            type: "shape",
            shapeType: "line",
            x: 320,
            y: 255,
            width: 360,
            height: 2,
            fill: "#d4af37",
            stroke: "#d4af37",
            strokeWidth: 2,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Team Name & Role
        {
            id: "team-and-role",
            type: "text",
            text: "of Team {{team_name}} ({{role}})",
            dynamicField: "team_and_role",
            x: 80,
            y: 270,
            width: width - 160,
            height: 22,
            fontSize: 14,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#38bdf8",
            letterSpacing: 1,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // College / Institution
        {
            id: "college-name",
            type: "text",
            text: "representing {{college_name}}",
            dynamicField: "college_name",
            x: 80,
            y: 298,
            width: width - 160,
            height: 20,
            fontSize: 12.5,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#cbd5e1",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Citation text
        {
            id: "citation-text",
            type: "text",
            text: "for exemplary participation and successful jury evaluation in {{event_name}} ({{track}} Hackathon Track), organized on {{event_date}} at {{venue_location}}. The candidate demonstrated notable software innovation, technical diligence, and team excellence.",
            dynamicField: "citation",
            x: 100,
            y: 334,
            width: width - 200,
            height: 48,
            fontSize: 11.5,
            fontWeight: "400",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            lineHeight: 1.6,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Center Medal / Verified Seal
        {
            id: "seal-ring",
            type: "shape",
            shapeType: "circle",
            x: 465,
            y: 430,
            width: 70,
            height: 70,
            fill: "rgba(212, 175, 55, 0.08)",
            stroke: "#d4af37",
            strokeWidth: 2,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "seal-txt",
            type: "text",
            text: "OFFICIAL VERIFIED",
            dynamicField: null,
            x: 440,
            y: 454,
            width: 120,
            height: 24,
            fontSize: 8.5,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#d4af37",
            letterSpacing: 1.2,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        // Signatory 1 (Left)
        {
            id: "sig-line-1",
            type: "shape",
            shapeType: "line",
            x: 120,
            y: 535,
            width: 210,
            height: 1,
            fill: "#64748b",
            stroke: "#64748b",
            strokeWidth: 1,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "sig-name-1",
            type: "text",
            text: "Dr. Ch. Ramesh",
            dynamicField: null,
            x: 100,
            y: 544,
            width: 250,
            height: 20,
            fontSize: 13,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#f8fafc",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "sig-title-1",
            type: "text",
            text: "Convener & HOD, CSE",
            dynamicField: null,
            x: 100,
            y: 566,
            width: 250,
            height: 16,
            fontSize: 10,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // Signatory 2 (Right)
        {
            id: "sig-line-2",
            type: "shape",
            shapeType: "line",
            x: 670,
            y: 535,
            width: 210,
            height: 1,
            fill: "#64748b",
            stroke: "#64748b",
            strokeWidth: 1,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "sig-name-2",
            type: "text",
            text: "Dr. A.S. Srinivasa Rao",
            dynamicField: null,
            x: 650,
            y: 544,
            width: 250,
            height: 20,
            fontSize: 13,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#f8fafc",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "sig-title-2",
            type: "text",
            text: "Principal, AITAM",
            dynamicField: null,
            x: 650,
            y: 566,
            width: 250,
            height: 16,
            fontSize: 10,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        // QR Code (Bottom Center-Right)
        {
            id: "qr-box",
            type: "qr",
            dynamicField: "qr_code",
            x: 465,
            y: 530,
            width: 70,
            height: 70,
            color: "#000000",
            bgColor: "#ffffff",
            borderRadius: 6,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        // Certificate Serial Number & Issue Date
        {
            id: "cert-id-txt",
            type: "text",
            text: "Certificate ID: {{certificate_id}}",
            dynamicField: "certificate_id",
            x: 60,
            y: height - 52,
            width: 380,
            height: 18,
            fontSize: 9.5,
            fontWeight: "700",
            fontFamily: "Courier, monospace",
            textAlign: "left",
            color: "#64748b",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "issue-date-txt",
            type: "text",
            text: "Issued: {{issue_date}}",
            dynamicField: "issue_date",
            x: width - 440,
            y: height - 52,
            width: 380,
            height: 18,
            fontSize: 9.5,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "right",
            color: "#64748b",
            zIndex: 4,
            locked: false,
            hidden: false
        }
    ] : [
        // Portrait default elements (if chosen)
        {
            id: "outer-frame",
            type: "shape",
            shapeType: "rectangle",
            x: 20,
            y: 20,
            width: width - 40,
            height: height - 40,
            fill: "rgba(3, 7, 18, 0.98)",
            stroke: "#d4af37",
            strokeWidth: 3,
            borderRadius: 16,
            zIndex: 1,
            locked: true,
            hidden: false
        },
        {
            id: "cert-title",
            type: "text",
            text: "CERTIFICATE OF PARTICIPATION",
            dynamicField: null,
            x: 40,
            y: 120,
            width: width - 80,
            height: 44,
            fontSize: 24,
            fontWeight: "900",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            color: "#d4af37",
            letterSpacing: 3,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "recipient-name",
            type: "text",
            text: "{{recipient_name}}",
            dynamicField: "recipient_name",
            x: 40,
            y: 260,
            width: width - 80,
            height: 48,
            fontSize: 28,
            fontWeight: "900",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        }
    ];

    return {
        TemplateName: "AITAM Official Prestigious Certificate",
        Orientation: orientation,
        WidthMm: isLandscape ? 297 : 210,
        HeightMm: isLandscape ? 210 : 297,
        CanvasWidth: width,
        CanvasHeight: height,
        BackgroundColor: "#030712",
        BackgroundImageUrl: "",
        BorderColor: "#d4af37",
        PrimaryAccent: "#d4af37",
        Elements: elements,
        IsDefault: 1,
        Track: "Virtual"
    };
};

// 1. Get templates for event (auto-creates default if none exist)
const getTemplates = (eventId, callback) => {
    const sql = `SELECT * FROM certificate_templates WHERE EventId = ? ORDER BY IsDefault DESC, Id DESC`;
    db.query(sql, [eventId], (err, rows) => {
        if (err) return callback(err, null);
        if (rows && rows.length > 0) {
            const parsed = rows.map(r => {
                let cfg = {};
                try {
                    cfg = JSON.parse(r.Config);
                } catch {
                    cfg = getDefaultCertificateTemplateConfig(r.Orientation || 'landscape');
                }
                return {
                    id: r.Id,
                    eventId: r.EventId,
                    templateName: r.TemplateName,
                    orientation: r.Orientation,
                    widthMm: r.WidthMm,
                    heightMm: r.HeightMm,
                    isDefault: Boolean(r.IsDefault),
                    track: r.Track || 'Virtual',
                    config: cfg,
                    createdAt: r.CreatedAt,
                    updatedAt: r.UpdatedAt
                };
            });
            return callback(null, parsed);
        }

        // Auto-seed default template
        const def = getDefaultCertificateTemplateConfig('landscape');
        const insertSql = `
            INSERT INTO certificate_templates
                (EventId, TemplateName, Orientation, WidthMm, HeightMm, Config, IsDefault, Track)
            VALUES (?, ?, ?, ?, ?, ?, 1, 'Virtual')
        `;
        db.query(insertSql, [
            eventId,
            def.TemplateName,
            def.Orientation,
            def.WidthMm,
            def.HeightMm,
            JSON.stringify(def)
        ], (insErr, result) => {
            if (insErr) return callback(insErr, null);
            callback(null, [{
                id: result.insertId,
                eventId: Number(eventId),
                templateName: def.TemplateName,
                orientation: def.Orientation,
                widthMm: def.WidthMm,
                heightMm: def.HeightMm,
                isDefault: true,
                track: 'Virtual',
                config: def
            }]);
        });
    });
};

// 2. Get single template
const getTemplateById = (eventId, templateId, callback) => {
    const sql = `SELECT * FROM certificate_templates WHERE EventId = ? AND Id = ? LIMIT 1`;
    db.query(sql, [eventId, templateId], (err, rows) => {
        if (err) return callback(err, null);
        if (!rows || rows.length === 0) {
            return callback(new Error('Certificate template not found'), null);
        }
        const r = rows[0];
        let cfg = {};
        try {
            cfg = JSON.parse(r.Config);
        } catch {
            cfg = getDefaultCertificateTemplateConfig(r.Orientation || 'landscape');
        }
        callback(null, {
            id: r.Id,
            eventId: r.EventId,
            templateName: r.TemplateName,
            orientation: r.Orientation,
            widthMm: r.WidthMm,
            heightMm: r.HeightMm,
            isDefault: Boolean(r.IsDefault),
            track: r.Track || 'Virtual',
            config: cfg,
            createdAt: r.CreatedAt,
            updatedAt: r.UpdatedAt
        });
    });
};

// 3. Save or Update template
const saveTemplate = (eventId, templateId, payload, callback) => {
    const templateName = payload.templateName || payload.TemplateName || "Custom Certificate Template";
    const orientation = payload.orientation || payload.Orientation || "landscape";
    const widthMm = Number(payload.widthMm || payload.WidthMm || (orientation === "landscape" ? 297 : 210));
    const heightMm = Number(payload.heightMm || payload.HeightMm || (orientation === "landscape" ? 210 : 297));
    const track = payload.track || payload.Track || "Virtual";
    const isDefault = payload.isDefault ? 1 : 0;
    const configStr = typeof payload.config === "string" ? payload.config : JSON.stringify(payload.config || payload);

    if (templateId) {
        // Update
        const updateSql = `
            UPDATE certificate_templates
            SET TemplateName = ?, Orientation = ?, WidthMm = ?, HeightMm = ?, Config = ?, Track = ?, IsDefault = ?
            WHERE EventId = ? AND Id = ?
        `;
        db.query(updateSql, [templateName, orientation, widthMm, heightMm, configStr, track, isDefault, eventId, templateId], (err, result) => {
            if (err) return callback(err, null);
            if (result && result.affectedRows === 0) {
                // TemplateId wasn't found for this eventId! Update active template or insert fresh
                const fallbackUpdateSql = `
                    UPDATE certificate_templates
                    SET TemplateName = ?, Orientation = ?, WidthMm = ?, HeightMm = ?, Config = ?, Track = ?, IsDefault = 1
                    WHERE EventId = ?
                    ORDER BY IsDefault DESC, Id DESC
                    LIMIT 1
                `;
                db.query(fallbackUpdateSql, [templateName, orientation, widthMm, heightMm, configStr, track, eventId], (upErr, upRes) => {
                    if (!upErr && upRes && upRes.affectedRows > 0) {
                        return callback(null, { id: Number(templateId), templateName, isDefault: true });
                    }
                    const insSql = `
                        INSERT INTO certificate_templates
                            (EventId, TemplateName, Orientation, WidthMm, HeightMm, Config, IsDefault, Track)
                        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
                    `;
                    db.query(insSql, [eventId, templateName, orientation, widthMm, heightMm, configStr, track], (iErr, iRes) => {
                        if (iErr) return callback(iErr, null);
                        callback(null, { id: iRes.insertId, templateName, isDefault: true });
                    });
                });
                return;
            }
            if (isDefault) {
                // Clear other defaults
                db.query(`UPDATE certificate_templates SET IsDefault = 0 WHERE EventId = ? AND Id != ?`, [eventId, templateId], () => {});
            }
            callback(null, { id: Number(templateId), templateName, isDefault: Boolean(isDefault) });
        });
    } else {
        // Create new
        const insertSql = `
            INSERT INTO certificate_templates
                (EventId, TemplateName, Orientation, WidthMm, HeightMm, Config, IsDefault, Track)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [eventId, templateName, orientation, widthMm, heightMm, configStr, isDefault, track], (err, result) => {
            if (err) return callback(err, null);
            const newId = result.insertId;
            if (isDefault) {
                db.query(`UPDATE certificate_templates SET IsDefault = 0 WHERE EventId = ? AND Id != ?`, [eventId, newId], () => {});
            }
            callback(null, { id: newId, templateName, isDefault: Boolean(isDefault) });
        });
    }
};

// 4. Delete template
const deleteTemplate = (eventId, templateId, callback) => {
    db.query(`DELETE FROM certificate_templates WHERE EventId = ? AND Id = ?`, [eventId, templateId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, { success: true, deletedId: templateId });
    });
};

// 5. Set default template
const setDefaultTemplate = (eventId, templateId, callback) => {
    db.query(`UPDATE certificate_templates SET IsDefault = 0 WHERE EventId = ?`, [eventId], (err) => {
        if (err) return callback(err, null);
        db.query(`UPDATE certificate_templates SET IsDefault = 1 WHERE EventId = ? AND Id = ?`, [eventId, templateId], (upErr) => {
            if (upErr) return callback(upErr, null);
            callback(null, { success: true, defaultId: templateId });
        });
    });
};

// 6. Duplicate template
const duplicateTemplate = (eventId, templateId, callback) => {
    getTemplateById(eventId, templateId, (err, tmpl) => {
        if (err) return callback(err, null);
        const copyName = `${tmpl.templateName} (Copy)`;
        saveTemplate(eventId, null, {
            ...tmpl,
            templateName: copyName,
            isDefault: false
        }, callback);
    });
};

// 7. Core Function: Get all individual certificates for ALL members of a team!
// If team has 4 members -> returns 4 distinct certificates, one for each member!
const getTeamCertificates = (teamId, callback) => {
    const sql = `
        SELECT
            t.Id AS TeamId,
            t.TeamName,
            t.TeamSize,
            t.College,
            t.State,
            t.EventId,
            COALESCE(t.CertificateIssued, er.CertificateIssued, 0) AS CertificateIssued,
            COALESCE(t.CertificateIssuedAt, er.CertificateIssuedAt) AS CertificateIssuedAt,
            u.UserName AS TeamLeadName,
            u.Email AS TeamLeadEmail,
            e.EventName,
            e.HackathonMode,
            e.StartDate,
            e.EndDate,
            e.VirtualStartDate,
            e.VirtualEndDate,
            e.Location,
            e.PrimaryColor,
            COALESCE(er.ParticipationMode, 'Virtual') AS ParticipationMode
        FROM registered_teams t
        INNER JOIN events e ON t.EventId = e.Id
        LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
        LEFT JOIN users u ON t.TeamLeadUserId = u.Id
        WHERE t.Id = ?
        LIMIT 1
    `;
    db.query(sql, [teamId], (err, teamRows) => {
        if (err) return callback(err, null);
        if (!teamRows || teamRows.length === 0) {
            const notFound = new Error('Team not found');
            notFound.status = 404;
            return callback(notFound, null);
        }
        const team = teamRows[0];
        const eventId = team.EventId;

        // Check if team has been evaluated in evaluation_scores
        db.query(`SELECT COUNT(*) AS scoreCount FROM evaluation_scores WHERE TeamId = ?`, [teamId], (scErr, scoreRows) => {
            const isEvaluated = Boolean(scoreRows?.[0]?.scoreCount > 0);

            // Fetch team members
            const memberSql = `
                SELECT
                    tm.Id,
                    tm.UserId,
                    COALESCE(u.UserName, tm.MemberName, 'Member') AS MemberName,
                    COALESCE(u.Email, tm.MemberEmail) AS MemberEmail,
                    COALESCE(u.College, tm.MemberCollege, ?) AS MemberCollege,
                    tm.Role
                FROM registered_team_members tm
                LEFT JOIN users u ON tm.UserId = u.Id
                WHERE tm.TeamId = ?
                ORDER BY tm.Id ASC
            `;
            db.query(memberSql, [team.College || 'AITAM', teamId], (mErr, members) => {
                let memberList = members || [];
                const hasLead = memberList.some(m => m.Role?.toLowerCase() === 'teamlead' || (team.TeamLeadEmail && m.MemberEmail?.toLowerCase() === team.TeamLeadEmail.toLowerCase()));
                if (!hasLead && team.TeamLeadName) {
                    memberList.unshift({
                        Id: 0,
                        UserId: null,
                        MemberName: team.TeamLeadName,
                        MemberEmail: team.TeamLeadEmail,
                        MemberCollege: team.College,
                        Role: 'TeamLead'
                    });
                }

                // If no members are stored at all, create one for the lead
                if (memberList.length === 0) {
                    memberList = [{
                        Id: 0,
                        UserId: null,
                        MemberName: team.TeamLeadName || team.TeamName || 'Participant',
                        MemberEmail: team.TeamLeadEmail || '',
                        MemberCollege: team.College || 'AITAM',
                        Role: 'TeamLead'
                    }];
                }

                // Fetch default certificate template for this event
                getTemplates(eventId, (tErr, templates) => {
                    const defaultTemplate = (templates || []).find(t => t.isDefault) || templates?.[0] || {
                        config: getDefaultCertificateTemplateConfig('landscape')
                    };
                    const baseConfig = defaultTemplate.config || getDefaultCertificateTemplateConfig('landscape');

                    const formattedEventDate = team.VirtualStartDate
                        ? new Date(team.VirtualStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : team.StartDate
                            ? new Date(team.StartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'November 2026';

                    const formattedIssueDate = team.CertificateIssuedAt
                        ? new Date(team.CertificateIssuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                    // Generate distinct individual certificates for EVERY SINGLE MEMBER!
                    const certificates = memberList.map((m, index) => {
                        const seqNumber = index + 1;
                        const certId = `CERT-VIRT-${team.EventId}-${team.TeamId}-${seqNumber}`;
                        const memberRole = String(m.Role || '').toLowerCase() === 'teamlead' || seqNumber === 1
                            ? 'Team Lead'
                            : 'Team Member';
                        const memberCollege = m.MemberCollege || team.College || 'AITAM';
                        const memberName = m.MemberName || `Member ${seqNumber}`;

                        // Substitute placeholders in elements for THIS specific member
                        const substitutedElements = (baseConfig.Elements || []).map(el => {
                            if (el.type === 'text') {
                                let newText = el.text || '';
                                newText = newText.replace(/\{\{recipient_name\}\}/gi, memberName);
                                newText = newText.replace(/\{\{team_name\}\}/gi, team.TeamName);
                                newText = newText.replace(/\{\{college_name\}\}/gi, memberCollege);
                                newText = newText.replace(/\{\{role\}\}/gi, memberRole);
                                newText = newText.replace(/\{\{team_and_role\}\}/gi, `of Team ${team.TeamName} (${memberRole})`);
                                newText = newText.replace(/\{\{event_name\}\}/gi, team.EventName);
                                newText = newText.replace(/\{\{event_date\}\}/gi, formattedEventDate);
                                newText = newText.replace(/\{\{track\}\}/gi, team.ParticipationMode || 'Virtual');
                                newText = newText.replace(/\{\{venue_location\}\}/gi, team.Location || 'AITAM College, Tekkali');
                                newText = newText.replace(/\{\{certificate_id\}\}/gi, certId);
                                newText = newText.replace(/\{\{issue_date\}\}/gi, formattedIssueDate);
                                return { ...el, text: newText };
                            }
                            if (el.type === 'qr') {
                                return {
                                    ...el,
                                    qrValue: `https://ems.aitamsac.in/verify/certificate?id=${certId}&member=${encodeURIComponent(memberName)}&team=${encodeURIComponent(team.TeamName)}&event=${encodeURIComponent(team.EventName)}`
                                };
                            }
                            return { ...el };
                        });

                        return {
                            certificateId: certId,
                            sequenceIndex: seqNumber,
                            memberId: m.Id,
                            userId: m.UserId,
                            recipientName: memberName,
                            role: memberRole,
                            email: m.MemberEmail,
                            college: memberCollege,
                            issueDate: formattedIssueDate,
                            eventDate: formattedEventDate,
                            eventName: team.EventName,
                            track: team.ParticipationMode || 'Virtual',
                            teamName: team.TeamName,
                            qrVerificationUrl: `https://ems.aitamsac.in/verify/certificate?id=${certId}`,
                            templateConfig: {
                                ...baseConfig,
                                Elements: substitutedElements
                            }
                        };
                    });

                    callback(null, {
                        eligible: isEvaluated,
                        isEvaluated,
                        isIssued: Boolean(team.CertificateIssued),
                        certificateIssued: Boolean(team.CertificateIssued),
                        certificateIssuedAt: team.CertificateIssuedAt,
                        totalMembers: certificates.length,
                        team: {
                            id: team.TeamId,
                            teamName: team.TeamName,
                            college: team.College,
                            state: team.State,
                            track: team.ParticipationMode || 'Virtual',
                            teamLeadName: team.TeamLeadName,
                            teamLeadEmail: team.TeamLeadEmail
                        },
                        event: {
                            id: team.EventId,
                            eventName: team.EventName,
                            hackathonMode: team.HackathonMode,
                            startDate: team.VirtualStartDate || team.StartDate,
                            endDate: team.VirtualEndDate || team.EndDate,
                            location: team.Location,
                            primaryColor: team.PrimaryColor
                        },
                        templateId: defaultTemplate.id || 1,
                        templateName: defaultTemplate.templateName || "Default Certificate",
                        certificates
                    });
                });
            });
        });
    });
};

const getEventCertificatePreviewData = (eventId, callback) => {
    const eventSql = `
        SELECT
            Id,
            EventName,
            EventType,
            HackathonMode,
            StartDate,
            EndDate,
            VirtualStartDate,
            VirtualEndDate,
            Location,
            PrimaryColor
        FROM events
        WHERE Id = ?
        LIMIT 1
    `;
    db.query(eventSql, [eventId], (eErr, eventRows) => {
        if (eErr) return callback(eErr, null);
        if (!eventRows || eventRows.length === 0) {
            const err = new Error('Event not found');
            err.status = 404;
            return callback(err, null);
        }
        const ev = eventRows[0];

        const formattedEventDate = ev.VirtualStartDate
            ? new Date(ev.VirtualStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : ev.StartDate
                ? new Date(ev.StartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'November 2026';

        const formattedIssueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Fetch registered teams for this event
        const teamSql = `
            SELECT
                t.Id AS TeamId,
                t.TeamName,
                t.TeamSize,
                t.College,
                t.State,
                COALESCE(er.ParticipationMode, 'Virtual') AS ParticipationMode,
                u.UserName AS TeamLeadName,
                u.Email AS TeamLeadEmail
            FROM registered_teams t
            LEFT JOIN users u ON t.TeamLeadUserId = u.Id
            LEFT JOIN event_registrations er ON er.TeamId = t.Id AND er.EventId = t.EventId
            WHERE t.EventId = ?
            ORDER BY t.Id ASC
        `;
        db.query(teamSql, [eventId], (tErr, teamRows) => {
            if (tErr) return callback(tErr, null);
            const teams = teamRows || [];

            if (teams.length === 0) {
                const fallbackMembers = [
                    {
                        teamId: 0,
                        teamName: 'Sample Team Alpha',
                        name: 'Participant Lead',
                        role: 'Team Lead',
                        college: ev.Location || 'AITAM College, Tekkali',
                        certId: `CERT-VIRT-${eventId}-001-1`,
                        track: ev.HackathonMode || 'Virtual',
                        email: 'lead@example.com'
                    },
                    {
                        teamId: 0,
                        teamName: 'Sample Team Alpha',
                        name: 'Team Member 2',
                        role: 'Team Member',
                        college: ev.Location || 'AITAM College, Tekkali',
                        certId: `CERT-VIRT-${eventId}-001-2`,
                        track: ev.HackathonMode || 'Virtual',
                        email: 'member2@example.com'
                    }
                ];

                return callback(null, {
                    event: {
                        id: ev.Id,
                        eventName: ev.EventName,
                        eventType: ev.EventType,
                        hackathonMode: ev.HackathonMode,
                        startDate: ev.StartDate,
                        endDate: ev.EndDate,
                        virtualStartDate: ev.VirtualStartDate,
                        virtualEndDate: ev.VirtualEndDate,
                        location: ev.Location || 'AITAM College, Tekkali',
                        primaryColor: ev.PrimaryColor || '#d4af37',
                        formattedEventDate,
                        formattedIssueDate
                    },
                    teams: [],
                    previewMembers: fallbackMembers
                });
            }

            const teamIds = teams.map(t => t.TeamId);
            const memberSql = `
                SELECT
                    tm.Id,
                    tm.TeamId,
                    tm.UserId,
                    COALESCE(u.UserName, tm.MemberName, 'Member') AS MemberName,
                    COALESCE(u.Email, tm.MemberEmail) AS MemberEmail,
                    COALESCE(u.College, tm.MemberCollege) AS MemberCollege,
                    tm.Role
                FROM registered_team_members tm
                LEFT JOIN users u ON tm.UserId = u.Id
                WHERE tm.TeamId IN (?)
                ORDER BY tm.Id ASC
            `;
            db.query(memberSql, [teamIds], (mErr, memberRows) => {
                const allMembers = memberRows || [];

                const previewTeams = teams.map(team => {
                    let teamMems = allMembers.filter(m => m.TeamId === team.TeamId);
                    const hasLead = teamMems.some(m => String(m.Role).toLowerCase() === 'teamlead' || (team.TeamLeadEmail && String(m.MemberEmail).toLowerCase() === String(team.TeamLeadEmail).toLowerCase()));
                    if (!hasLead && team.TeamLeadName) {
                        teamMems.unshift({
                            Id: 0,
                            TeamId: team.TeamId,
                            UserId: null,
                            MemberName: team.TeamLeadName,
                            MemberEmail: team.TeamLeadEmail,
                            MemberCollege: team.College,
                            Role: 'TeamLead'
                        });
                    }
                    if (teamMems.length === 0) {
                        teamMems = [{
                            Id: 0,
                            TeamId: team.TeamId,
                            UserId: null,
                            MemberName: team.TeamLeadName || team.TeamName,
                            MemberEmail: team.TeamLeadEmail || '',
                            MemberCollege: team.College || 'AITAM',
                            Role: 'TeamLead'
                        }];
                    }

                    const formattedMems = teamMems.map((m, idx) => ({
                        teamId: team.TeamId,
                        teamName: team.TeamName,
                        name: m.MemberName || `Member ${idx + 1}`,
                        role: String(m.Role || '').toLowerCase() === 'teamlead' || idx === 0 ? 'Team Lead' : 'Team Member',
                        college: m.MemberCollege || team.College || ev.Location || 'AITAM College, Tekkali',
                        certId: `CERT-VIRT-${eventId}-${team.TeamId}-${idx + 1}`,
                        track: team.ParticipationMode || 'Virtual',
                        email: m.MemberEmail || ''
                    }));

                    return {
                        teamId: team.TeamId,
                        teamName: team.TeamName,
                        college: team.College,
                        track: team.ParticipationMode || 'Virtual',
                        members: formattedMems
                    };
                });

                const previewMembers = previewTeams.flatMap(t => t.members);

                callback(null, {
                    event: {
                        id: ev.Id,
                        eventName: ev.EventName,
                        eventType: ev.EventType,
                        hackathonMode: ev.HackathonMode,
                        startDate: ev.StartDate,
                        endDate: ev.EndDate,
                        virtualStartDate: ev.VirtualStartDate,
                        virtualEndDate: ev.VirtualEndDate,
                        location: ev.Location || 'AITAM College, Tekkali',
                        primaryColor: ev.PrimaryColor || '#d4af37',
                        formattedEventDate,
                        formattedIssueDate
                    },
                    teams: previewTeams,
                    previewMembers
                });
            });
        });
    });
};

module.exports = {
    getDefaultCertificateTemplateConfig,
    getTemplates,
    getTemplateById,
    saveTemplate,
    deleteTemplate,
    setDefaultTemplate,
    duplicateTemplate,
    getTeamCertificates,
    getEventCertificatePreviewData
};

