const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/metrics', analyticsController.getAnalytics);

module.exports = router;
