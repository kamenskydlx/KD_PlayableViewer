const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const fileManager = require('../utils/fileManager');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Temporary filename, will be renamed after processing
    cb(null, `temp_${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow HTML files
  if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
    cb(null, true);
  } else {
    cb(new Error('Only HTML files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    files: 1
  }
});

// All routes require authentication
router.use(authenticateToken);

// Get all playables (admin only)
router.get('/', asyncHandler(async (req, res) => {
  const metadata = await fileManager.loadMetadata();
  
  // Add formatted file sizes and additional info
  const playablesWithInfo = {};
  for (const [id, playable] of Object.entries(metadata.playables)) {
    playablesWithInfo[id] = {
      ...playable,
      formattedSize: fileManager.formatFileSize(playable.size),
      exists: await fileManager.fileExists(playable.filename)
    };
  }

  res.json({
    playables: playablesWithInfo,
    folders: metadata.folders,
    total: Object.keys(metadata.playables).length
  });
}));

// Get single playable details
router.get('/:id', [
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

  const exists = await fileManager.fileExists(playable.filename);
  
  res.json({
    ...playable,
    formattedSize: fileManager.formatFileSize(playable.size),
    exists
  });
}));

// Upload new playable
router.post('/upload', upload.single('playable'), [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('version').optional().trim().isLength({ max: 20 }).withMessage('Version must be max 20 characters'),
  body('folder').optional().trim().isLength({ max: 50 }).withMessage('Folder name must be max 50 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { name, version = '1.0.0', folder = '' } = req.body;
  const playableId = fileManager.generateUniqueId();

  try {
    // Save and validate the uploaded file
    const fileName = await fileManager.saveUploadedFile(req.file, playableId);
    
    // Get file size
    const filePath = fileManager.getFilePath(fileName);
    const fileSize = await fileManager.getFileSize(filePath);

    // Load current metadata
    const metadata = await fileManager.loadMetadata();

    // Add folder to folders list if it doesn't exist and is not empty
    if (folder && !metadata.folders.includes(folder)) {
      metadata.folders.push(folder);
    }

    // Create playable entry
    metadata.playables[playableId] = {
      id: playableId,
      name,
      version,
      folder: folder || '',
      filename: fileName,
      originalFilename: fileManager.sanitizeFileName(req.file.originalname),
      size: fileSize,
      uploadDate: new Date().toISOString()
    };

    // Save updated metadata
    await fileManager.saveMetadata(metadata);

    res.status(201).json({
      success: true,
      playable: {
        ...metadata.playables[playableId],
        formattedSize: fileManager.formatFileSize(fileSize)
      }
    });

  } catch (error) {
    // Clean up uploaded file if processing failed
    if (req.file && req.file.path) {
      try {
        await fileManager.deleteFile(path.basename(req.file.path));
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    
    throw error;
  }
}));

// Update playable metadata
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid playable ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('version').optional().trim().isLength({ max: 20 }).withMessage('Version must be max 20 characters'),
  body('folder').optional().trim().isLength({ max: 50 }).withMessage('Folder name must be max 50 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { name, version, folder } = req.body;
  
  const metadata = await fileManager.loadMetadata();
  
  if (!metadata.playables[id]) {
    return res.status(404).json({ error: 'Playable not found' });
  }

  // Update playable data
  const playable = metadata.playables[id];
  if (name !== undefined) playable.name = name;
  if (version !== undefined) playable.version = version;
  if (folder !== undefined) {
    playable.folder = folder;
    // Add folder to folders list if it doesn't exist and is not empty
    if (folder && !metadata.folders.includes(folder)) {
      metadata.folders.push(folder);
    }
  }
  
  playable.updatedDate = new Date().toISOString();

  // Save updated metadata
  await fileManager.saveMetadata(metadata);

  res.json({
    success: true,
    playable: {
      ...playable,
      formattedSize: fileManager.formatFileSize(playable.size)
    }
  });
}));

// Delete playable
router.delete('/:id', [
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
  
  if (!metadata.playables[id]) {
    return res.status(404).json({ error: 'Playable not found' });
  }

  const playable = metadata.playables[id];
  
  // Delete the file
  await fileManager.deleteFile(playable.filename);
  
  // Remove from metadata
  delete metadata.playables[id];
  
  // Clean up empty folders
  const usedFolders = new Set(Object.values(metadata.playables).map(p => p.folder).filter(Boolean));
  metadata.folders = metadata.folders.filter(folder => usedFolders.has(folder));
  
  // Save updated metadata
  await fileManager.saveMetadata(metadata);

  res.json({
    success: true,
    message: 'Playable deleted successfully'
  });
}));

// Get folders list
router.get('/folders/list', asyncHandler(async (req, res) => {
  const metadata = await fileManager.loadMetadata();
  
  // Get folder statistics
  const folderStats = {};
  for (const playable of Object.values(metadata.playables)) {
    const folder = playable.folder || 'Uncategorized';
    if (!folderStats[folder]) {
      folderStats[folder] = { count: 0, totalSize: 0 };
    }
    folderStats[folder].count++;
    folderStats[folder].totalSize += playable.size;
  }

  res.json({
    folders: metadata.folders,
    stats: folderStats
  });
}));

module.exports = router;