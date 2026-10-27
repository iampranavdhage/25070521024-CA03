const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', activityController.getActivities);
router.delete('/', activityController.clearActivities);

module.exports = router;
