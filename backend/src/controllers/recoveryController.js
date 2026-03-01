import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Config
const TOKEN_BYTES = 32; // token length
const TOKEN_EXPIRY_MINUTES = 15; // short-lived
const MAX_PIN_ATTEMPTS = 5; // lock after this many failed attempts
const LOCK_DURATION_MINUTES = 15;

// Helper: generic response with isValid flag
function genericResponse(res, isValid = false) {
  return res.json({ message: 'If the credentials are valid the next step was initiated.', isValid });
}

export const startRecovery = async (req, res) => {
  console.log('startRecovery called');
  try {
    const { username } = req.body;
    console.log('startRecovery body', req.body);
    if (!username) return res.status(400).json({ error: 'Invalid credentials' });

    // Find user and check role_id (superadmin only)
    const [rows] = await db.query('SELECT user_id, role_id FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      // Do not reveal existence
      console.log('startRecovery: no user found');
      return genericResponse(res, false);
    }

    const user = rows[0];

    // Check if user is superadmin (role_id = 3)
    if (user.role_id !== 3) {
      console.log('startRecovery: not superadmin');
      // Do not reveal role check failure
      return genericResponse(res, false);
    }

    // Ensure there is a recovery_attempts record
    await db.query(
      `INSERT INTO recovery_attempts (user_id, failed_attempts, lock_until, last_attempt_at)
       VALUES (?, 0, NULL, NOW())
       ON DUPLICATE KEY UPDATE last_attempt_at = NOW()`,
      [user.user_id]
    );

    console.log('startRecovery: success for user', user.user_id);
    // Respond with success flag
    return genericResponse(res, true);
  } catch (err) {
    console.error('startRecovery error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const verifyPin = async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) return res.status(400).json({ error: 'Invalid credentials' });

    // enforce 8-digit numeric PIN (security requirement)
    if (!/^[0-9]{8}$/.test(pin)) {
      // don't reveal specifics
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const [users] = await db.query('SELECT user_id, role_id FROM users WHERE username = ?', [username]);
    if (users.length === 0) return genericResponse(res, false);
    const user = users[0];
    
    // Check if user is superadmin (role_id = 3)
    if (user.role_id !== 3) {
      // Do not reveal role check failure
      return genericResponse(res, false);
    }
    
    const userId = user.user_id;

    // check recovery_attempts
    const [attemptRows] = await db.query('SELECT * FROM recovery_attempts WHERE user_id = ?', [userId]);
    let attempt = attemptRows[0];
    if (attempt && attempt.lock_until && new Date(attempt.lock_until) > new Date()) {
      return res.status(429).json({ error: 'Too many attempts. Try later.' });
    }

    // fetch recovery pin hash
    const [recRows] = await db.query('SELECT recovery_pin_hash FROM account_recovery WHERE user_id = ?', [userId]);
    if (recRows.length === 0) {
      // No recovery pin for this user — treat as generic failure
      // increment attempt count
      await incrementFailedAttempt(userId);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const { recovery_pin_hash } = recRows[0];
    const match = await bcrypt.compare(pin, recovery_pin_hash);
    if (!match) {
      await incrementFailedAttempt(userId);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // On success: reset attempts
    await db.query('UPDATE recovery_attempts SET failed_attempts = 0, lock_until = NULL, last_attempt_at = NOW() WHERE user_id = ?', [userId]);

    // generate short-lived token and store
    const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, 0)`,
      [userId, token, expiresAt]
    );

    // Return the token to frontend (frontend must keep in memory only)
    return res.json({ message: 'Pin verified', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { username, token, newPassword } = req.body;
    if (!username || !token || !newPassword) return res.status(400).json({ error: 'Invalid request' });

    const [users] = await db.query('SELECT user_id, role_id FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = users[0];
    
    // Check if user is superadmin (role_id = 3)
    if (user.role_id !== 3) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }
    
    const userId = user.user_id;

    // find token
    const [trows] = await db.query('SELECT * FROM password_reset_tokens WHERE token = ? AND user_id = ?', [token, userId]);
    if (trows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });
    const t = trows[0];
    if (t.used) return res.status(400).json({ error: 'Token already used' });
    if (new Date(t.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });

    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, userId]);

    // mark token used
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE pass_reset_token_id = ?', [t.pass_reset_token_id]);

    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
};

async function incrementFailedAttempt(userId) {
  const [rows] = await db.query('SELECT * FROM recovery_attempts WHERE user_id = ?', [userId]);
  if (rows.length === 0) {
    await db.query('INSERT INTO recovery_attempts (user_id, failed_attempts, lock_until, last_attempt_at) VALUES (?, 1, NULL, NOW())', [userId]);
    return;
  }

  const attempt = rows[0];
  const failed = (attempt.failed_attempts || 0) + 1;
  let lockUntil = null;
  if (failed >= MAX_PIN_ATTEMPTS) {
    lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
  }

  await db.query('UPDATE recovery_attempts SET failed_attempts = ?, lock_until = ?, last_attempt_at = NOW() WHERE user_id = ?', [failed, lockUntil, userId]);
}

