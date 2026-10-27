const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/forgot-password/question', authController.getSecurityQuestion);
router.post('/forgot-password/reset', authController.resetPassword);

// Protected routes
router.post('/logout', ensureAuthenticated, authController.logout);
router.get('/me', ensureAuthenticated, authController.getMe);
router.put('/profile', ensureAuthenticated, authController.updateProfile);
router.put('/change-password', ensureAuthenticated, authController.changePassword);
router.delete('/account', ensureAuthenticated, authController.deleteAccount);

module.exports = router;
