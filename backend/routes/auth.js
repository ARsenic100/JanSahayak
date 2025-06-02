const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  signup,
  login,
  getAllUsers,
  verifyUser,
  removeUser,
  createUser,
  getAllEmployees,
  getEmployeeById,
  searchEmployees,
  getMyProfile,
  updatePassword
} = require('../controllers/authController');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (admin only)
router.get('/users', adminAuth, getAllUsers);
router.post('/users', adminAuth, createUser);
router.post('/verify-user/:userId', adminAuth, verifyUser);
router.delete('/users/:userId', adminAuth, removeUser);

// Employee routes (admin only)
router.get('/employees', adminAuth, getAllEmployees);
router.get('/employees/search', adminAuth, searchEmployees);
router.get('/employees/:id', adminAuth, getEmployeeById);

// Employee routes (authenticated)
router.get('/profile', auth, getMyProfile);
router.put('/profile/password', auth, updatePassword);

module.exports = router;