const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth rate limiting to all routes
router.use(authLimiter);

// Login endpoint
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

  // Simple username/password check
  if (username !== adminUsername) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if the stored password is hashed or plain text
  let isValidPassword;
  if (adminPassword.startsWith('$2')) {
    // Password is hashed with bcrypt
    isValidPassword = await bcrypt.compare(password, adminPassword);
  } else {
    // Fallback to plain text comparison (not recommended)
    console.warn('⚠️  Using plain text password. Consider using hashed passwords in production.');
    isValidPassword = password === adminPassword;
  }
  
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = generateToken({
    username: adminUsername,
    role: 'admin',
    iat: Date.now()
  });

  res.json({
    success: true,
    token,
    user: {
      username: adminUsername,
      role: 'admin'
    }
  });
}));

// Check authentication status
router.get('/check', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    authenticated: true,
    user: {
      username: req.user.username,
      role: req.user.role
    }
  });
}));

// Logout (client-side token removal)
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;