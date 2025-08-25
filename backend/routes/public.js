const express = require('express');
const { param, validationResult } = require('express-validator');
const { publicLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const fileManager = require('../utils/fileManager');

const router = express.Router();

// Apply public rate limiting
router.use(publicLimiter);

// Get public playable info (without authentication)
router.get('/playable/:id', [
  param('id').isUUID().withMessage('Invalid playable ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const metadata = await fileManager.loadMetadata();
  
  const playable = metadata.playables[id];
  if (!playable) {
    return res.status(404).json({ error: 'Playable not found' });
  }

  // Check if file actually exists
  const exists = await fileManager.fileExists(playable.filename);
  if (!exists) {
    return res.status(404).json({ error: 'Playable file not found' });
  }

  // Return only public information
  res.json({
    id: playable.id,
    name: playable.name,
    version: playable.version,
    size: playable.size,
    formattedSize: fileManager.formatFileSize(playable.size),
    uploadDate: playable.uploadDate
  });
}));

// Get playable file content for embedding
router.get('/playable/:id/content', [
  param('id').isUUID().withMessage('Invalid playable ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const metadata = await fileManager.loadMetadata();
  
  const playable = metadata.playables[id];
  if (!playable) {
    return res.status(404).json({ error: 'Playable not found' });
  }

  // Check if file actually exists
  const exists = await fileManager.fileExists(playable.filename);
  if (!exists) {
    return res.status(404).json({ error: 'Playable file not found' });
  }

  // Return file URL for client to fetch
  res.json({
    id: playable.id,
    name: playable.name,
    version: playable.version,
    fileUrl: `/uploads/${playable.filename}`,
    embedUrl: `/play/${id}`
  });
}));

// Health check for public endpoints
router.get('/health', asyncHandler(async (req, res) => {
  const metadata = await fileManager.loadMetadata();
  const totalPlayables = Object.keys(metadata.playables).length;
  
  res.json({
    status: 'healthy',
    service: 'playable-viewer-public',
    timestamp: new Date().toISOString(),
    stats: {
      totalPlayables,
      totalFolders: metadata.folders.length
    }
  });
}));

module.exports = router;