const db = require("../../config/db");
const crypto = require("crypto");

/**
 * Creates standard CR80 default starter template configuration
 */
const getDefaultTemplateConfig = (orientation = "portrait") => {
    const isPortrait = orientation === "portrait";
    const width = isPortrait ? 380 : 600;
    const height = isPortrait ? 600 : 380;

    const frontElements = isPortrait
        ? [
            {
                id: "event-name-txt",
                type: "text",
                text: "{{event_name}}",
                dynamicField: "event_name",
                x: 20,
                y: 25,
                width: 340,
                height: 32,
                fontSize: 18,
                fontWeight: "800",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#ffffff",
                letterSpacing: 2,
                zIndex: 2,
                locked: false,
                hidden: false
            },
            {
                id: "event-tagline",
                type: "text",
                text: "OFFICIAL PARTICIPANT PASS",
                dynamicField: null,
                x: 20,
                y: 62,
                width: 340,
                height: 18,
                fontSize: 10,
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#34d399",
                letterSpacing: 3,
                zIndex: 2,
                locked: false,
                hidden: false
            },
            {
                id: "participant-photo",
                type: "image",
                dynamicField: "participant_photo",
                src: "",
                x: 130,
                y: 85,
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 4,
                borderColor: "#10b981",
                objectFit: "cover",
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "participant-name",
                type: "text",
                text: "{{participant_name}}",
                dynamicField: "participant_name",
                x: 20,
                y: 218,
                width: 340,
                height: 28,
                fontSize: 20,
                fontWeight: "800",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#ffffff",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "category-badge",
                type: "shape",
                shapeType: "rectangle",
                x: 110,
                y: 252,
                width: 160,
                height: 26,
                fill: "rgba(16, 185, 129, 0.2)",
                stroke: "#10b981",
                strokeWidth: 1,
                borderRadius: 13,
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "participant-category",
                type: "text",
                text: "{{participant_category}}",
                dynamicField: "participant_category",
                x: 110,
                y: 256,
                width: 160,
                height: 18,
                fontSize: 11,
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#10b981",
                letterSpacing: 1,
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "team-name-txt",
                type: "text",
                text: "Team: {{team_name}}",
                dynamicField: "team_name",
                x: 20,
                y: 290,
                width: 340,
                height: 20,
                fontSize: 13,
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#94a3b8",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "college-name-txt",
                type: "text",
                text: "{{college_name}}",
                dynamicField: "college_name",
                x: 20,
                y: 314,
                width: 340,
                height: 18,
                fontSize: 11,
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#64748b",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "qr-box",
                type: "qr",
                dynamicField: "qr_code",
                x: 135,
                y: 345,
                width: 110,
                height: 110,
                color: "#000000",
                bgColor: "#ffffff",
                borderRadius: 10,
                borderWidth: 0,
                borderColor: "transparent",
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "reg-id-txt",
                type: "text",
                text: "ID: {{registration_id}}",
                dynamicField: "registration_id",
                x: 20,
                y: 468,
                width: 340,
                height: 20,
                fontSize: 12,
                fontWeight: "700",
                fontFamily: "Courier, monospace",
                textAlign: "center",
                color: "#38bdf8",
                letterSpacing: 2,
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "footer-note",
                type: "text",
                text: "Scan QR for Event Check-in & Verification",
                dynamicField: null,
                x: 20,
                y: 540,
                width: 340,
                height: 18,
                fontSize: 9,
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#475569",
                letterSpacing: 1,
                zIndex: 3,
                locked: false,
                hidden: false
            }
        ]
        : [
            {
                id: "participant-photo",
                type: "image",
                dynamicField: "participant_photo",
                src: "",
                x: 35,
                y: 35,
                width: 110,
                height: 110,
                borderRadius: 55,
                borderWidth: 3,
                borderColor: "#10b981",
                objectFit: "cover",
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "qr-box",
                type: "qr",
                dynamicField: "qr_code",
                x: 40,
                y: 165,
                width: 100,
                height: 100,
                color: "#000000",
                bgColor: "#ffffff",
                borderRadius: 8,
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "reg-id-txt",
                type: "text",
                text: "{{registration_id}}",
                dynamicField: "registration_id",
                x: 10,
                y: 280,
                width: 160,
                height: 20,
                fontSize: 11,
                fontWeight: "700",
                fontFamily: "Courier, monospace",
                textAlign: "center",
                color: "#38bdf8",
                letterSpacing: 1,
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "event-name-txt",
                type: "text",
                text: "{{event_name}}",
                dynamicField: "event_name",
                x: 210,
                y: 35,
                width: 360,
                height: 32,
                fontSize: 22,
                fontWeight: "800",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#ffffff",
                letterSpacing: 1,
                zIndex: 2,
                locked: false,
                hidden: false
            },
            {
                id: "event-tagline",
                type: "text",
                text: "OFFICIAL EVENT BADGE",
                dynamicField: null,
                x: 210,
                y: 70,
                width: 360,
                height: 18,
                fontSize: 10,
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#34d399",
                letterSpacing: 2,
                zIndex: 2,
                locked: false,
                hidden: false
            },
            {
                id: "participant-name",
                type: "text",
                text: "{{participant_name}}",
                dynamicField: "participant_name",
                x: 210,
                y: 115,
                width: 360,
                height: 30,
                fontSize: 22,
                fontWeight: "800",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#ffffff",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "category-badge",
                type: "shape",
                shapeType: "rectangle",
                x: 210,
                y: 155,
                width: 150,
                height: 24,
                fill: "rgba(16, 185, 129, 0.2)",
                stroke: "#10b981",
                strokeWidth: 1,
                borderRadius: 12,
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "participant-category",
                type: "text",
                text: "{{participant_category}}",
                dynamicField: "participant_category",
                x: 210,
                y: 158,
                width: 150,
                height: 18,
                fontSize: 11,
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                color: "#10b981",
                letterSpacing: 1,
                zIndex: 4,
                locked: false,
                hidden: false
            },
            {
                id: "team-name-txt",
                type: "text",
                text: "Team: {{team_name}}",
                dynamicField: "team_name",
                x: 210,
                y: 195,
                width: 360,
                height: 20,
                fontSize: 14,
                fontWeight: "600",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#94a3b8",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "college-name-txt",
                type: "text",
                text: "College: {{college_name}}",
                dynamicField: "college_name",
                x: 210,
                y: 225,
                width: 360,
                height: 18,
                fontSize: 12,
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#64748b",
                zIndex: 3,
                locked: false,
                hidden: false
            },
            {
                id: "date-venue-txt",
                type: "text",
                text: "{{event_date}}",
                dynamicField: "event_date",
                x: 210,
                y: 255,
                width: 360,
                height: 18,
                fontSize: 11,
                fontWeight: "500",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
                color: "#10b981",
                zIndex: 3,
                locked: false,
                hidden: false
            }
        ];

    const backElements = [
        {
            id: "back-header",
            type: "text",
            text: "EVENT GUIDELINES & PASS RULES",
            dynamicField: null,
            x: 20,
            y: 30,
            width: width - 40,
            height: 24,
            fontSize: 13,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#10b981",
            letterSpacing: 2,
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-1",
            type: "text",
            text: "• This credential is strictly non-transferable and must be presented at all entry checkpoints.",
            dynamicField: null,
            x: 30,
            y: 70,
            width: width - 60,
            height: 36,
            fontSize: 10,
            fontWeight: "400",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-2",
            type: "text",
            text: "• Participants must wear the badge visibly around the venue throughout the entire event duration.",
            dynamicField: null,
            x: 30,
            y: 115,
            width: width - 60,
            height: 36,
            fontSize: 10,
            fontWeight: "400",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-3",
            type: "text",
            text: "• For emergency assistance or lost badge reporting, please contact the Ayojan helpdesk.",
            dynamicField: null,
            x: 30,
            y: 160,
            width: width - 60,
            height: 36,
            fontSize: 10,
            fontWeight: "400",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-footer",
            type: "text",
            text: "Ayojan Event Management System • Authorized Print",
            dynamicField: null,
            x: 20,
            y: height - 40,
            width: width - 40,
            height: 20,
            fontSize: 9,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#64748b",
            letterSpacing: 1,
            zIndex: 2,
            locked: false,
            hidden: false
        }
    ];

    return {
        TemplateName: isPortrait ? "Standard CR80 Badge (Portrait)" : "Standard CR80 Badge (Landscape)",
        Orientation: orientation,
        CardWidth: isPortrait ? 53.98 : 85.60,
        CardHeight: isPortrait ? 85.60 : 53.98,
        Unit: "mm",
        FrontConfig: JSON.stringify({
            backgroundColor: "#09090b",
            backgroundImage: null,
            safeMargin: 15,
            elements: frontElements
        }),
        BackConfig: JSON.stringify({
            backgroundColor: "#09090b",
            backgroundImage: null,
            safeMargin: 15,
            elements: backElements
        }),
        IsDefault: 1,
        CardType: "id_card"
    };
};

/**
 * Creates standard Team Display Card default starter template configuration (Desk Tent format)
 */
const getDefaultTeamCardTemplateConfig = () => {
    const width = 750;
    const height = 475;

    const frontElements = [
        {
            id: "team-card-frame",
            type: "shape",
            shapeType: "rectangle",
            x: 10,
            y: 10,
            width: width - 20,
            height: height - 20,
            fill: "rgba(3, 7, 18, 0.95)",
            stroke: "#00e5ff",
            strokeWidth: 2,
            borderRadius: 16,
            zIndex: 1,
            locked: true,
            hidden: false
        },
        {
            id: "event-name-txt",
            type: "text",
            text: "{{event_name}}",
            dynamicField: "event_name",
            x: 30,
            y: 25,
            width: 360,
            height: 30,
            fontSize: 22,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#00e5ff",
            letterSpacing: 2,
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "event-tagline",
            type: "text",
            text: "OFFICIAL HACKATHON TEAM DISPLAY PASS",
            dynamicField: null,
            x: 30,
            y: 56,
            width: 360,
            height: 16,
            fontSize: 9,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#94a3b8",
            letterSpacing: 2,
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "college-name-txt",
            type: "text",
            text: "{{college_name}}",
            dynamicField: "college_name",
            x: 400,
            y: 26,
            width: 320,
            height: 24,
            fontSize: 12,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "right",
            color: "#ffffff",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "autonomous-tag",
            type: "text",
            text: "An Autonomous Institution • Verified Table Placard",
            dynamicField: null,
            x: 400,
            y: 50,
            width: 320,
            height: 14,
            fontSize: 8,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "right",
            color: "#64748b",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "divider-line",
            type: "shape",
            shapeType: "rectangle",
            x: 30,
            y: 74,
            width: 690,
            height: 2,
            fill: "#00e5ff",
            borderRadius: 1,
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "team-name-txt",
            type: "text",
            text: "{{team_name}}",
            dynamicField: "team_name",
            x: 30,
            y: 88,
            width: 470,
            height: 38,
            fontSize: 26,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#00e5ff",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "team-id-badge",
            type: "shape",
            shapeType: "rectangle",
            x: 30,
            y: 130,
            width: 140,
            height: 24,
            fill: "rgba(0, 229, 255, 0.15)",
            stroke: "#00e5ff",
            strokeWidth: 1,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "team-id-txt",
            type: "text",
            text: "TEAM-{{team_id}}",
            dynamicField: "team_id",
            x: 30,
            y: 134,
            width: 140,
            height: 18,
            fontSize: 11,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "placement-txt",
            type: "text",
            text: "Desk: {{placement}}",
            dynamicField: "placement",
            x: 180,
            y: 134,
            width: 320,
            height: 18,
            fontSize: 11,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "direction-txt",
            type: "text",
            text: "Wing: {{direction}}",
            dynamicField: "direction",
            x: 180,
            y: 154,
            width: 320,
            height: 16,
            fontSize: 10,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#94a3b8",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "ps-title-txt",
            type: "text",
            text: "Problem: {{problem_statement}}",
            dynamicField: "problem_statement",
            x: 30,
            y: 176,
            width: 470,
            height: 20,
            fontSize: 12,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#f8fafc",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "ps-domain-txt",
            type: "text",
            text: "Track: {{ps_domain}}",
            dynamicField: "ps_domain",
            x: 30,
            y: 198,
            width: 470,
            height: 16,
            fontSize: 10,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#38bdf8",
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "team-seq-box",
            type: "shape",
            shapeType: "rectangle",
            x: 520,
            y: 86,
            width: 90,
            height: 90,
            fill: "rgba(4, 18, 38, 0.9)",
            stroke: "#00e5ff",
            strokeWidth: 2,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "team-seq-label",
            type: "text",
            text: "TEAM",
            dynamicField: null,
            x: 520,
            y: 92,
            width: 90,
            height: 14,
            fontSize: 9,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "team-seq-val",
            type: "text",
            text: "{{team_id}}",
            dynamicField: "team_id",
            x: 520,
            y: 112,
            width: 90,
            height: 48,
            fontSize: 32,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#00e5ff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "qr-box",
            type: "qr",
            dynamicField: "qr_code",
            x: 625,
            y: 86,
            width: 90,
            height: 90,
            color: "#000000",
            bgColor: "#ffffff",
            borderRadius: 10,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "qr-label",
            type: "text",
            text: "SCAN TO EVALUATE",
            dynamicField: null,
            x: 625,
            y: 180,
            width: 90,
            height: 12,
            fontSize: 7,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#00e5ff",
            letterSpacing: 1,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-1-box",
            type: "shape",
            shapeType: "rectangle",
            x: 30,
            y: 226,
            width: 160,
            height: 130,
            fill: "rgba(6, 20, 44, 0.85)",
            stroke: "#00e5ff",
            strokeWidth: 2,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "member-1-photo",
            type: "image",
            dynamicField: "team_lead_photo",
            src: "",
            x: 80,
            y: 236,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2.5,
            borderColor: "#00e5ff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-1-name",
            type: "text",
            text: "{{team_lead_name}}",
            dynamicField: "team_lead_name",
            x: 35,
            y: 302,
            width: 150,
            height: 18,
            fontSize: 11,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-1-role",
            type: "text",
            text: "TEAM LEADER",
            dynamicField: null,
            x: 35,
            y: 322,
            width: 150,
            height: 14,
            fontSize: 9,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#00e5ff",
            letterSpacing: 1,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-2-box",
            type: "shape",
            shapeType: "rectangle",
            x: 205,
            y: 226,
            width: 160,
            height: 130,
            fill: "rgba(6, 20, 44, 0.85)",
            stroke: "rgba(0, 229, 255, 0.35)",
            strokeWidth: 1,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "member-2-photo",
            type: "image",
            dynamicField: "member_2_photo",
            src: "",
            x: 255,
            y: 236,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 1.5,
            borderColor: "#64748b",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-2-name",
            type: "text",
            text: "{{member_2_name}}",
            dynamicField: "member_2_name",
            x: 210,
            y: 302,
            width: 150,
            height: 18,
            fontSize: 11,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-2-role",
            type: "text",
            text: "MEMBER",
            dynamicField: null,
            x: 210,
            y: 322,
            width: 150,
            height: 14,
            fontSize: 9,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            letterSpacing: 1,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-3-box",
            type: "shape",
            shapeType: "rectangle",
            x: 380,
            y: 226,
            width: 160,
            height: 130,
            fill: "rgba(6, 20, 44, 0.85)",
            stroke: "rgba(0, 229, 255, 0.35)",
            strokeWidth: 1,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "member-3-photo",
            type: "image",
            dynamicField: "member_3_photo",
            src: "",
            x: 430,
            y: 236,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 1.5,
            borderColor: "#64748b",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-3-name",
            type: "text",
            text: "{{member_3_name}}",
            dynamicField: "member_3_name",
            x: 385,
            y: 302,
            width: 150,
            height: 18,
            fontSize: 11,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-3-role",
            type: "text",
            text: "MEMBER",
            dynamicField: null,
            x: 385,
            y: 322,
            width: 150,
            height: 14,
            fontSize: 9,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            letterSpacing: 1,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-4-box",
            type: "shape",
            shapeType: "rectangle",
            x: 555,
            y: 226,
            width: 160,
            height: 130,
            fill: "rgba(6, 20, 44, 0.85)",
            stroke: "rgba(0, 229, 255, 0.35)",
            strokeWidth: 1,
            borderRadius: 12,
            zIndex: 3,
            locked: false,
            hidden: false
        },
        {
            id: "member-4-photo",
            type: "image",
            dynamicField: "member_4_photo",
            src: "",
            x: 605,
            y: 236,
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 1.5,
            borderColor: "#64748b",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-4-name",
            type: "text",
            text: "{{member_4_name}}",
            dynamicField: "member_4_name",
            x: 560,
            y: 302,
            width: 150,
            height: 18,
            fontSize: 11,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#ffffff",
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "member-4-role",
            type: "text",
            text: "MEMBER",
            dynamicField: null,
            x: 560,
            y: 322,
            width: 150,
            height: 14,
            fontSize: 9,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#94a3b8",
            letterSpacing: 1,
            zIndex: 4,
            locked: false,
            hidden: false
        },
        {
            id: "footer-txt",
            type: "text",
            text: "Ayojan Hackathon Presentation Desk Card • Official Table Placard",
            dynamicField: null,
            x: 30,
            y: 440,
            width: 690,
            height: 18,
            fontSize: 9,
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#475569",
            letterSpacing: 1,
            zIndex: 3,
            locked: false,
            hidden: false
        }
    ];

    const backElements = [
        {
            id: "back-header",
            type: "text",
            text: "HACKATHON EVALUATION & TABLE GUIDELINES",
            dynamicField: null,
            x: 30,
            y: 35,
            width: width - 60,
            height: 24,
            fontSize: 14,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            color: "#00e5ff",
            letterSpacing: 2,
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-1",
            type: "text",
            text: "1. Keep this card visibly standing on your designated table during evaluation rounds.",
            dynamicField: null,
            x: 40,
            y: 80,
            width: width - 80,
            height: 30,
            fontSize: 11,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-2",
            type: "text",
            text: "2. Evaluators will scan the QR code to log in-person scores and feedback directly.",
            dynamicField: null,
            x: 40,
            y: 125,
            width: width - 80,
            height: 30,
            fontSize: 11,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        },
        {
            id: "back-rule-3",
            type: "text",
            text: "3. All team members must wear their official individual badges alongside this table pass.",
            dynamicField: null,
            x: 40,
            y: 170,
            width: width - 80,
            height: 30,
            fontSize: 11,
            fontWeight: "500",
            fontFamily: "Inter, sans-serif",
            textAlign: "left",
            color: "#cbd5e1",
            zIndex: 2,
            locked: false,
            hidden: false
        }
    ];

    return {
        TemplateName: "Official Cyber Desk Tent (Landscape)",
        Orientation: "landscape",
        CardWidth: 150,
        CardHeight: 95,
        Unit: "mm",
        CardType: "team_card",
        FrontConfig: JSON.stringify({
            backgroundColor: "#030712",
            backgroundImage: null,
            safeMargin: 15,
            elements: frontElements
        }),
        BackConfig: JSON.stringify({
            backgroundColor: "#030712",
            backgroundImage: null,
            safeMargin: 15,
            elements: backElements
        }),
        IsDefault: 1
    };
};

/**
 * Get all ID templates for an event (optionally filtered by cardType: 'id_card' | 'team_card')
 */
const getTemplatesByEvent = (EventId, cardType = 'id_card', callback) => {
    if (typeof cardType === 'function') {
        callback = cardType;
        cardType = 'id_card';
    }
    const targetType = cardType || 'id_card';

    const query = `
        SELECT * FROM id_card_templates 
        WHERE EventId = ? AND (CardType = ? OR (CardType IS NULL AND ? = 'id_card'))
        ORDER BY IsDefault DESC, CreatedAt DESC
    `;
    db.query(query, [EventId, targetType, targetType], (err, templates) => {
        if (err) {
            console.error("Get templates error:", err);
            return callback(err);
        }
        if (!templates || templates.length === 0) {
            // Seed a default starter template based on requested cardType
            const defaultConfig = targetType === 'team_card'
                ? getDefaultTeamCardTemplateConfig()
                : getDefaultTemplateConfig("portrait");

            const insertQuery = `
                INSERT INTO id_card_templates 
                (EventId, TemplateName, Orientation, CardWidth, CardHeight, Unit, FrontConfig, BackConfig, IsDefault, CardType)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `;
            db.query(
                insertQuery,
                [
                    EventId,
                    defaultConfig.TemplateName,
                    defaultConfig.Orientation,
                    defaultConfig.CardWidth,
                    defaultConfig.CardHeight,
                    defaultConfig.Unit,
                    defaultConfig.FrontConfig,
                    defaultConfig.BackConfig,
                    targetType
                ],
                (insertErr, insertRes) => {
                    if (insertErr) {
                        console.error("Default template creation error:", insertErr);
                        return callback(null, []);
                    }
                    getTemplatesByEvent(EventId, targetType, callback);
                }
            );
            return;
        }
        callback(null, templates);
    });
};

/**
 * Get single template by ID
 */
const getTemplateById = (EventId, TemplateId, callback) => {
    const query = `SELECT * FROM id_card_templates WHERE Id = ? AND EventId = ?`;
    db.query(query, [TemplateId, EventId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0] || null);
    });
};

/**
 * Save template (create or update)
 */
const saveTemplate = (EventId, templateData, callback) => {
    const {
        Id,
        TemplateName,
        Orientation = "portrait",
        CardWidth = 53.98,
        CardHeight = 85.60,
        Unit = "mm",
        FrontConfig,
        BackConfig,
        IsDefault = 0,
        CardType = "id_card"
    } = templateData;

    const frontJson = typeof FrontConfig === "object" ? JSON.stringify(FrontConfig) : FrontConfig;
    const backJson = typeof BackConfig === "object" ? JSON.stringify(BackConfig) : BackConfig;

    if (Id) {
        // Update existing template
        const updateQuery = `
            UPDATE id_card_templates 
            SET TemplateName = ?, Orientation = ?, CardWidth = ?, CardHeight = ?, Unit = ?, 
                FrontConfig = ?, BackConfig = ?, IsDefault = ?, CardType = ?
            WHERE Id = ? AND EventId = ?
        `;
        db.query(
            updateQuery,
            [TemplateName, Orientation, CardWidth, CardHeight, Unit, frontJson, backJson, IsDefault ? 1 : 0, CardType, Id, EventId],
            (err, result) => {
                if (err) return callback(err);
                if (IsDefault) {
                    db.query(
                        `UPDATE id_card_templates SET IsDefault = 0 WHERE EventId = ? AND CardType = ? AND Id != ?`,
                        [EventId, CardType, Id]
                    );
                }
                callback(null, { Id, ...templateData });
            }
        );
    } else {
        // Create new template
        const insertQuery = `
            INSERT INTO id_card_templates 
            (EventId, TemplateName, Orientation, CardWidth, CardHeight, Unit, FrontConfig, BackConfig, IsDefault, CardType)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            insertQuery,
            [EventId, TemplateName, Orientation, CardWidth, CardHeight, Unit, frontJson, backJson, IsDefault ? 1 : 0, CardType],
            (err, result) => {
                if (err) return callback(err);
                const newId = result.insertId;
                if (IsDefault) {
                    db.query(
                        `UPDATE id_card_templates SET IsDefault = 0 WHERE EventId = ? AND CardType = ? AND Id != ?`,
                        [EventId, CardType, newId]
                    );
                }
                callback(null, { Id: newId, ...templateData });
            }
        );
    }
};

/**
 * Duplicate a template
 */
const duplicateTemplate = (EventId, TemplateId, callback) => {
    getTemplateById(EventId, TemplateId, (err, original) => {
        if (err) return callback(err);
        if (!original) return callback(new Error("Original template not found"));

        const cloneName = `${original.TemplateName} (Copy)`;
        const targetCardType = original.CardType || 'id_card';
        const insertQuery = `
            INSERT INTO id_card_templates 
            (EventId, TemplateName, Orientation, CardWidth, CardHeight, Unit, FrontConfig, BackConfig, IsDefault, CardType)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        `;
        db.query(
            insertQuery,
            [
                EventId,
                cloneName,
                original.Orientation,
                original.CardWidth,
                original.CardHeight,
                original.Unit,
                original.FrontConfig,
                original.BackConfig,
                targetCardType
            ],
            (insertErr, result) => {
                if (insertErr) return callback(insertErr);
                callback(null, { Id: result.insertId, TemplateName: cloneName });
            }
        );
    });
};

/**
 * Delete a template
 */
const deleteTemplate = (EventId, TemplateId, callback) => {
    const query = `DELETE FROM id_card_templates WHERE Id = ? AND EventId = ?`;
    db.query(query, [TemplateId, EventId], (err, result) => {
        if (err) return callback(err);
        callback(null, { success: true, deleted: result.affectedRows > 0 });
    });
};

/**
 * Set a template as default (within its own CardType category)
 */
const setDefaultTemplate = (EventId, TemplateId, callback) => {
    getTemplateById(EventId, TemplateId, (getErr, tpl) => {
        if (getErr || !tpl) return callback(getErr || new Error("Template not found"));
        const cardType = tpl.CardType || 'id_card';

        db.query(
            `UPDATE id_card_templates SET IsDefault = 0 WHERE EventId = ? AND CardType = ?`,
            [EventId, cardType],
            (err) => {
                if (err) return callback(err);
                db.query(
                    `UPDATE id_card_templates SET IsDefault = 1 WHERE EventId = ? AND Id = ?`,
                    [EventId, TemplateId],
                    (updateErr, result) => {
                        if (updateErr) return callback(updateErr);
                        callback(null, { success: true });
                    }
                );
            }
        );
    });
};

/**
 * Enhanced query for all eligible participants with bound fields
 */
const getParticipantsByEvent = (EventId, callback) => {
    const query = `
        SELECT 
            u.Id AS UserId, 
            COALESCE(NULLIF(tm.MemberName, ''), u.UserName, 'Member') AS ParticipantName, 
            COALESCE(NULLIF(tm.MemberEmail, ''), u.Email, '') AS Email, 
            t.Id AS TeamId, 
            t.TeamName, 
            COALESCE(NULLIF(tm.MemberCollege, ''), u.College, t.College, 'College Not Specified') AS College, 
            'Engineering & Technology' AS Department,
            COALESCE(NULLIF(tm.Gender, ''), u.Gender, 'Male') AS Gender,
            COALESCE(tm.Photo, u.Photo) AS Photo,
            COALESCE(NULLIF(tm.Role, ''), CASE WHEN t.TeamLeadUserId = u.Id THEN 'Team Leader' ELSE 'Participant' END) AS ParticipantCategory,
            c.IdCardNumber, 
            c.VerificationToken,
            c.TemplateId,
            CASE WHEN c.Id IS NULL THEN 0 ELSE 1 END AS IdCardGenerated,
            COALESCE(ea.Status, 'not_checked_in') AS AttendanceStatus,
            ea.CheckInTime,
            ea.CheckOutTime,
            ea.CheckedInBy,
            ea.CheckedOutBy,
            ea.Remarks,
            e.EventName,
            e.Location AS EventLocation,
            COALESCE(e.PhysicalStartDate, e.StartDate) AS EventDate
        FROM event_registrations er 
        INNER JOIN events e ON e.Id = er.EventId
        INNER JOIN registered_teams t ON t.Id = er.TeamId 
        INNER JOIN registered_team_members tm ON tm.TeamId = t.Id 
        INNER JOIN users u ON u.Id = tm.UserId 
        LEFT JOIN participant_id_cards c ON c.EventId = er.EventId AND c.UserId = u.Id 
        LEFT JOIN event_attendance ea ON ea.EventId = er.EventId AND ea.UserId = u.Id
        WHERE er.EventId = ? AND er.ParticipationMode = 'Physical' AND er.Status = 'approved' 
        ORDER BY t.TeamName, ParticipantName
    `;

    db.query(query, [EventId], (err, result) => {
        if (err) {
            console.error("Get participants error:", err);
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Get all registered teams with their members for an event
 */
const getTeamsByEvent = (EventId, callback) => {
    const query = `
        SELECT 
            t.Id AS TeamId,
            t.TeamName,
            t.College,
            t.State,
            t.Tech_Stack,
            t.TeamSize,
            COALESCE(eps.Title, pps.Title, '') AS ProblemStatement,
            COALESCE(eps.Category, pps.Category, 'Software') AS ProblemCategory,
            u.UserName AS LeaderName,
            u.Email AS LeaderEmail,
            tm.UserId,
            COALESCE(NULLIF(tm.MemberName, ''), u2.UserName, 'Member') AS UserName,
            COALESCE(NULLIF(tm.MemberEmail, ''), u2.Email, '') AS Email,
            COALESCE(NULLIF(tm.Role, ''), CASE WHEN t.TeamLeadUserId = tm.UserId THEN 'Team Leader' ELSE 'Member' END) AS Role,
            COALESCE(NULLIF(tm.MemberCollege, ''), u2.College, t.College, '') AS MemberCollege,
            COALESCE(tm.Photo, u2.Photo, '') AS Photo
        FROM registered_teams t
        LEFT JOIN users u ON t.TeamLeadUserId = u.Id
        LEFT JOIN registered_team_members tm ON tm.TeamId = t.Id
        LEFT JOIN users u2 ON u2.Id = tm.UserId
        LEFT JOIN problem_statement_selections pss ON pss.TeamId = t.Id AND pss.EventId = t.EventId
        LEFT JOIN event_problem_statements eps ON eps.Id = pss.ProblemStatementId
        LEFT JOIN participant_problem_statements pps ON pps.TeamId = t.Id AND pps.EventId = t.EventId
        WHERE t.EventId = ?
        ORDER BY t.Id, CASE WHEN LOWER(COALESCE(tm.Role, '')) LIKE '%lead%' OR t.TeamLeadUserId = tm.UserId THEN 1 ELSE 2 END, tm.Id
    `;

    db.query(query, [EventId], (err, rows) => {
        if (err) {
            console.error("Get teams error:", err);
            return callback(err, null);
        }

        const teamsMap = {};
        (rows || []).forEach((r, idx) => {
            if (!teamsMap[r.TeamId]) {
                teamsMap[r.TeamId] = {
                    TeamId: r.TeamId,
                    TeamName: r.TeamName,
                    College: r.College,
                    State: r.State,
                    LeaderName: r.LeaderName,
                    LeaderEmail: r.LeaderEmail,
                    TeamSize: r.TeamSize,
                    ProblemStatement: r.ProblemStatement || r.Tech_Stack || 'Campus Innovation Challenge',
                    Category: r.ProblemCategory || 'Software & AI',
                    Placement: `Desk ${r.TeamId}`,
                    Direction: 'Main Arena',
                    members: []
                };
            }
            if (r.UserId || r.UserName) {
                teamsMap[r.TeamId].members.push({
                    UserId: r.UserId,
                    UserName: r.UserName,
                    Email: r.Email,
                    Role: r.Role,
                    College: r.MemberCollege,
                    Photo: r.Photo
                });
            }
        });

        return callback(null, Object.values(teamsMap));
    });
};

/**
 * Start or update batch generation and assign secure unique tokens
 */
const startBatchGeneration = (EventId, { templateId = null, participantIds = null }, callback) => {
    // 1. Verify event exists
    db.query("SELECT Id, EventName, IDCardEnabled FROM events WHERE Id = ?", [EventId], (eventErr, events) => {
        if (eventErr) return callback(eventErr);
        if (!events || events.length === 0) {
            const err = new Error("Event not found.");
            err.status = 404;
            return callback(err);
        }

        // 2. Fetch eligible participants
        getParticipantsByEvent(EventId, (partErr, participants) => {
            if (partErr) return callback(partErr);
            if (!participants || participants.length === 0) {
                return callback(null, {
                    batchId: null,
                    total: 0,
                    processed: 0,
                    success: 0,
                    failed: 0,
                    participants: [],
                    message: "No eligible physical participants found for this event."
                });
            }

            const targetParticipants = Array.isArray(participantIds) && participantIds.length > 0
                ? participants.filter(p => participantIds.includes(p.UserId))
                : participants;

            const totalCount = targetParticipants.length;

            // 3. Create batch record
            const batchInsertQuery = `
                INSERT INTO id_card_batches (EventId, TemplateId, Status, TotalParticipants, ProcessedCount, SuccessCount)
                VALUES (?, ?, 'processing', ?, 0, 0)
            `;
            db.query(batchInsertQuery, [EventId, templateId, totalCount], (batchErr, batchRes) => {
                if (batchErr) return callback(batchErr);
                const batchId = batchRes.insertId;

                // 4. Upsert participant_id_cards with IdCardNumber and secure non-guessable VerificationToken
                let successCount = 0;
                let failedCount = 0;

                const upsertPromises = targetParticipants.map(participant => {
                    return new Promise((resolve) => {
                        const cardNumber = participant.IdCardNumber || `EV${EventId}-U${participant.UserId}`;
                        const token = participant.VerificationToken || crypto.randomBytes(16).toString("hex");

                        const upsertQuery = `
                            INSERT INTO participant_id_cards (EventId, UserId, IdCardNumber, VerificationToken, TemplateId, GeneratedAt)
                            VALUES (?, ?, ?, ?, ?, NOW())
                            ON DUPLICATE KEY UPDATE
                                IdCardNumber = COALESCE(IdCardNumber, VALUES(IdCardNumber)),
                                VerificationToken = COALESCE(VerificationToken, VALUES(VerificationToken)),
                                TemplateId = COALESCE(VALUES(TemplateId), TemplateId),
                                GeneratedAt = NOW()
                        `;
                        db.query(upsertQuery, [EventId, participant.UserId, cardNumber, token, templateId], (upErr) => {
                            if (upErr) {
                                console.error(`Error upserting card for user ${participant.UserId}:`, upErr);
                                failedCount++;
                            } else {
                                successCount++;
                                participant.IdCardNumber = cardNumber;
                                participant.VerificationToken = token;
                                participant.IdCardGenerated = 1;
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(upsertPromises).then(() => {
                    // 5. Update batch status to completed
                    const status = failedCount === totalCount ? "failed" : "completed";
                    const updateBatchQuery = `
                        UPDATE id_card_batches 
                        SET Status = ?, ProcessedCount = ?, SuccessCount = ?, FailedCount = ?,
                            SummaryText = ?
                        WHERE Id = ?
                    `;
                    const summary = `Generated ${successCount} of ${totalCount} participant ID cards. ${failedCount > 0 ? `${failedCount} failures.` : ""}`;
                    db.query(updateBatchQuery, [status, totalCount, successCount, failedCount, summary, batchId], (finErr) => {
                        callback(null, {
                            batchId,
                            status,
                            total: totalCount,
                            processed: totalCount,
                            success: successCount,
                            failed: failedCount,
                            participants: targetParticipants,
                            message: summary
                        });
                    });
                });
            });
        });
    });
};

/**
 * Get batch generation status
 */
const getBatchStatus = (EventId, BatchId, callback) => {
    const query = `SELECT * FROM id_card_batches WHERE Id = ? AND EventId = ?`;
    db.query(query, [BatchId, EventId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0] || null);
    });
};

/**
 * Unified Verification by VerificationToken OR IdCardNumber
 */
const verifyParticipantId = (EventId, UserId, IdCardNumber, token, callback) => {
    let whereClause = "";
    let params = [];

    if (token) {
        whereClause = "c.VerificationToken = ?";
        params = [token];
    } else {
        whereClause = "c.EventId = ? AND (c.UserId = ? OR ? IS NULL) AND c.IdCardNumber = ?";
        params = [EventId, UserId || null, UserId || null, IdCardNumber];
    }

    const query = `
        SELECT 
            c.IdCardNumber, 
            c.VerificationToken,
            u.Id AS UserId,
            COALESCE(NULLIF(tm.MemberName, ''), u.UserName, 'Participant') AS ParticipantName, 
            u.Email,
            t.TeamName, 
            COALESCE(NULLIF(tm.MemberCollege, ''), u.College, t.College, 'College Not Specified') AS College, 
            'Engineering & Technology' AS Department,
            COALESCE(NULLIF(tm.Role, ''), CASE WHEN t.TeamLeadUserId = u.Id THEN 'Team Leader' ELSE 'Participant' END) AS ParticipantCategory,
            e.Id AS EventId,
            e.EventName, 
            COALESCE(e.PhysicalStartDate, e.StartDate) AS StartDate, 
            e.Location,
            COALESCE(ea.Status, 'not_checked_in') AS AttendanceStatus,
            ea.CheckInTime,
            ea.CheckOutTime
        FROM participant_id_cards c 
        INNER JOIN events e ON e.Id = c.EventId 
        INNER JOIN users u ON u.Id = c.UserId 
        INNER JOIN event_registrations er ON er.EventId = c.EventId AND er.Status = 'approved' AND er.ParticipationMode = 'Physical' 
        INNER JOIN registered_teams t ON t.Id = er.TeamId 
        INNER JOIN registered_team_members tm ON tm.TeamId = t.Id AND tm.UserId = c.UserId 
        LEFT JOIN event_attendance ea ON ea.EventId = c.EventId AND ea.UserId = c.UserId
        WHERE ${whereClause}
        LIMIT 1
    `;

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("Verify participant ID error:", err);
            return callback(err, null);
        }
        callback(null, result[0] || null);
    });
};

/**
 * Legacy generateParticipantIds compatibility
 */
const generateParticipantIds = (EventId, callback) => {
    startBatchGeneration(EventId, {}, (err, result) => {
        if (err) return callback(err);
        callback(null, {
            generated: result.success,
            message: result.message
        });
    });
};

// Check-in participant with exact timestamp
const recordCheckIn = (EventId, UserId, checkedInBy, remarks, callback) => {
    const query = `
        INSERT INTO event_attendance (EventId, UserId, Status, CheckInTime, CheckedInBy, Remarks)
        VALUES (?, ?, 'checked_in', NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE 
            Status = 'checked_in', 
            CheckInTime = COALESCE(CheckInTime, NOW()), 
            CheckedInBy = COALESCE(?, CheckedInBy), 
            Remarks = COALESCE(?, Remarks)
    `;
    db.query(query, [EventId, UserId, checkedInBy || 'Admin', remarks || null, checkedInBy || 'Admin', remarks || null], (err, result) => {
        if (err) {
            console.error("Record check-in error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Participant checked in successfully." });
    });
};

// Check-out participant with exact timestamp
const recordCheckOut = (EventId, UserId, checkedOutBy, remarks, callback) => {
    const query = `
        INSERT INTO event_attendance (EventId, UserId, Status, CheckOutTime, CheckedOutBy, Remarks)
        VALUES (?, ?, 'checked_out', NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE 
            Status = 'checked_out', 
            CheckOutTime = NOW(), 
            CheckedOutBy = COALESCE(?, CheckedOutBy), 
            Remarks = COALESCE(?, Remarks)
    `;
    db.query(query, [EventId, UserId, checkedOutBy || 'Admin', remarks || null, checkedOutBy || 'Admin', remarks || null], (err, result) => {
        if (err) {
            console.error("Record check-out error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Participant checked out successfully." });
    });
};

// Reset attendance status
const resetAttendance = (EventId, UserId, callback) => {
    const query = `
        UPDATE event_attendance 
        SET Status = 'not_checked_in', CheckInTime = NULL, CheckOutTime = NULL, CheckedInBy = NULL, CheckedOutBy = NULL 
        WHERE EventId = ? AND UserId = ?
    `;
    db.query(query, [EventId, UserId], (err, result) => {
        if (err) {
            console.error("Reset attendance error:", err);
            return callback(err, null);
        }
        callback(null, { success: true, message: "Attendance status reset to pending." });
    });
};

// Instant scan / toggle check-in & check-out by ID Card Number or Token
const scanAttendance = (EventId, scanKey, operatorName, callback) => {
    const trimmed = String(scanKey || '').trim();
    const findQuery = `
        SELECT c.UserId, u.UserName AS ParticipantName, t.TeamName, COALESCE(ea.Status, 'not_checked_in') AS CurrentStatus
        FROM participant_id_cards c
        INNER JOIN users u ON u.Id = c.UserId
        INNER JOIN event_registrations er ON er.EventId = c.EventId AND er.Status = 'approved' AND er.ParticipationMode = 'Physical'
        INNER JOIN registered_teams t ON t.Id = er.TeamId
        INNER JOIN registered_team_members tm ON tm.TeamId = t.Id AND tm.UserId = c.UserId
        LEFT JOIN event_attendance ea ON ea.EventId = c.EventId AND ea.UserId = c.UserId
        WHERE c.EventId = ? AND (c.IdCardNumber = ? OR c.VerificationToken = ? OR u.Id = ?)
        LIMIT 1
    `;
    const numId = Number(trimmed.replace(/\D/g, ''));
    db.query(findQuery, [EventId, trimmed, trimmed, numId || 0], (err, rows) => {
        if (err) return callback(err);
        if (!rows || rows.length === 0) {
            return callback(null, { notFound: true, message: `No active participant found for key: ${trimmed}` });
        }

        const participant = rows[0];
        const nextStatus = participant.CurrentStatus === 'checked_in' ? 'checked_out' : 'checked_in';

        if (nextStatus === 'checked_in') {
            recordCheckIn(EventId, participant.UserId, operatorName || 'Admin Scanner', 'Scanned at gate', (cErr) => {
                if (cErr) return callback(cErr);
                callback(null, {
                    action: 'checked_in',
                    participantName: participant.ParticipantName,
                    teamName: participant.TeamName,
                    message: `✅ ${participant.ParticipantName} (${participant.TeamName}) checked in successfully.`
                });
            });
        } else {
            recordCheckOut(EventId, participant.UserId, operatorName || 'Admin Scanner', 'Scanned at exit gate', (cErr) => {
                if (cErr) return callback(cErr);
                callback(null, {
                    action: 'checked_out',
                    participantName: participant.ParticipantName,
                    teamName: participant.TeamName,
                    message: `👋 ${participant.ParticipantName} (${participant.TeamName}) checked out successfully.`
                });
            });
        }
    });
};

module.exports = {
    getTemplatesByEvent,
    getTemplateById,
    saveTemplate,
    duplicateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    getParticipantsByEvent,
    getTeamsByEvent,
    startBatchGeneration,
    getBatchStatus,
    verifyParticipantId,
    generateParticipantIds,
    recordCheckIn,
    recordCheckOut,
    resetAttendance,
    scanAttendance
};