const db = require('../src/config/db');

const EVENT_ID = 35; // InnovateX 2026 Physical Hackathon

async function registerRealTeams() {
  console.log(`Starting clean registration of existing platform users for Event ${EVENT_ID}...`);

  // 1. Clean existing registrations for Event 35 if any
  await new Promise((resolve) => {
    db.query('DELETE FROM registered_teams WHERE EventId = ?', [EVENT_ID], (err) => {
      if (err) console.warn('Clean error:', err.message);
      else console.log('Cleaned any prior test registrations for Event 35.');
      resolve();
    });
  });

  // 2. Fetch problem statements for Event 35
  const problemStatements = await new Promise((resolve) => {
    db.query(
      'SELECT Id, ProblemCode, Title FROM event_problem_statements WHERE EventId = ? ORDER BY DisplayOrder ASC',
      [EVENT_ID],
      (err, rows) => {
        if (err) {
          console.error('Error fetching PS:', err.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      }
    );
  });

  const psMap = new Map();
  problemStatements.forEach((ps) => psMap.set(ps.ProblemCode, ps.Id));
  console.log(`Available Problem Statements for Event 35:`, Array.from(psMap.keys()));

  // 3. Define the teams using verified existing users from the platform
  const teamsToRegister = [
    {
      teamName: 'Quantum Circuits',
      college: 'AITAM COLLEGE',
      state: 'Andhra Pradesh',
      problemCode: 'PS-PHY-01',
      needsAccommodation: true,
      needsFood: true,
      leadEmail: 'bhargavanaidujaddu@gmail.com', // ID: 15
      memberEmails: [
        'saisakethbikkina@gmail.com',         // ID: 2
        'hemanthvavilapalli25@gmail.com'      // ID: 42
      ]
    },
    {
      teamName: 'Neural Visionaries',
      college: 'Aitam',
      state: 'Andhra Pradesh',
      problemCode: 'PS-PHY-02',
      needsAccommodation: true,
      needsFood: true,
      leadEmail: 'sai@gmail.com',              // ID: 13
      memberEmails: [
        'sanju@gmail.com',                    // ID: 14
        '24a51a0575@adityatekkali.edu.in'     // ID: 40
      ]
    },
    {
      teamName: 'Cipher Knights',
      college: 'GIET',
      state: 'Andhra Pradesh',
      problemCode: 'PS-PHY-03',
      needsAccommodation: false,
      needsFood: true,
      leadEmail: 'nagalaxmijada50@gmail.com',  // ID: 36
      memberEmails: [
        'baratamdedeepya3@gmail.com'          // ID: 41
      ]
    },
    {
      teamName: 'EcoDrones Hub',
      college: 'Test College 1',
      state: 'Andhra Pradesh',
      problemCode: 'PS-PHY-04',
      needsAccommodation: true,
      needsFood: true,
      leadEmail: 'testuser1@test.com',         // ID: 43
      memberEmails: [
        'testuser2@test.com',                 // ID: 44
        'testuser3@test.com'                  // ID: 45
      ]
    },
    {
      teamName: 'Apex Innovators',
      college: 'Test College 2',
      state: 'Telangana',
      problemCode: null,                      // Pending selection for admin demo
      needsAccommodation: true,
      needsFood: true,
      leadEmail: 'testuser11@test.com',        // ID: 53
      memberEmails: [
        'testuser12@test.com'                 // ID: 54
      ]
    }
  ];

  // Helper to fetch user by email
  const getUserByEmail = async (email) => {
    return new Promise((resolve) => {
      db.query(
        'SELECT Id, UserName, Email, College, State, Gender FROM users WHERE LOWER(Email) = ? LIMIT 1',
        [email.trim().toLowerCase()],
        (err, rows) => {
          resolve(rows && rows.length > 0 ? rows[0] : null);
        }
      );
    });
  };

  for (const tConfig of teamsToRegister) {
    const lead = await getUserByEmail(tConfig.leadEmail);
    if (!lead) {
      console.error(`Leader with email ${tConfig.leadEmail} not found!`);
      continue;
    }

    const members = [];
    for (const memEmail of tConfig.memberEmails) {
      const mem = await getUserByEmail(memEmail);
      if (mem) {
        members.push(mem);
      }
    }

    const totalTeamSize = 1 + members.length;
    const teamCollege = tConfig.college || lead.College || 'AITAM';
    const teamState = tConfig.state || lead.State || 'Andhra Pradesh';

    // 1. Insert into registered_teams
    const teamInsertRes = await new Promise((resolve) => {
      const sql = `
        INSERT INTO registered_teams (
          TeamName, TeamLeadUserId, TeamSize, College, State, EventId, Tech_Stack
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [tConfig.teamName, lead.Id, totalTeamSize, teamCollege, teamState, EVENT_ID, 'React, Python, Embedded C, ROS, PyTorch'],
        (err, res) => {
          if (err) {
            console.error(`Error inserting team ${tConfig.teamName}:`, err.message);
            resolve(null);
          } else {
            resolve(res);
          }
        }
      );
    });

    if (!teamInsertRes || !teamInsertRes.insertId) continue;
    const teamId = teamInsertRes.insertId;
    console.log(`\nCreated Team #${teamId}: "${tConfig.teamName}"`);
    console.log(`  Lead: ${lead.UserName} (${lead.Email})`);

    // 2. Insert into event_registrations (correct columns: EventId, TeamId, ParticipationMode, Status)
    await new Promise((resolve) => {
      const regSql = `
        INSERT INTO event_registrations (EventId, TeamId, ParticipationMode, Status)
        VALUES (?, ?, 'Physical', 'approved')
      `;
      db.query(regSql, [EVENT_ID, teamId], (err) => {
        if (err) console.warn('Reg warning:', err.message);
        resolve();
      });
    });

    // 3. Insert Team Lead into registered_team_members
    await new Promise((resolve) => {
      const leadMemberSql = `
        INSERT INTO registered_team_members (
          UserId, TeamId, Role, Gender, MemberName, MemberEmail, MemberCollege, MemberState
        ) VALUES (?, ?, 'TeamLead', ?, ?, ?, ?, ?)
      `;
      db.query(
        leadMemberSql,
        [lead.Id, teamId, lead.Gender || 'Male', lead.UserName, lead.Email, teamCollege, teamState],
        (err) => {
          if (err) console.warn('Lead member warning:', err.message);
          resolve();
        }
      );
    });

    // 4. Insert Members into registered_team_members
    for (const mem of members) {
      console.log(`  Member: ${mem.UserName} (${mem.Email})`);
      await new Promise((resolve) => {
        const memSql = `
          INSERT INTO registered_team_members (
            UserId, TeamId, Role, Gender, MemberName, MemberEmail, MemberCollege, MemberState
          ) VALUES (?, ?, 'member', ?, ?, ?, ?, ?)
        `;
        db.query(
          memSql,
          [mem.Id, teamId, mem.Gender || 'Male', mem.UserName, mem.Email, mem.College || teamCollege, mem.State || teamState],
          (err) => {
            if (err) console.warn('Member warning:', err.message);
            resolve();
          }
        );
      });
    }

    // 5. Insert physical_team_preferences (Accommodation & Food Dining Pass)
    await new Promise((resolve) => {
      const prefSql = `
        INSERT INTO physical_team_preferences (
          TeamId, EventId, AccommodationRequested, FoodAccepted, BookingStatus, TotalAmount, PaymentRefId
        ) VALUES (?, ?, ?, ?, 'Approved', 500.00, 'UPI-REF-PHY-${teamId}')
        ON DUPLICATE KEY UPDATE
          AccommodationRequested = VALUES(AccommodationRequested),
          FoodAccepted = VALUES(FoodAccepted),
          BookingStatus = 'Approved'
      `;
      db.query(
        prefSql,
        [teamId, EVENT_ID, tConfig.needsAccommodation ? 1 : 0, tConfig.needsFood ? 1 : 0],
        (err) => {
          if (err) console.warn('Pref warning:', err.message);
          resolve();
        }
      );
    });

    // 6. Assign Selected Problem Statement if configured
    if (tConfig.problemCode && psMap.has(tConfig.problemCode)) {
      const psId = psMap.get(tConfig.problemCode);
      await new Promise((resolve) => {
        const selSql = `
          INSERT INTO problem_statement_selections (
            EventId, TeamId, ProblemStatementId, SelectionType
          ) VALUES (?, ?, ?, 'manual')
          ON DUPLICATE KEY UPDATE ProblemStatementId = VALUES(ProblemStatementId)
        `;
        db.query(selSql, [EVENT_ID, teamId, psId], (err) => {
          if (err) console.warn('PS selection warning:', err.message);
          else console.log(`  Assigned Problem Statement: ${tConfig.problemCode} (PS ID: ${psId})`);
          resolve();
        });
      });
    } else {
      console.log(`  Problem Statement: PENDING SELECTION (unassigned)`);
    }
  }

  console.log('\n======================================================');
  console.log(`SUCCESSFULLY REGISTERED 5 PHYSICAL TEAMS FOR EVENT ${EVENT_ID}!`);
  console.log('Registered Teams:');
  console.log(' 1. Quantum Circuits (Lead: Bhargav, PS: PS-PHY-01, Accommodation: Yes)');
  console.log(' 2. Neural Visionaries (Lead: Sai, PS: PS-PHY-02, Accommodation: Yes)');
  console.log(' 3. Cipher Knights (Lead: Padma, PS: PS-PHY-03, Accommodation: No)');
  console.log(' 4. EcoDrones Hub (Lead: Test User 1, PS: PS-PHY-04, Accommodation: Yes)');
  console.log(' 5. Apex Innovators (Lead: Test User 11, PS: Pending, Accommodation: Yes)');
  console.log('======================================================\n');
  process.exit(0);
}

registerRealTeams();
