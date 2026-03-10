const { query } = require('../config/db');

const buildTaskFilters = (userId, filters) => {
  const where = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (filters.status) {
    where.push(`status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push(`priority = $${idx++}`);
    params.push(filters.priority);
  }
  if (filters.search) {
    where.push(`title ILIKE $${idx++}`);
    params.push(`%${filters.search}%`);
  }
  if (filters.dueFrom) {
    where.push(`due_date >= $${idx++}`);
    params.push(filters.dueFrom);
  }
  if (filters.dueTo) {
    where.push(`due_date <= $${idx++}`);
    params.push(filters.dueTo);
  }

  return { whereClause: where.join(' AND '), params };
};

const getTasks = async (userId, filters = {}) => {
  const { whereClause, params } = buildTaskFilters(userId, filters);
  const result = await query(
    `SELECT id, user_id, title, description, status, priority, due_date, progress, created_at, updated_at
     FROM tasks
     WHERE ${whereClause}
     ORDER BY created_at DESC`,
    params
  );
  return result.rows;
};

const createTask = async (userId, payload) => {
  const {
    title,
    description = '',
    status = 'todo',
    priority = 'medium',
    dueDate = null,
    progress = 0
  } = payload;

  const result = await query(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date, progress)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, title, description, status, priority, due_date, progress, created_at, updated_at`,
    [userId, title, description, status, priority, dueDate, progress]
  );

  return result.rows[0];
};

const updateTask = async (userId, taskId, payload) => {
  const fields = [];
  const params = [taskId, userId];
  let idx = 3;

  if (payload.title !== undefined) {
    fields.push(`title = $${idx++}`);
    params.push(payload.title);
  }
  if (payload.description !== undefined) {
    fields.push(`description = $${idx++}`);
    params.push(payload.description);
  }
  if (payload.status !== undefined) {
    fields.push(`status = $${idx++}`);
    params.push(payload.status);
  }
  if (payload.priority !== undefined) {
    fields.push(`priority = $${idx++}`);
    params.push(payload.priority);
  }
  if (payload.dueDate !== undefined) {
    fields.push(`due_date = $${idx++}`);
    params.push(payload.dueDate);
  }
  if (payload.progress !== undefined) {
    fields.push(`progress = $${idx++}`);
    params.push(payload.progress);
  }

  if (fields.length === 0) {
    const err = new Error('No fields to update');
    err.statusCode = 400;
    throw err;
  }

  fields.push('updated_at = NOW()');

  const result = await query(
    `UPDATE tasks
     SET ${fields.join(', ')}
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, title, description, status, priority, due_date, progress, created_at, updated_at`,
    params
  );

  if (result.rows.length === 0) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const deleteTask = async (userId, taskId) => {
  const result = await query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [taskId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
};

const getTaskStats = async (userId) => {
  const totalRes = await query('SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1', [
    userId
  ]);
  const completedRes = await query(
    "SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1 AND status = 'completed'",
    [userId]
  );
  const pendingRes = await query(
    "SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1 AND status != 'completed'",
    [userId]
  );

  const total = totalRes.rows[0].count;
  const completed = completedRes.rows[0].count;
  const pending = pendingRes.rows[0].count;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    pending,
    completionRate
  };
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
