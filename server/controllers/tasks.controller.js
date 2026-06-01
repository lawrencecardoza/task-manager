const { validationResult } = require('express-validator');
const { initDb } = require('../config/db');

const VALID_STATUSES = ['To Do', 'In Progress', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

async function getTasks(req, res, next) {
  try {
    const db = await initDb();
    
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (req.query.projectId) {
      query += ' AND project_id = ?';
      params.push(req.query.projectId);
    } else if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query += ' AND status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY created_at DESC';

    const tasks = await db.all(query, params);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description = '', status = 'To Do', priority = 'Medium', due_date = null, project_id = null } = req.body;
    const db = await initDb();

    const result = await db.run(
      'INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, project_id, title.trim(), description.trim(), status, priority, due_date]
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.id;
    const db = await initDb();

    const existing = await db.get(
      'SELECT title, description, status, priority, due_date FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const newTitle = req.body.title !== undefined ? req.body.title.trim() : existing.title;
    const newDescription = req.body.description !== undefined ? req.body.description.trim() : existing.description;
    const newStatus = req.body.status !== undefined ? req.body.status : existing.status;
    const newPriority = req.body.priority !== undefined ? req.body.priority : existing.priority;
    const newDueDate = req.body.due_date !== undefined ? req.body.due_date : existing.due_date;

    if (!newTitle) {
      return res.status(400).json({ error: 'Task title cannot be empty.' });
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    if (!VALID_PRIORITIES.includes(newPriority)) {
      return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [newTitle, newDescription, newStatus, newPriority, newDueDate, taskId, req.user.id]
    );

    const updated = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const taskId = req.params.id;
    const db = await initDb();

    const existing = await db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
