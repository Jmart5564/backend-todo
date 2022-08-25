const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
// const authorize = require('../middleware/authorize');
const Todo = require('../models/Todo');
module.exports = Router();

module.exports = Router()
  .get('/', authenticate, async (req, res, next) => {
    try {
      const todos = await Todo.getAll(req.user.id);
      res.json(todos);
    } catch (e) {
      next(e);
    }
  })
  .post('/', authenticate, async (req, res, next) => {
    try {
      const newTodo = await Todo.insert({ ...req.body, user_id: req.user.id });
      res.json(newTodo);
    } catch (e) {
      next(e);
    }
  });
