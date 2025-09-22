const express = require('express');
const router = express.Router();
const {
  getAllBins,
  getBinById,
  createBin,
  updateBin,
  updateBinFillLevel,
  markBinEmptied,
  deleteBin,
  getBinsNearLocation,
  getBinStatistics
} = require('../controllers/binsController');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { validateWasteBin } = require('../middleware/validation');

// Public routes (with optional auth for enhanced features)
router.get('/', optionalAuth, getAllBins);
router.get('/nearby', optionalAuth, getBinsNearLocation);
router.get('/statistics', optionalAuth, getBinStatistics);
router.get('/:id', optionalAuth, getBinById);

// Protected routes (admin/operator only)
router.post('/', authenticateToken, authorizeRoles('admin', 'operator'), validateWasteBin, createBin);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operator'), updateBin);
router.patch('/:id/fill-level', authenticateToken, authorizeRoles('admin', 'operator'), updateBinFillLevel);
router.patch('/:id/emptied', authenticateToken, authorizeRoles('admin', 'operator'), markBinEmptied);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteBin);

module.exports = router;
