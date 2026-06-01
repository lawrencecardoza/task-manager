const { initDb } = require('../config/db');

const projectsController = {
  getAll: async (req, res, next) => {
    try {
      const db = await initDb();
      const projects = await db.all(
        'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    const { name, description } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required.' });

    try {
      const db = await initDb();
      const result = await db.run(
        'INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)',
        [req.user.id, String(name).trim(), description ?? null]
      );
      const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [result.lastID]);
      res.status(201).json(newProject);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    const { name, description } = req.body;
    const { id } = req.params;

    try {
      const db = await initDb();
      const existing = await db.get('SELECT id, name, description FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      if (name !== undefined && !String(name).trim()) {
        return res.status(400).json({ error: 'Name cannot be empty.' });
      }

      const nextName = name !== undefined ? String(name).trim() : existing.name;
      const nextDescription = description !== undefined ? description : existing.description;

      await db.run(
        'UPDATE projects SET name = ?, description = ? WHERE id = ? AND user_id = ?',
        [nextName, nextDescription, id, req.user.id]
      );
      const updated = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const db = await initDb();
      const existing = await db.get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
      if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      await db.run('DELETE FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
      // Tasks are deleted automatically via ON DELETE CASCADE in schema
      res.json({ message: 'Project deleted.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = projectsController;
