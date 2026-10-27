const express = require('express');
const router = express.Router();
const focusController = require('../controllers/focusController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/stats', focusController.getFocusStats);
router.post('/record', focusController.recordCompletedSession);

module.exports = router;
