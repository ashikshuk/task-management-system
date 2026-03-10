const { validationResult } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../services/taskService');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
};

const listTasks = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status || undefined,
      priority: req.query.priority || undefined,
      search: req.query.search || undefined,
      dueFrom: req.query.dueFrom || undefined,
      dueTo: req.query.dueTo || undefined
    };
    const tasks = await getTasks(req.user.id, filters);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const createTaskHandler = async (req, res, next) => {
  try {
    handleValidation(req);
    const task = await createTask(req.user.id, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const updateTaskHandler = async (req, res, next) => {
  try {
    handleValidation(req);
    const taskId = Number(req.params.id);
    const task = await updateTask(req.user.id, taskId, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const deleteTaskHandler = async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    await deleteTask(req.user.id, taskId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getStatsHandler = async (req, res, next) => {
  try {
    const stats = await getTaskStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTasks,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  getStatsHandler
};
