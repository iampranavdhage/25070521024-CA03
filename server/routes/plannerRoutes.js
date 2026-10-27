const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', plannerController.getSchedule);
router.post('/', plannerController.createSession);
router.put('/:id', plannerController.updateSession);
router.delete('/:id', plannerController.deleteSession);

module.exports = router;
