import express from 'express';
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todoController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All todo routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllTodos);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;
