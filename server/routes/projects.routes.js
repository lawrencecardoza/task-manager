const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', projectsController.getAll);
router.post('/', projectsController.create);
router.put('/:id', projectsController.update);
router.delete('/:id', projectsController.delete);

module.exports = router;
