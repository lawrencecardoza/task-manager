const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasks.controller');

const router = Router();

const VALID_STATUSES = ['To Do', 'In Progress', 'Completed'];

const createValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 200 })
    .withMessage('Task title must not exceed 200 characters.'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
];

const updateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty.')
    .isLength({ max: 200 })
    .withMessage('Task title must not exceed 200 characters.'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
];

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createValidation, createTask);
router.put('/:id', updateValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
