const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Known test passwords mapping
const KNOWN_PASSWORDS = {
  'swathi@gmail.com': 'swathi123',
  'saisakethbikkina@gmail.com': 'saketh123',
  'naga@gmail.com': 'naga123',
  'papa@gmail.com': 'papa123',
  'siddu1@gmail.com': 'siddu123',
  'siddu@gmail.com': 'siddu123',
  'renu@gmail.com': 'renu123',
  'nani@gmail.com': 'nani123',
  'chanti@gmail.com': 'chanti123',
  'saketh@example.com': 'saketh123',
  'saketh@gmail.com': 'saketh123',
  'testuser@gmail.com': 'password123',
  'testuser2026@gmail.com': 'password123',
  'hacksprint@gmail.com': 'password123',
  'mukhi@gmail.com': 'password123',
  'sai@gmail.com': 'password123',
  'sanju@gmail.com': 'password123',
  'bhargavanaidujaddu@gmail.com': 'password123',
};

// GET /api/dev/accounts - Get all user accounts with roles, event details & evaluators
router.get('/accounts', (req, res) => {
  const userQuery = `
    SELECT 
      u.Id, 
      u.UserName, 
      u.Email, 
      u.Mobile, 
      u.Gender, 
      u.College, 
      u.Location,
      u.State,
      u.RoleId, 
      r.RoleName, 
      u.EventId,
      e.EventName,
      e.Location AS EventLocation,
      e.EventType,
      e.HackathonMode,
      e.StartDate AS EventStartDate,
      e.EndDate AS EventEndDate,
      u.CreatedAt
    FROM users u
    JOIN roles r ON u.RoleId = r.Id
    LEFT JOIN events e ON u.EventId = e.Id
    ORDER BY u.RoleId ASC, u.Id ASC
  `;

  const evalQuery = `
    SELECT 
      ev.Id,
      ev.Name AS UserName,
      ev.Username,
      ev.Email,
      ev.PlainTextPassword,
      ev.Track,
      ev.College,
      ev.Role AS EvaluatorRole,
      ev.Status,
      ev.EventId,
      ev.CreatedAt,
      e.EventName,
      e.Location AS EventLocation,
      e.EventType,
      e.HackathonMode,
      e.StartDate AS EventStartDate,
      e.EndDate AS EventEndDate
    FROM evaluators ev
    LEFT JOIN events e ON ev.EventId = e.Id
    ORDER BY ev.Id ASC
  `;

  db.query(userQuery, (err, userRows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }

    db.query(evalQuery, (evalErr, evalRows) => {
      const users = (userRows || []).map((user) => {
        const emailLower = (user.Email || '').toLowerCase();
        const knownPass = KNOWN_PASSWORDS[emailLower] || 'password123';
        
        let portal = '/user/login';
        let dashboard = '/user/dashboard';
        if (user.RoleName === 'super_admin') {
          portal = '/superadmin/login';
          dashboard = '/sidebar';
        } else if (user.RoleName === 'admin') {
          portal = '/admin/login';
          dashboard = '/admin/dashboard';
        }

        return {
          ...user,
          testPassword: knownPass,
          portalPath: portal,
          dashboardPath: dashboard,
        };
      });

      const evaluators = (evalRows || []).map((ev) => {
        return {
          ...ev,
          Id: `eval_${ev.Id}`,
          evaluatorId: ev.Id,
          isEvaluator: true,
          RoleName: 'evaluator',
          RoleDisplay: ev.EvaluatorRole || 'Jury / Evaluator',
          testPassword: ev.PlainTextPassword || 'Eval@2026',
          portalPath: '/evaluator/login',
          dashboardPath: '/evaluator/dashboard'
        };
      });

      const allAccounts = [...users, ...evaluators];

      res.json({
        success: true,
        total: allAccounts.length,
        superAdmins: allAccounts.filter(a => a.RoleName === 'super_admin').length,
        organizers: allAccounts.filter(a => a.RoleName === 'admin').length,
        participants: allAccounts.filter(a => a.RoleName === 'user').length,
        evaluators: evaluators.length,
        accounts: allAccounts
      });
    });
  });
});

// POST /api/dev/reset-password - Quick reset password for any test user
router.post('/reset-password', async (req, res) => {
  const { userId, email, newPassword = 'password123', isEvaluator } = req.body;
  if (!userId && !email) {
    return res.status(400).json({ success: false, message: 'User ID or Email is required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isEvaluator || (typeof userId === 'string' && userId.startsWith('eval_'))) {
      const cleanId = typeof userId === 'string' && userId.startsWith('eval_') ? userId.replace('eval_', '') : userId;
      const q = cleanId
        ? 'UPDATE evaluators SET Password = ?, PlainTextPassword = ? WHERE Id = ?'
        : 'UPDATE evaluators SET Password = ?, PlainTextPassword = ? WHERE LOWER(Email) = LOWER(?) OR LOWER(Username) = LOWER(?)';
      const params = cleanId ? [hashedPassword, newPassword, cleanId] : [hashedPassword, newPassword, email.trim(), email.trim()];

      db.query(q, params, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to reset evaluator password', error: err });
        return res.json({
          success: true,
          message: `Evaluator password updated to "${newPassword}"!`,
          newPassword
        });
      });
      return;
    }

    const query = userId
      ? 'UPDATE users SET Password = ? WHERE Id = ?'
      : 'UPDATE users SET Password = ? WHERE LOWER(Email) = LOWER(?)';
    const params = userId ? [hashedPassword, userId] : [hashedPassword, email.trim()];

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to reset password', error: err });
      }
      return res.json({
        success: true,
        message: `Password successfully updated to "${newPassword}"!`,
        newPassword
      });
    });
    return;
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// POST /api/dev/quick-login - Generates authentic JWT and returns session payload for 1-click login
router.post('/quick-login', (req, res) => {
  const { userId, email, evaluatorId, role } = req.body;
  if (!userId && !email && !evaluatorId) {
    return res.status(400).json({ success: false, message: 'User ID, Evaluator ID or Email is required' });
  }

  // Handle Evaluator 1-Click Login
  if (role === 'evaluator' || evaluatorId || (typeof userId === 'string' && userId.startsWith('eval_'))) {
    const cleanId = evaluatorId || (typeof userId === 'string' && userId.startsWith('eval_') ? userId.replace('eval_', '') : userId);
    const evalQuery = `
      SELECT ev.*, e.EventName, e.HackathonMode, e.Location AS EventLocation
      FROM evaluators ev
      LEFT JOIN events e ON ev.EventId = e.Id
      WHERE ${cleanId ? 'ev.Id = ?' : '(LOWER(ev.Email) = LOWER(?) OR LOWER(ev.Username) = LOWER(?))'}
      LIMIT 1
    `;
    const params = cleanId ? [cleanId] : [(email || '').trim(), (email || '').trim()];

    db.query(evalQuery, params, (eErr, eRows) => {
      if (eErr || !eRows || eRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Evaluator not found' });
      }
      const ev = eRows[0];
      delete ev.Password;

      const tokenPayload = {
        Id: ev.Id,
        Name: ev.Name,
        Email: ev.Email,
        Username: ev.Username,
        role: 'evaluator',
        EventId: ev.EventId,
        Track: ev.Track
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRECT || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        message: `Direct login successful as Evaluator ${ev.Name}`,
        token,
        user: {
          Id: ev.Id,
          Name: ev.Name,
          Email: ev.Email,
          Username: ev.Username,
          Role: ev.Role,
          Track: ev.Track,
          College: ev.College,
          EventId: ev.EventId,
          EventName: ev.EventName,
          role: 'evaluator'
        },
        role: 'evaluator',
        redirectPath: '/evaluator/dashboard'
      });
    });
    return;
  }

  const query = `
    SELECT 
      u.Id, 
      u.UserName, 
      u.Email, 
      u.Mobile, 
      u.RoleId, 
      r.RoleName, 
      u.EventId,
      e.EventName,
      e.HackathonMode
    FROM users u
    JOIN roles r ON u.RoleId = r.Id
    LEFT JOIN events e ON u.EventId = e.Id
    WHERE ${userId ? 'u.Id = ?' : 'LOWER(u.Email) = LOWER(?)'}
  `;

  db.query(query, [userId || email.trim()], (err, rows) => {
    if (err || !rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const u = rows[0];
    const roleName = u.RoleName;

    let tokenPayload = {
      Id: u.Id,
      UserName: u.UserName,
      Email: u.Email,
      role: roleName
    };

    let userSession = {
      Id: u.Id,
      UserName: u.UserName,
      Email: u.Email,
      Mobile: u.Mobile,
      role: roleName
    };

    let redirectPath = '/user/dashboard';

    if (roleName === 'super_admin') {
      redirectPath = '/sidebar';
    } else if (roleName === 'admin') {
      tokenPayload.EventId = u.EventId;
      tokenPayload.EventName = u.EventName;
      tokenPayload.HackathonMode = u.HackathonMode;
      tokenPayload.AdminName = u.UserName;

      userSession.EventId = u.EventId;
      userSession.EventName = u.EventName;
      userSession.HackathonMode = u.HackathonMode;
      userSession.AdminName = u.UserName;
      redirectPath = '/admin/dashboard';
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRECT || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: `Direct login successful as ${u.UserName} (${roleName})`,
      token,
      user: userSession,
      role: roleName,
      redirectPath
    });
  });
});

module.exports = router;
