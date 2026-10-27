const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.post('/:id/toggle', habitController.toggleCompletion);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
