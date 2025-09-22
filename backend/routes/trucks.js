const express = require('express');
const router = express.Router();
const {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  updateTruckLocation,
  deleteTruck
} = require('../controllers/trucksController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCollectionTruck } = require('../middleware/validation');

// Protected routes (admin/operator only)
router.get('/', authenticateToken, authorizeRoles('admin', 'operator'), getAllTrucks);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'operator'), getTruckById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operator'), validateCollectionTruck, createTruck);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operator'), updateTruck);
router.patch('/:id/location', authenticateToken, authorizeRoles('admin', 'operator'), updateTruckLocation);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteTruck);

module.exports = router;
