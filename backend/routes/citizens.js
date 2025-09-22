const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  loginCitizen,
  getAllCitizens,
  getCitizenById,
  updateCitizen,
  deactivateCitizen,
  getCurrentUser
} = require('../controllers/citizensController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCitizen } = require('../middleware/validation');

// Public routes
router.post('/register', validateCitizen, registerCitizen);
router.post('/login', loginCitizen);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, authorizeRoles('admin', 'operator'), getAllCitizens);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'operator'), getCitizenById);
router.put('/:id', authenticateToken, updateCitizen);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deactivateCitizen);

module.exports = router;
