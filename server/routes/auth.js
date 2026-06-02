const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Clean jsonwebtoken package native use
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // 1. Guard: Check for missing input text fields
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Please provide email, password, and your designated role.' });
  }

  // 2. Guard: Find the user and explicitly include password field if hidden by default in the schema
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // 3. Guard: Verify if the selected role tab matches the database record
  if (user.role !== role.toUpperCase()) {
    return res.status(401).json({ error: 'Invalid credentials or unauthorized role access.' });
  }

  // 4. Guard: Secure password string hash comparison
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // 5. Secure Token Generation with explicit secret string fallback guard
  const secretKey = process.env.JWT_SECRET || 'fallback_backup_secret_key_medicare';
  
  const token = jwt.sign(
    { _id: user._id, role: user.role }, 
    secretKey, 
    { expiresIn: '1d' }
  );

  // Strip password reference explicitly before returning data payload
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

module.exports = router;