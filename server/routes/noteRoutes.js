const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.patch('/:id/pin', noteController.togglePin);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
