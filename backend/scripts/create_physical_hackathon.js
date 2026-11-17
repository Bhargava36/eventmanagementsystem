const db = require('../src/config/db');

async function createPhysicalHackathon() {
  console.log('Connecting to database to create Physical Hackathon...');

  // 1. Create the Physical Hackathon Event
  const eventSql = `
    INSERT INTO events (
      EventName, Description, Facilities, Requirements, TeamSize,
      StartDate, EndDate, RegistrationStart, RegistrationEnd, Location,
      EventType, EventStatus, HackathonMode,
      PhysicalStartDate, PhysicalEndDate, PhysicalRegistrationStart, PhysicalRegistrationEnd,
      PhysicalFacilities, PhysicalRequirements,
      PhysicalPSMode, PhysicalPSPublished, PhysicalPSSelectionDeadline, PhysicalPSMaxTeamsPerStatement,
      ThemePublished, ProblemStatementsPublished, PSMaxTeamsPerStatement,
      RegistrationOpen, PhysicalRegistrationOpen, VirtualRegistrationOpen,
      AccommodationEnabled, FoodEnabled, IDCardEnabled,
      PrizeMoney, PhysicalPrizeMoney,
      PrimaryColor, SecondaryColor, TertiaryColor,
      PrimaryTextColor, SecondaryTextColor, TertiaryTextColor,
      Posters
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?
    )
  `;

  const eventParams = [
    'InnovateX 2026 Physical Hackathon',
    'Join our flagship 36-hour in-person physical hackathon at the University Innovation Hub. Build groundbreaking hardware and software solutions under premier innovation tracks with real-time mentorship, jury evaluations, prototype testing, and live hardware labs.',
    'High-Speed Wi-Fi 6\n24/7 Hardware & IoT Lab Access\nDedicated Team Cabins & Power Hubs\nOn-Campus Boys & Girls Hostel Accommodation\nCatered Meals, Snacks & Midnight Energy Refreshments\n3D Printers & Soldering Stations',
    'College Student ID Card\nPersonal Laptop with Chargers & Development Tools\nSigned Hardware Safety Consent Form\nValid Registration QR Pass',
    '2-4',
    '2026-12-05 09:00:00',
    '2026-12-06 18:00:00',
    '2026-11-01 00:00:00',
    '2026-12-04 23:59:59',
    'University Innovation Hub & Auditorium Complex, Block C',
    'Hackathon',
    'upcoming',
    'Physical',
    '2026-12-05 09:00:00',
    '2026-12-06 18:00:00',
    '2026-11-01 00:00:00',
    '2026-12-04 23:59:59',
    'Dedicated team workbenches with dual power monitors, 1Gbps fiber connectivity, oscilloscope & sensor development kits.',
    'All team members must check in on-campus before 09:00 AM on Day 1. Prototypes must be demonstrated live on physical hardware/software setups.',
    'organizer_provided', // PhysicalPSMode: Released by organisers
    1,                   // PhysicalPSPublished: 1 (published by organisers)
    '2026-12-05 11:30:00', // Selection deadline
    5,                   // Max teams per statement
    1,                   // ThemePublished: 1 (published)
    1,                   // ProblemStatementsPublished: 1 (published)
    5,
    1, 1, 0,             // RegistrationOpen=1, Physical=1, Virtual=0
    1, 1, 1,             // Accommodation=1, Food=1, IDCard=1
    'INR 1,50,000',
    'INR 1,50,000',
    '#059669', '#10B981', '#34D399',
    '#FFFFFF', '#FFFFFF', '#064E3B',
    JSON.stringify([
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80'
    ])
  ];

  db.query(eventSql, eventParams, async (err, result) => {
    if (err) {
      console.error('Failed to create event:', err);
      process.exit(1);
    }

    const eventId = result.insertId;
    console.log(`Successfully created Physical Hackathon! EventId: ${eventId}`);

    // 2. Insert Event Guidelines / Descriptions
    const guidelinesSql = `
      INSERT INTO event_descriptions (EventId, Description)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE Description = VALUES(Description)
    `;
    db.query(guidelinesSql, [
      eventId,
      'InnovateX is an elite on-campus physical hackathon gathering top student builders, developers, and hardware engineers. Organizers will release official problem statements across 5 tracks. Teams must select their statement before the selection deadline, build their working prototype on-site, and present to a jury panel on Day 2.'
    ], () => {});

    // 3. Insert Published Themes
    const themes = [
      {
        name: 'AI & Autonomous Systems',
        desc: 'Edge computer vision, embedded intelligence, local LLMs, and autonomous robotics.',
        order: 1
      },
      {
        name: 'Smart Campus & IoT Infrastructure',
        desc: 'Sensor networks, smart power management, connected utilities, and indoor navigation.',
        order: 2
      },
      {
        name: 'FinTech & Cyber Resilience',
        desc: 'Offline-capable transactions, biometric verification, fraud detection, and cryptographic protocols.',
        order: 3
      },
      {
        name: 'Healthcare & MedTech Innovations',
        desc: 'Point-of-care diagnostics, wearable telemetry, assistive robotics, and vital monitoring.',
        order: 4
      },
      {
        name: 'Sustainable Green Tech & Clean Energy',
        desc: 'Microgrid power balancing, carbon footprint analytics, and automated resource recycling.',
        order: 5
      }
    ];

    for (const t of themes) {
      db.query(
        'INSERT INTO event_themes (EventId, ThemeName, Description, DisplayOrder) VALUES (?, ?, ?, ?)',
        [eventId, t.name, t.desc, t.order],
        (tErr) => {
          if (tErr) console.warn(`Theme ${t.name} insert note:`, tErr.message);
        }
      );
    }
    console.log(`Inserted 5 published themes for EventId ${eventId}.`);

    // 4. Insert Problem Statements Released by Organisers
    const problemStatements = [
      {
        code: 'PS-PHY-01',
        title: 'Campus Smart Energy Grid and Predictive Load Balancer',
        desc: 'Develop an intelligent IoT sensor and actuator system to forecast electrical demand in academic blocks and automatically throttle HVAC/lighting during peak surge hours.',
        category: 'Hardware & IoT',
        theme: 'Smart Campus & IoT Infrastructure',
        maxTeams: 5,
        order: 1
      },
      {
        code: 'PS-PHY-02',
        title: 'Edge Computer Vision for Autonomous Wheelchair Navigation',
        desc: 'Design an onboard low-power edge compute module (Raspberry Pi / Jetson) that performs real-time obstacle avoidance, doorway alignment, and ramp detection for assistive mobility devices.',
        category: 'Embedded AI / Robotics',
        theme: 'Healthcare & MedTech Innovations',
        maxTeams: 5,
        order: 2
      },
      {
        code: 'PS-PHY-03',
        title: 'Offline-First Peer-to-Peer Campus Merchant Payment Verification',
        desc: 'Build a secure BLE / NFC and cryptographic proof-of-transaction payment verification protocol enabling student payments in cellular dead-zones without continuous internet connectivity.',
        category: 'Cyber Security & FinTech',
        theme: 'FinTech & Cyber Resilience',
        maxTeams: 5,
        order: 3
      },
      {
        code: 'PS-PHY-04',
        title: 'Autonomous Drone Pathfinding for Agricultural Pest Scouting',
        desc: 'Construct a vision-guided flight planner that analyzes multispectral foliage images in real time to locate crop blights and optimize localized biological pesticide deployment.',
        category: 'Robotics & Sustainability',
        theme: 'Sustainable Green Tech & Clean Energy',
        maxTeams: 5,
        order: 4
      },
      {
        code: 'PS-PHY-05',
        title: 'Privacy-Preserving Federated Medical Record Analysis',
        desc: 'Implement a decentralized machine learning system that allows hospitals to collaboratively train diagnostic models on vital statistics without exposing raw participant patient data.',
        category: 'Deep Learning & Privacy',
        theme: 'AI & Autonomous Systems',
        maxTeams: 5,
        order: 5
      }
    ];

    for (const ps of problemStatements) {
      db.query(
        'INSERT INTO event_problem_statements (EventId, ProblemCode, Title, Description, Category, Theme, MaxTeams, DisplayOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [eventId, ps.code, ps.title, ps.desc, ps.category, ps.theme, ps.maxTeams, ps.order],
        (psErr) => {
          if (psErr) console.warn(`PS ${ps.code} insert note:`, psErr.message);
        }
      );
    }
    console.log(`Inserted 5 organiser-provided problem statements for EventId ${eventId}.`);

    // 5. Insert Timeline Milestones
    const timeline = [
      {
        date: '05 Dec 2026 • 08:30 AM',
        heading: 'On-Campus Check-in, ID Badge Distribution & Breakfast',
        desc: 'Participants arrive at Block C, receive official scannable ID cards, event kits, and hostel room access keys.',
        order: 1
      },
      {
        date: '05 Dec 2026 • 10:00 AM',
        heading: 'Opening Ceremony & Problem Statement Briefing',
        desc: 'Inaugural address by jury leads, breakdown of problem statements released by the organisers, and evaluation rubric review.',
        order: 2
      },
      {
        date: '05 Dec 2026 • 11:00 AM',
        heading: 'Hacking Sprint 1 Begins & Statement Selection Opens',
        desc: 'Teams confirm their selected organiser problem statement and start system architecture and prototyping.',
        order: 3
      },
      {
        date: '05 Dec 2026 • 01:30 PM',
        heading: 'Networking Lunch & Hardware Component Desk',
        desc: 'Lending desk opens for microcontrollers, sensors, communication chips, and wiring harnesses.',
        order: 4
      },
      {
        date: '05 Dec 2026 • 04:30 PM',
        heading: 'Mentorship Round 1: Technical & Feasibility Review',
        desc: 'Industry mentors visit team workbenches to provide feedback on schematic design, architecture, and technology choice.',
        order: 5
      },
      {
        date: '05 Dec 2026 • 08:30 PM',
        heading: 'Dinner & Mid-Hack Progress Check',
        desc: 'Dining hall opens for hot meals. Teams submit their Milestone 1 GitHub progress commit.',
        order: 6
      },
      {
        date: '06 Dec 2026 • 01:00 AM',
        heading: 'Midnight Energy Snacks & Code-Jam',
        desc: 'Midnight snacks, coffee bars, and informal mentor troubleshooting for hardware integration bugs.',
        order: 7
      },
      {
        date: '06 Dec 2026 • 08:00 AM',
        heading: 'Breakfast & Sprint 2: Feature Freeze',
        desc: 'Morning breakfast followed by final prototype assembly, testing, and UI/demo polish.',
        order: 8
      },
      {
        date: '06 Dec 2026 • 11:30 AM',
        heading: 'Mentorship Round 2: Pitch Preparation',
        desc: 'Mentors assist with 3-minute pitch structuring, presentation slides, and live demonstration workflow.',
        order: 9
      },
      {
        date: '06 Dec 2026 • 02:00 PM',
        heading: 'Hacking Ends & Final Project Submission',
        desc: 'All coding and hardware modifications cease. Teams submit their repository and demo links.',
        order: 10
      },
      {
        date: '06 Dec 2026 • 02:30 PM',
        heading: 'Jury Evaluation & Live Prototype Booth Demos',
        desc: 'Jury visits team booths for live testing, code inspection, and Q&A defense.',
        order: 11
      },
      {
        date: '06 Dec 2026 • 05:30 PM',
        heading: 'Valedictory Ceremony & Prize Distribution',
        desc: 'Announcement of winners, podium presentation, trophy and prize money handover, and closing celebration.',
        order: 12
      }
    ];

    for (const tl of timeline) {
      db.query(
        'INSERT INTO event_timelines (EventId, Track, TimelineDate, Heading, Description, OrderIndex) VALUES (?, ?, ?, ?, ?, ?)',
        [eventId, 'Physical', tl.date, tl.heading, tl.desc, tl.order],
        (tlErr) => {
          if (tlErr) console.warn(`Timeline ${tl.heading} insert note:`, tlErr.message);
        }
      );
    }
    console.log(`Inserted 12 physical timeline milestones for EventId ${eventId}.`);

    // 6. Insert Event Prizes
    const prizes = [
      { rank: 1, prize: 'INR 75,000 + Champion Trophy + Hardware Incubation Fellowship' },
      { rank: 2, prize: 'INR 50,000 + Runner-up Trophy + Merit Certificates' },
      { rank: 3, prize: 'INR 25,000 + 2nd Runner-up Trophy + Tech Goodies Hamper' }
    ];
    for (const p of prizes) {
      db.query(
        'INSERT INTO event_prizes (EventId, PrizeRank, Prize) VALUES (?, ?, ?)',
        [eventId, p.rank, p.prize],
        (pErr) => {
          if (pErr) console.warn(`Prize rank ${p.rank} insert note:`, pErr.message);
        }
      );
    }
    console.log(`Inserted 3 prize tiers for EventId ${eventId}.`);

    // 7. Insert Accommodation Blocks (Boys and Girls) & Rooms
    db.query(
      'INSERT INTO accommodation_blocks (EventId, BlockName, Gender, Description) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [
        eventId, 'Aryabhata Boys Hostel Block', 'Boys', 'Equipped with 24/7 Wi-Fi, study desks, and power backup.',
        eventId, 'Gargi Girls Hostel Block', 'Girls', 'Equipped with secure access, 24/7 Wi-Fi, and power backup.'
      ],
      (abErr, abRes) => {
        if (!abErr && abRes?.insertId) {
          const boysBlockId = abRes.insertId;
          const girlsBlockId = abRes.insertId + 1;
          const roomsSql = `
            INSERT INTO Accommodation (EventId, BlockId, room_num, capacity, available_beds, gender)
            VALUES
              (?, ?, 'B-101', 4, 4, 'Boys'),
              (?, ?, 'B-102', 4, 4, 'Boys'),
              (?, ?, 'B-103', 4, 4, 'Boys'),
              (?, ?, 'G-201', 4, 4, 'Girls'),
              (?, ?, 'G-202', 4, 4, 'Girls'),
              (?, ?, 'G-203', 4, 4, 'Girls')
          `;
          db.query(roomsSql, [
            eventId, boysBlockId,
            eventId, boysBlockId,
            eventId, boysBlockId,
            eventId, girlsBlockId,
            eventId, girlsBlockId,
            eventId, girlsBlockId
          ], () => {
            console.log(`Created 6 accommodation rooms across 2 blocks for EventId ${eventId}.`);
          });
        }
      }
    );

    // 8. Associate Active Event Admins with this Event
    db.query('SELECT Id, Email, UserName FROM users WHERE RoleId = 2 LIMIT 3', (admErr, adminRows) => {
      if (!admErr && adminRows && adminRows.length > 0) {
        for (const admin of adminRows) {
          db.query(
            'INSERT IGNORE INTO event_admins (AdminId, EventId, Role) VALUES (?, ?, ?)',
            [admin.Id, eventId, 'Lead Organizer'],
            () => {}
          );
        }
        console.log(`Assigned ${adminRows.length} organizer admins to EventId ${eventId}.`);
      }

      console.log('\n======================================================');
      console.log('PHYSICAL HACKATHON CREATION COMPLETE!');
      console.log(`Event ID: ${eventId}`);
      console.log('Event Name: InnovateX 2026 Physical Hackathon');
      console.log('Mode: Physical (On-Campus)');
      console.log('Themes Published: 5 Themes');
      console.log('Problem Statements: 5 Organiser-Provided Statements Published');
      console.log('Timelines: 12 Rounds & Milestones Published');
      console.log('Prizes: 3 Ranks (INR 1,50,000 Total)');
      console.log('Accommodation: Configured & Enabled');
      console.log('======================================================\n');
      process.exit(0);
    });
  });
}

createPhysicalHackathon();

