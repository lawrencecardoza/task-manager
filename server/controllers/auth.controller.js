const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { initDb } = require('../config/db');

const SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const db = await initDb();

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    
    try {
      const result = await db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username.trim().toLowerCase(), hashed]
      );

      const token = jwt.sign(
        { id: result.lastID, username: username.trim().toLowerCase() },
        SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ token, username: username.trim().toLowerCase() });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'Username is already taken.' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const db = await initDb();

    const user = await db.get(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username.trim().toLowerCase()]
    );

    const isValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const db = await initDb();
    const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { username, email } = req.body;
    const db = await initDb();
    
    await db.run(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username.trim().toLowerCase(), email?.trim().toLowerCase(), req.user.id]
    );

    res.json({ message: 'Profile updated successfully', username, email });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Username or email already taken.' });
    }
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = await initDb();

    const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const db = await initDb();
    await db.run('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account and all associated data deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile, updateProfile, updatePassword, deleteAccount };
